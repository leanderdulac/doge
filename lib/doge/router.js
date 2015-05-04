var _ = require('lodash');
var express = require('express');
var methods = require('methods');
var Inflect = require('inflected');
var Promise = require('bluebird');
var Support = require('./support');

var ResourcesActions = ['index', 'create', 'show', 'update', 'destroy'];
var ResourceActions = ['create', 'show', 'update', 'destroy'];

var ResourceRoutes = {
	create: {
		method: 'POST'
	},
	show: {
		method: 'GET'
	},
	update: {
		method: 'PUT'
	},
	destroy: {
		method: 'DELETE'
	}
};

var ResourcesRoutes = {
	index: {
		method: 'GET',
	},
	create: {
		method: 'POST'
	},
	show: {
		method: 'GET',
		path: '/:id'
	},
	update: {
		method: 'PUT',
		path: '/:id'
	},
	destroy: {
		method: 'DELETE',
		path: '/:id'
	}
};

module.exports = new Class('Router', function() {
	this.$.initialize = function(application) {
		this.application = application;
		this.router = express.Router();
	}

	this.$.dispatch = function(controller, action, request, reply) {
		return this.application.dispatchAction(controller, action, request, reply);
	};

	this.$.resources = function(resource, options) {
		return this.addResource(resource, options, ResourcesActions, ResourcesRoutes);
	};

	this.$.resource = function(resource, options) {
		return this.addResource(resource, options, ResourceActions, ResourceRoutes);
	};

	this.$.addResource = function(resource, options, actions, routes) {
		if (typeof resource !== 'string'){
			throw new TypeError('resource must be a string.');
		}

		if (typeof options !== 'object'){
			throw new TypeError('options must be an object');
		}	

		if (!!options.except && !!options.only){
			throw new TypeError('options cannot take `except` and `only` properties');
		}

		actions = _.clone(actions);

		// Filter actions
		if (options.only) {
			actions = _.filter(actions, function(action) {
				return _.contains(options.only, action);
			});
		} else if (options.except) {
			actions = _.filter(actions, function(action) {
				return !_.contains(options.except, action);
			});
		}

		// Get routes
		actions = _.pick(routes, actions);

		var path = options.path || ('/' + Inflect.underscore(resource));
		var controller = options.controller || resource;

		// Add routes
		this.addRoutes(actions, {
			path: path,
			controller: controller
		});

		if (options.collection) {
			this.addRoutes(options.collection, {
				path: path,
				controller: controller
			});
		}

		if (options.member) {
			this.addRoutes(options.member, {
				path: path + '/:id',
				controller: controller
			});
		}
	};

	this.$.addRoutes = function(routes, defaultConfig) {
		if (!defaultConfig) {
			defaultConfig = {};
		}

		for (var action in routes) {
			var config = routes[action];

			if (_.isString(config)) {
				config = {
					method: config
				};
			}

			config = _.clone(config);

			// Set action
			if (!config.action) {
				config.action = action;
			}

			// Set default controller
			if (!config.controller) {
				config.controller = defaultConfig.controller;
			}

			// Default path
			if (!config.path) {
				config.path = '/' + Inflect.underscore(config.action);
			}

			// Merge paths
			config.path = (defaultConfig.path || '') + (config.path || '');

			this.addRoute(config);
		}
	};

	this.$.addRoute = function() {
		var self = this;
		var args = Support.extractOptions(arguments);
		var route = args.pop();

		if (args.length > 0 && _.isString(args[0])) {
			route.path = args.shift();
		}

		if (args.length > 0 && _.isString(args[0])) {
			var parts = args[0].split('#', 2);

			if (parts.length == 2) {
				route.controller = parts[0];
				route.action = parts[1];
			} else {
				route.action = parts[0];
			}
		}

		if (!route.controller) {
			throw new Error("missing controller");
		}

		if (!route.action) {
			throw new Error("missing action");
		}

		if (!route.path) {
			throw new Error("missing path");
		}

		if (!route.method) {
			throw new Error("missing method");
		}

		this.router[route.method.toLowerCase()](route.path, function(req, res, next) {
			return self.dispatch(route.controller, route.action, req, res)
			.then(function() {
				return next();
			})
			.catch(function(err) {
				return next(err);
			});
		});
	};

	methods.forEach(function(method) {
		this.$[method] = function() {
			this.addRoute.apply(this, Array.prototype.slice.call(arguments).concat({
				method: method
			}));
		};
	}.bind(this));

	this.$.call = function(req, res, next) {
		var self = this;

		return new Promise(function(resolve, reject) {
			self.router(req, res, function(err) {
				if (err) {
					return reject(err);
				}

				resolve(next());
			});
		});
	};
});

