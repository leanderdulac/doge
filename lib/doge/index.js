require('./bootstrap');

module.exports = new Module('Doge', function() {
	this.metaclass.defineGetter('application', function() {
		if (!this._application && this.appClass) {
			this._application = this.appClass.instance;
		}

		return this._application;
	});

	this.metaclass.defineSetter('application', function(value) {
		this._application = value;
	});

	this.metaclass.defineGetter('configuration', function() {
		return this.application.config;
	});

	this.metaclass.defineGetter('root', function() {
		return this.application && this.application.root;
	});
	
	this.metaclass.defineGetter('env', function() {
		if (!this._env) {
			this._env = process.env.DOGE_ENV || 'development';
		}

		return this._env;
	});

	this.metaclass.defineSetter('env', function(value) {
		this._env = value;
	});

	this.appClass = this.application = null;
});

global.Doge = module.exports;

