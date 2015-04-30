var vm = require('vm');
var path = require('path');
var repl = require('repl');
var program = require('commander');
var Promise = require('bluebird');
var pkg = require('../../../package');
var Server = require('../server');

program
.command('console')
.alias('c')
.description('start hapidogi repl')
.option('-e, --environment [environment]', 'Environment to run', 'development')
.action(function(options) {
	if (options.environment) {
		process.env.DOGE_ENV = options.environment;
	}

	var App = require(path.join(process.env.DOGE_ROOT, 'config/application'));
	var app = new App();

	app.boot()
	.then(function() {
		repl.start({
			useGlobal: true,
			eval: function(code, context, filename, callback) {
				Promise.resolve()
				.then(function() {
					var script = vm.createScript(code, {
						filename: filename,
					});

					return script.runInThisContext();
				})
				.catch(function(err) {
					callback(err);
				})
				.then(function(result) {
					callback(null, result);
				});
			}
		});
	})
	.catch(function(err) {
		console.log('An error ocurred:');
		console.log(err);
	});
});


