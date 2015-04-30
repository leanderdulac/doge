var express = require('express');
var Promise = require('bluebird');

module.exports = new Class('Server', function() {
	this.$.initialize = function(app, config) {
		var self = this;

		this.server = express();
		this.application = app;
		this.config = config;

		// Mount the application
		this.server.use(this.application.config.middlewares.call.bind(this.application.config.middlewares));
		this.server.use(this.application.router.router);

		// Promisify the server
		Promise.promisifyAll(this.server);
	};

	this.$.listen = function() {
		return this.server.listenAsync(this.config.port, this.config.hostname);
	};
});

