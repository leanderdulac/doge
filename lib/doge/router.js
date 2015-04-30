var _ = require('lodash');
var express = require('express');
var methods = require('methods');
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

var Router = new Class('Router');

/*
	- Request Lifecycle:
		* An request received
		* Middlewares are called
		* Router resolve the controller and action
	
	- Router Want:
		[*] Helpers to add routes to router class.
		[*] Helpers to add middlewares to router class.
		[*] Resolver function
		[ ] Dispatch function
 */

Router.$.initialize = function(application) {
	this.application = application;
	this.router = express.Router();
}

// Dispatch action to the application with the specified controller
Router.$.dispatch = function(controller, action, request, reply) {
	return this.application.dispatchAction(controller, action, request, reply);
};

//Router helper
/*
	#default methods: get, show, create, destroy, update
	this.resources('transactions', {
		except: ['destroy'],
		member: {
			'refund': 'POST',
			'capture': 'POST'
		},
		collection: {
			'volume': 'POST'
		}
	});
	
	- Options: 
		* resources: Single String.
		* options: Object with this properties: only, except, collection? all this must be an String Array

 */
Router.$.resources = function(resource, options) {
	return this.addResource(resource, options, ResourcesActions, ResourcesRoutes);
};

Router.$.resource = function(resource, options) {
	return this.addResource(resource, options, ResourceActions, ResourceRoutes);
};

Router.$.addResource = function(resource, options, actions, routes) {
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

	var path = options.path || ('/' + resource);
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

Router.$.addRoutes = function(routes, defaultConfig) {
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

		// Merge paths
		config.path = (defaultConfig.path || '') + (config.path || '');

		this.addRoute(config);
	}
};

Router.$.addRoute = function() {
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

	this.router[route.method.toLowerCase()](route.path, function(req, res) {
		return self.dispatch(route.controller, route.action, req, res);
	});
};

methods.forEach(function(method) {
	Router.$[method] = function() {
		this.addRoute.apply(this, Array.prototype.slice.call(arguments).concat({
			method: method
		}));
	};
});

module.exports = Router;

