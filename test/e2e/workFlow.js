import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from '../../client/components/App.js';
import config from '../../nightwatch.config.js';
import fs from 'fs';
import PDFJS from 'pdfjs-dist';
import fakedata from '../utils/fakedata.js';
import moment from 'moment';
import ExtractPDF from '../utils/utils.js';

Enzyme.configure({ adapter: new Adapter() });
const brokers = fakedata.brokers;
const invoices = fakedata.invoices;

module.exports = {
	before: function(browser) {
		if (fs.existsSync('./test.pdf')) {
			fs.unlinkSync('./test.pdf');
		}
	},
	'Check App component': function(browser) {
		const wrapper = shallow(<App />);
		browser.assert.equal(wrapper.find('button.btn.btn-secondary').text(), 'Click Me');
	},
	'Check for button': function(browser) {
		browser
			.url('localhost:3005')
			.waitForElementVisible('body')
			.assert.elementPresent('button.btn.btn-secondary')
			.click('button.btn.btn-secondary')
			.pause(5000);
	},
	'Look at pdf': function(browser) {
		let testPDF = new Uint8Array(fs.readFileSync('./test.pdf'));
		PDFJS.getDocument(testPDF).then(function(pdfDocument) {
			pdfDocument.getPage(1).then(function(page) {
				page.getTextContent().then(function(content) {
					const dataset = new ExtractPDF(content);
					//Test broker's Name
					browser.assert.equal(brokers[0].brokerName, dataset.header.brokerName);
					//Test all Loads
					for (var i = 0; i < dataset.shipperInfo.length; i++) {
						for (var j = 0; j < dataset.shipperInfo[i].Loads.length; j++) {
							let check = invoices.filter(function(item) {
								return item['EKA Load Nbr'] == dataset.shipperInfo[i].Loads[j]['EKA Load Nbr'];
							});
							let condition = true;
							for (var key in check[0]) {
								if (key === 'Shipper Name') {
									if (check[0][key] != dataset.shipperInfo[i][key]) {
										condition = false;
									}
								} else {
									if (check[0][key] != dataset.shipperInfo[i].Loads[j][key]) {
										condition = false;
									}
								}
							}
							browser.assert.equal(condition, true);
						}
					}
					//Test number of entries
					browser.assert.equal(
						invoices.reduce(function(acc) {
							return acc + 1;
						}, 0),
						dataset.shipperInfo.reduce(function(acc, value) {
							return (
								acc +
								value.Loads.reduce(function(acc) {
									return acc + 1;
								}, 0)
							);
						}, 0)
					);
					//Test Shippers total
					browser.assert.equal(
						invoices.reduce(function(acc, value) {
							return acc + Number(value['Invoice Amount'].substring(1));
						}, 0),
						dataset.shipperInfo.reduce(function(acc, value) {
							return (
								acc +
								value.Loads.reduce(function(acc, value) {
									return acc + Number(value['Invoice Amount'].substring(1));
								}, 0)
							);
						}, 0)
					);
					//Test run date
					browser.assert.equal(moment().format('MM/DD/YYYY'), dataset.header.runDate);
				});
			});
		});
		browser.end();
	}
};
