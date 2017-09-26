let config = require('../nightwatch.config.js');
let fs = require('fs');
let PDFJS = require('pdfjs-dist');

module.exports = {
	// before: function(browser) {
	// 	if (fs.existsSync('./test.pdf')) {
	// 		fs.unlink('./test.pdf');
	// 	}
	// },
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
					console.log(content.items[0].transform);
					let list = content.items.map(function(value) {
						return value.str;
					});
					let structuredList = {};
					let getHeader = function(list) {
						let header = {};
						let lastHeaderWords = 'Invoice Date';
						let runDate = 'Run Date';
						let title = 'Daily Invoice Report';
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
					console.log(getHeader(list));
					console.log(list);
				});
			});
		});
		browser.end();
	}
};
