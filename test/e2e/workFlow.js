import config from '../../nightwatch.config.js';
import fs from 'fs';
import PDFJS from 'pdfjs-dist';
import fakedata from '../utils/fakedata.js';
import moment from 'moment';
import ExtractPDF from '../utils/utils.js';

const brokers = fakedata.brokers;
const invoices = fakedata.invoices;

module.exports = {
	before: function(browser) {
		if (fs.existsSync('./test.pdf')) {
			fs.unlinkSync('./test.pdf');
		}
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
					//TODO
					//Test broker's Name
					browser.assert.equal(brokers[0].brokerName, dataset.header.brokerName);
					//Test all Loads

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
