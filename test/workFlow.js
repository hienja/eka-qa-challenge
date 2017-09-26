import React from 'react';
let config = require('../nightwatch.config.js');
let fs = require('fs');
let PDFJS = require('pdfjs-dist');
let brokers = require('../server/services/InvoiceReport/fakedata/brokers.js').default;
let invoices = require('../server/services/InvoiceReport/fakedata/invoices.js').default;
let moment = require('moment');

brokers = brokers.map(function(value) {
	return { brokerName: value.name };
});
invoices = invoices.map(function(value) {
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

module.exports = {
	before: function(browser) {
		if (fs.existsSync('../test.pdf')) {
			fs.unlinkSync('../test.pdf');
		}
	},
	'Check for button': function(browser) {
		browser
			.url('localhost:3005')
			.waitForElementVisible('body')
			.assert.elementPresent('button.btn.btn-secondary')
			.click('button.btn.btn-secondary');
	},
	'Look at pdf': function(browser) {
		let data = new Uint8Array(fs.readFileSync('./test.pdf'));
		PDFJS.getDocument(data).then(function(pdfDocument) {
			pdfDocument.getPage(1).then(function(page) {
				page.getTextContent().then(function(content) {
					let list = content.items.map(function(value) {
						return value.str;
					});
					let structuredList = {};
					let getHeader = function(list) {
						let header = {};
						const lastHeaderWords = 'Invoice Date';
						const runDate = 'Run Date';
						const title = 'Daily Invoice Report';
						let condition = true;

						while (condition) {
							if (list[0].includes(runDate)) {
								header.runDate = list[0].split(' ')[2];
							} else if (list[0].includes(title)) {
								header.title = list[0];
							} else if (list[0].includes(lastHeaderWords)) {
								header.invoiceDate = list[0].split(' ')[2];
								condition = false;
							} else {
								header.brokerName = list[0];
							}
							list.shift();
						}

						return header;
					};
					let getColumnNames = function(list) {
						let columnNameList = [];
						const lastColumnName = 'Invoice Amount';
						let condition = true;
						while (condition) {
							columnNameList.push(list[0]);
							if (list[0].includes(lastColumnName)) {
								condition = false;
							}
							list.shift();
						}

						return columnNameList;
					};
					let getShipperInfo = function(list, columnNames) {
						let shipperList = [];
						while (list.length > 0) {
							let countLoadNumber = 0;

							for (let i = 1; Number.isInteger(Number(list[i])); i++) {
								countLoadNumber++;
							}
							shipperList.push({});
							let shipperInfo = shipperList[shipperList.length - 1];
							shipperInfo[columnNames[0]] = list[0];
							list.shift();
							shipperInfo['Loads'] = [];
							for (let k = 1; k < columnNames.length; k++) {
								let columnName = columnNames[k];
								let count = 0;

								while (count < countLoadNumber) {
									if (k === 1) {
										shipperInfo['Loads'].push({});
									}
									shipperInfo['Loads'][count][columnName] = list[0];
									list.shift();
									count++;
								}
							}
							shipperInfo['Invoice Amount'] = list[0];
							list.shift();
						}

						return shipperList;
					};

					/*
					{
						header: {
							runDate: string,
							brokerName: string,
							title: string,
							invoiceDate: string,

						},
						columnNames: ["Shipper Name", ....],
						shipperInfo: [
							{
								"Shipper Name": string,
								"Loads": [
									{
										"EKA Load Nbr": string,
										"Shipper Load Nbr": string,
										"Load Origin": string,
										"Load Destination": string,
										...
									},
									...
								]
								"Invoice Amount": string
							},
							...
						]
					}
					*/
					structuredList.header = getHeader(list);
					structuredList.columnNames = getColumnNames(list);
					structuredList.shipperInfo = getShipperInfo(list, structuredList.columnNames);
					console.log(structuredList);

					//TODO
					//Test broker's Name
					browser.assert.equal(brokers[0].brokerName, structuredList.header.brokerName);
					//Test all Loads
					//Test number of entries
					browser.assert.equal(
						invoices.reduce(function(acc) {
							return acc + 1;
						}, 0),
						structuredList.shipperInfo.reduce(function(acc, value) {
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
						structuredList.shipperInfo.reduce(function(acc, value) {
							return (
								acc +
								value.Loads.reduce(function(acc, value) {
									return acc + Number(value['Invoice Amount'].substring(1));
								}, 0)
							);
						}, 0)
					);
					//Test run date
					browser.assert.equal(moment().format('MM/DD/YYYY'), structuredList.header.runDate);
				});
			});
		});
		browser.end();
	}
};
