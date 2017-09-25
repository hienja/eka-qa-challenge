var config = require('../nightwatch.config.js');
var fs = require('fs');

module.exports = {
	before: function(browser) {
		fs.unlink('./test.pdf');
	},
	'Check for button': function(browser) {
		browser
			.url('localhost:3005')
			.waitForElementVisible('body')
			.assert.elementPresent('button.btn.btn-secondary')
			.end();
	}
};
