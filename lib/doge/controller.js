var _ = require('lodash');
var dogeon = require('dogeon');
var Promise = require('bluebird');
var Request = require('./request');
var Response = require('./response');

// Errors Declaration
global.ControllerError = new Class('ControllerError', StandardError);
global.ActionNotFound = new Class('ActionNotFound', ControllerError);

module.exports = new Class('Controller', function() {
	this.include(require('./support/rescuable'));
	this.include(require('./support/callbacks'));
	this.include(require('./controller/validation'));
	this.include(require('./controller/render'));
	this.include(require('./controller/params'));

	// Action hooks
	this.defineHook('action');

	this.$.call = function(request, response, next) {
		this.request = request;
		this.response = response;

		return Promise.bind(this)
		.then(function() {
			return this.dispatchAction(this.request.pathParameters.action);
		})
		.catch(function(err) {
			// Default the response status to 500
			this.response.status = 500;

			return this.rescueWithHandler(err);
		})
		.catch(function(err) {
			console.log(err);
			console.log(err.stack);

			this.response.status = 500;

			return {
				error: 'internal_error',
				message: 'An internal error ocurred.'
			};
		})
		.then(function(response) {
			if (response) {
				this.response.body = response;
			}

			// MUCH WOW VERY DSON! [easteregg]
			if (this.params.muchwow === 'very') {
				this.response.contentType = 'application/dson';
				this.response.body = dogeon.stringify(this.response.body);
			}
		})
		.then(function() {
			return next();
		});
	};

	this.$.dispatchAction = function(action) {
		if (!action) {
			throw new ActionNotFound('no action defined');
		}

		if (!this[action]) {
			throw new ActionNotFound('action ' + action + ' not found');
		}

		return this.executeWithHooks('action', function() {
			return this[action]();
		});
	};

	this.metaclass.$.beforeAction = function(hook, options) {
		this.addHook('action', 'before', hook, this._convertHookOptions(options));
	};
	
	this.metaclass.$.skipBeforeAction = function(hook, options) {
		this.skipHook('action', 'before', hook, this._convertHookOptions(options));
	};
	
	this.metaclass.$.afterAction = function(hook, options) {
		this.addHook('action', 'after', hook, this._convertHookOptions(options));
	};

	this.metaclass.$.skipAfterAction = function(hook, options) {
		this.skipHook('action', 'after', hook, this._convertHookOptions(options));
	};

	this.metaclass.$._convertHookOptions = function(options) {
		options = _.clone(options || {});

		if (!options.conditions) {
			options.conditions = [];
		}

		if (options.only) {
			options.conditions = options.conditions.concat(_.map(options.only, function(action) {
				return function() {
					return this.action == action;
				};
			}));
		}

		if (options.except) {
			options.conditions = options.conditions.concat(_.map(options.except, function(action) {
				return function() {
					return this.action != action;
				};
			}));
		}

		return options;
	};
});

