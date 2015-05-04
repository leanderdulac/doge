var fs = require('fs');
var Path = require('path');
var Inflect = require('inflected');
var Promise = require('bluebird');
var Doge = require('./index');
var Bone = require('./bone');
var Router = require('./router');
var Request = require('./request');
var Response = require('./response');
var ApplicationConfiguration = require('./config');

Promise.promisifyAll(fs);

module.exports = new Class('Application', Bone, function() {
	var Application = this;

	// Mark us as abstract
	this.abstract = true;

	this.metaclass.$.inherited = function(base) {
		$super(base);

		Doge.appClass = base;
	};

	this.$.initialize = function() {
		$super();

		// Routing
		this.router = new Router(this);

		// Config
		this.config = new ApplicationConfiguration(this);

		// Controller
		this.controllers = {};
	};

	this.initializer('load routes', function() {
		var routerPath = Path.join(this.config.paths.routes);
		require(routerPath).call(this.router, this);
	});

	this.$.runFileInitializers = function() {
		var runInitializer = function(path) {
			var module = require(path);

			if (module instanceof Function) {
				return module.call(this);
			}
		}.bind(this);

		var runInitializersIn = function(path) {
			return Promise.bind(this)
			.then(function() {
				return fs.readdirAsync(path);
			})
			.then(function(files) {
				return files.sort(function(a, b) {
					if (a < b) {
						return -1;
					}

					if (a > b) {
						return 1;
					}

					return 0;
				});
			})
			.each(function(file) {
				var fullPath = Path.join(path, file);

				return Promise.bind(this)
				.then(function() {
					return fs.statAsync(fullPath);
				})
				.then(function(info) {
					if (info.isDirectory()) {
						return runInitializersIn(fullPath);
					} else if (info.isFile()) {
						return runInitializer(fullPath);
					}
				});
			});
		}.bind(this);

		return runInitializersIn(this.config.paths.initializers);
	};

	this.$.boot = function() {
		return Promise.resolve(Bone.subclasses)
		.bind(this)
		.filter(function(bone) {
			// Exclude all applications and abstract bones
			return !bone.abstract && !(bone instanceof Application.metaclass);
		})
		.each(function(bone) {
			return bone.instance.runInitializers(this);
		})
		.then(function() {
			return this.runInitializers(this);
		})
		.then(function() {
			return this.runFileInitializers();
		});
	};

	this.$.dispatchAction = function(controllerName, action, request, response) {
		var controllerClass = this.getController(controllerName);
		var controller = new controllerClass(request, response);

		return controller.dispatch(action);
	};

	this.$.getController = function(name) {
		if (!this.controllers[name]) {
			this.controllers[name] = require(Path.join(this.config.paths.controllers, Inflect.dasherize(Inflect.underscore(name))));
		}

		return this.controllers[name];
	};

	this.defineGetter('root', function() {
		return process.env.DOGE_ROOT;
	});

	this.$.call = function(req, res, next) {
		return this.config.middleware.call(req, res, next);
	};
});

