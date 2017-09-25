var chromedriver = require('chromedriver');

module.exports = {
	src_folders: ['test'],
	output_folder: './report',
	selenium: {
		start_process: true,
		server_path: './node_modules/selenium-server-standalone/index.jar',
		host: '127.0.0.1',
		port: 4444,
		cli_args: {
			'webdriver.chrome.driver': chromedriver.path
		}
	},
	test_settings: {
		default: {
			globals: {
				waitForConditionTimeout: 5000
			},
			desiredCapabilities: {
				browserName: 'chrome',
				javascriptEnabled: true
			}
		}
	}
	// ,
	// test_runner: 'mocha'
};
