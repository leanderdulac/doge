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

	this.$.initialize = function(request, response) {
		var self = this;

		this.request = new Request(request);
		this.response = new Response(response);
	};

	this.$.dispatch = function(action) {
		this.action = action;

		return Promise.bind(this)
		.then(function() {
			return this.dispatchAction(action);
		})
		.catch(function(err) {
			// Default the response status to 500
			this.response.status = 500;

			return this.rescueWithHandler(err);
		})
		.catch(function(err) {
			console.log(err);

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

			if (this.params.muchwow === 'very') {
				this.response.contentType = 'application/dson';
				this.response.body = dogeon.stringify(this.response.body);
			}
		})
		.finally(function() {
			return this.response.send();
		});
	};

	this.$.dispatchAction = function(action) {
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
	
	this.metaclass.$.afterAction = function(hook, options) {
		this.addHook('action', 'after', hook, this._convertHookOptions(options));
	};

	this.metaclass.$._convertHookOptions = function(options) {
		options = _.clone(options || {});

		if (!options.conditions) {
			options.conditions = [];
		}

		if (options.only) {
			options.conditions = options.conditions.concat(_.map(options.only, function(action) {
				return this.action == action;
			}));
		}

		if (options.except) {
			options.conditions = options.conditions.concat(_.map(options.except, function(action) {
				return this.action != action;
			}));
		}

		return options;
	};
});

