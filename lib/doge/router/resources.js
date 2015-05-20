var _ = require('lodash');
var Inflect = require('inflected');

var ResourcesActions = ['index', 'create', 'show', 'update', 'destroy'];
var ResourceActions = ['create', 'show', 'update', 'destroy'];

var ResourceRoutes = {
	create: {
		via: 'POST'
	},
	show: {
		via: 'GET'
	},
	update: {
		via: 'PUT'
	},
	destroy: {
		via: 'DELETE'
	}
};

var ResourcesRoutes = {
	index: {
		via: 'GET',
	},
	create: {
		via: 'POST'
	},
	show: {
		via: 'GET',
		path: '/:id'
	},
	update: {
		via: 'PUT',
		path: '/:id'
	},
	destroy: {
		via: 'DELETE',
		path: '/:id'
	}
};

module.exports = new Module('Router::Resources', function() {
	this.$.resources = function(resource, options) {
		return this.addResource(resource, options, ResourcesActions, ResourcesRoutes);
	};

	this.$.resource = function(resource, options) {
		return this.addResource(resource, options, ResourceActions, ResourceRoutes);
	};

	this.$.addResource = function(resource, options, actions, routes) {
		if (!options) {
			options = {};
		}

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

		this.addRoutes(actions, {
			path: path,
			controller: controller
		});
	};
	
	this.$.isCanonicalAction = function(action) {
		return ['index', 'show', 'create', 'update', 'destroy'].indexOf(action) !== -1;
	};
});


