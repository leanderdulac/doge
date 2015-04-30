var path = require('path');
var Promise = require('bluebird');
var Bone = require('./bone');
var Router = require('./router');
var ApplicationConfiguration = require('./config');

module.exports = new Class('Application', Bone, function() {
	var Application = this;

	// Mark us as abstract
	this.abstract = true;

	this.$.initialize = function() {
		$super();

		// If there is no other instance, set us as the singleton
		if (!Application._instance) {
			Application._instance = this;
		}

		// Config
		this.config = new ApplicationConfiguration();

		// Routing
		this.router = new Router(this);

		// Controller
		this.controllers = {};
	};

	this.initializer('load controllers', function(){
		
	});

	this.initializer('load routes', function() {
		var routerPath = path.join(Application.root, 'config/routes'); 
		require(routerPath).call(this.router, this);
	});

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
		});
	};

	this.$.dispatchAction = function(controllerName, action, request, response) {
		var controllerClass = this.getController(controllerName);
		var controller = new controllerClass(request, response);

		return controller.dispatch(action);
	};

	this.$.getController = function(name) {
		if (!this.controllers[name]) {
			this.controllers[name] = require(path.join(Application.root, 'app/controllers', name));
		}

		return this.controllers[name];
	};

	this.metaclass.defineGetter('root', function() {
		return process.env.DOGE_ROOT;
	});

	// Override Bone behaviour as we must be explicit instantiated
	this.metaclass.defineGetter('instance', function() {
		return Application._instance;
	});
});

