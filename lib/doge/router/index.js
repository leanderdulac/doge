var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');
var Promise = require('bluebird');
var Inflect = require('inflected');
var Support = require('../support');

global.RoutingError = new Class('RoutingError', StandardError);

module.exports = new Class('Router', function() {
	this.include(require('./http'));
	this.include(require('./resources'));

	this.$.initialize = function(application) {
		this.application = application;
		this.routes = [];
	};

	this.$.match = function() {
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

		_.defaults(route, {
			via: 'all'
		});

		if (!route.path) {
			throw new Error("missing path");
		}

		if (!route.via) {
			throw new Error("missing via");
		}

		this.addRoute(route);
	};

	this.$.addRoutes = function(routes, defaultConfig) {
		if (!defaultConfig) {
			defaultConfig = {};
		}

		for (var action in routes) {
			var config = routes[action];

			if (_.isString(config)) {
				config = {
					via: config
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
				if (!this.isCanonicalAction(config.action)) {
					config.path = '/' + Inflect.underscore(config.action);
				}
			}

			// Merge paths
			config.path = (defaultConfig.path || '') + (config.path || '');

			this.match(config);
		}
	};

	this.$.addRoute = function(route) {
		if (!route.path) {
			throw new ArgumentError('missing path');
		}

		if (!route.via) {
			throw new ArgumentError('missing via parameter');
		}

		var via = route.via;

		if (!_.isArray(via)) {
			via = [via];
		}

		var defaults = _.merge({
			controller: route.controller,
			action: route.action
		}, route.defaults || {});

		var keys = [];
		var regexp = pathToRegexp(route.path);

		for (var i = 0; i < via.length; i++) {
			this.routes.push({
				regexp: regexp,
				keys: keys,
				path: route.path,
				defaults: defaults,
				method: via[i].toUpperCase(),
			});
		}
	};

	this.$.call = function(req, res, next) {
		for (var i = 0; i < this.routes.length; i++) {
			var route = this.routes[i];

			// Exit early if the method doesn't match
			if (route.method != 'ALL' && route.method != req.method) {
				continue;
			}

			// Check if the URL matches
			var match = route.regexp.exec(req.url);

			if (!match) {
				continue;
			}

			// Copy path parameters
			var params = _.clone(route.defaults);

			for (var j = 0; j < route.keys.length; j++) {
				req.pathParameters[route.keys[j]] = match[j + 1];
			}

			if (!params.controller) {
				throw new RoutingError('no controller defined for route');
			}

			var controllerClass = this.application.getController(params.controller);

			if (!controllerClass) {
				throw new RoutingError('controller ' + params.controller + ' not found');
			}

			var controller = new controllerClass();
			
			// Inject path parameters into the request
			req.pathParameters = _.merge(req.pathParameters || {}, params);

			return controller.call(req, res, next);
		}

		throw new RoutingError('route not found');
	};
});

