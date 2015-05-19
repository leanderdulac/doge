var vm = require('vm');
var path = require('path');
var repl = require('repl');
var program = require('commander');
var Promise = require('bluebird');
var pkg = require('../../../package');
var Server = require('../server');

program
.command('runner <file>')
.alias('r')
.description('run script with doge environment loaded')
.option('-e, --environment [environment]', 'Environment to run', 'development')
.action(function(options) {
	if (options.environment) {
		process.env.DOGE_ENV = options.environment;
	}

	var App = require(path.join(process.env.DOGE_ROOT, 'config/application'));
	var app = new App();

	app.boot()
	.then(function() {
		require(options.file);
	})
	.catch(function(err) {
		console.log('An error ocurred:');
		console.log(err);
	});
});

