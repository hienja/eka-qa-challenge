// @flow
import fs from 'fs';
import pdf from 'html-pdf';
import moment from 'moment';
import {forIn, get} from 'lodash';
import LoadShipperInvoices from './fakedata/invoices';
import Brokers from './fakedata/brokers';
import formatCentsToDollars from '../../utils/formatCentsToDollars';

const jsdom = require('jsdom');

const {JSDOM} = jsdom;

const getModelRelated = (model: Object, relationName: string) => {
  return get(model, relationName);
};

export default class InvoiceReport {
  constructor() {
    // houses data for the pdf
    this.data = {};
    this.html = '';
  }

  async create() {
    this.getData();
    this.brokers.forEach(async (broker) => {
      const data = this.generateData(broker);
      const html = await this.generateBrokerHTML(data, broker);
      await this.createPdf(html);
    });
  }

  // grabs all invoices for previous day and all brokers
  getData() {
    // NOTE: this data actually normally comes from the database, but for this
    // challenge we x'd the database and provided you the data in the form of
    // the fakedata files that you can find in this directory
    this.invoices = LoadShipperInvoices;

    this.brokers = Brokers;
  }

  // given a broker, generate the data that is going into the pdf
  generateData(broker: Object) {
    const brokerData = {};

    const brokerInvoices = this.invoices.filter((model) =>
      model.broker_id === broker.id
    );

    const uniqueShippers = brokerInvoices.reduce((store, invoice) => {
      const shipperID = invoice.shipper_id;
      store[shipperID] = shipperID; // eslint-disable-line no-param-reassign
      return store;
    }, {});

    forIn(uniqueShippers, (id) => {
      brokerData[id] = this.generateShipperData(id);
    });

    return brokerData;
  }

  // given a shipper id, generate the shipper data (a row) that goes into pdf
  generateShipperData(shipperID: string) {
    const shipperInvoices = this.invoices.filter((invoice) => (
      invoice.shipper_id === shipperID
    ));

    // TODO: handle cases where no invoices found for shipper;
    if (!shipperInvoices) return null;

    // at this point, all invoices are from same shipper so we can grab name
    // from any one of the invoices
    const shipper = getModelRelated(shipperInvoices[0], 'load.shipper');
    const shipperName = shipper.name;

    const data = shipperInvoices.reduce((rowData, invoice) => {
      // grab load number
      const load = getModelRelated(invoice, 'load');
      rowData.loadNbrs.push(load.iid);

      // grab shipper load number
      rowData.shipperLoadNbr.push(load.shipper_load_number);

      // grab origin city and state
      const originCity = getModelRelated(invoice, 'load.lane.originCity');
      const originState = getModelRelated(invoice, 'load.lane.originCity.state');
      rowData.origin.push(`${originCity.name}, ${originState.code}`);

      // grab destination city and state
      const destinationCity = getModelRelated(invoice, 'load.lane.destinationCity');
      const destinationState = getModelRelated(invoice, 'load.lane.destinationCity.state');
      rowData.destination.push(`${destinationCity.name}, ${destinationState.code}`);

      // grab delivered dates
      const deliveredAt = load.delivered_at;
      rowData.deliveredDates.push(moment(deliveredAt).format('MM/DD/YY'));

      // grab invoice numbers
      rowData.invoiceNumbers.push(`${invoice.iid}`);

      // grab invoice amounts
      rowData.invoiceAmounts.push(`${invoice.net_payable_cents}`);

      return rowData;
    }, {
      shipperName,
      loadNbrs: [],
      shipperLoadNbr: [],
      origin: [],
      destination: [],
      deliveredDates: [],
      invoiceNumbers: [],
      invoiceAmounts: [],
    });

    return data;
  }

  async generateBrokerHTML(brokerData: Object, broker: Object) {
    // at this point in time, this.data should be an object with shipper names
    // as keys, and the value for that key is row data.
    if (!this.html.length) {
      this.html = this.readTemplate();
    }

    const cleanHTML = this.html;

    const brokerHTML = this.modifyTemplate(cleanHTML, brokerData, broker);
    return brokerHTML;
  }

  readTemplate() {
    return fs.readFileSync(
      `${__dirname}/templates/InvoiceReport.html`, 'utf8'
    );
  }

  modifyTemplate(html: string, brokerData: Object, broker: Object) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const table = doc.querySelector('table');

    // create the header
    const timestamp = doc.querySelector('#timestamp');
    timestamp.innerHTML = `Run Date ${moment().format('MM/DD/YYYY')}`;

    const header = doc.querySelector('#header');
    const brokerInfo = [
      `<div>${broker.name}</div>`,
      '<div>Daily Invoice Report</div>',
      `<div>Invoice Date: ${moment().subtract(1, 'days').format('MM/DD/YYYY')}</div>`,
    ];
    header.innerHTML = brokerInfo.join('');

    // create the table data
    forIn(brokerData, (data) => {
      const row = doc.createElement('tr');
      forIn(data, (values, type) => {
        if (type === 'shipperName') {
          const ele = doc.createElement('td');
          ele.innerHTML = values;
          row.appendChild(ele);
        } else if (type === 'invoiceAmounts') {
          const ele = doc.createElement('td');
          const formatted = values.map((value) => formatCentsToDollars(value));
          ele.innerHTML = formatted.join('<br/>');
          row.appendChild(ele);
        } else {
          const ele = doc.createElement('td');
          ele.innerHTML = values.join('<br/>');
          row.appendChild(ele);
        }
      });
      table.appendChild(row);

      // append the total for the invoices
      const totalRow = doc.createElement('tr');
      const total = formatCentsToDollars(
        data.invoiceAmounts.reduce((sum, val) => {
          sum += parseInt(val, 10); // eslint-disable-line no-param-reassign
          return sum;
        }, 0)
      );
      totalRow.innerHTML = `<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id="total">${total}</td>`;
      table.appendChild(totalRow);
    });

    return doc.documentElement.outerHTML;
  }

  createPdf(html: string) {
    return new Promise((resolve, reject) => {
      pdf.create(html).toFile('./test.pdf', (err, res) => {
        if (err) {
          console.log('Error occurred while creating pdf', err)
          reject();
        } else {
          console.log(`Successfully created pdf at ${res.filename}`);
          resolve();
        }
      });
    })
  }
}
