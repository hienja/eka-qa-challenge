import brokersList from '../../server/services/InvoiceReport/fakedata/brokers.js';
import invoicesList from '../../server/services/InvoiceReport/fakedata/invoices.js';

const brokers = brokersList.map(function(value) {
	return { brokerName: value.name };
});
const invoices = invoicesList.map(function(value) {
	return {
		'Shipper Name': value.load.shipper.name,
		'EKA Load Nbr': value.load.iid + '',
		'Shipper Load Nbr': value.load.shipper_load_number + '',
		'Load Origin': value.load.lane.originCity.name + ', ' + value.load.lane.originCity.state.code,
		'Load Destination': value.load.lane.destinationCity.name + ', ' + value.load.lane.destinationCity.state.code,
		'Delivery Date': value.load.delivered_at.substring(0, 11),
		'Invoice Number': value.iid + '',
		'Invoice Amount': '$' + parseFloat(value.net_payable_cents / 100).toFixed(2)
	};
});

export default {
	brokers: brokers,
	invoices: invoices
};
