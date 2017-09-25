export default {
	src_folders: ['test'],
	output_folder: './report',
	selenium: {
		start_process: true,
		server_path: './node_modules/selenium-server-standalone/index.jar',
		host: '127.0.0.1',
		port: 4444
	},
	test_settings: {
		default {
			desiredCapabilities: {
				browserName: 'chrome'
			}
		}
	},
	test_runner: 'mocha'
}