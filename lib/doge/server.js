var http = require('http');
var Promise = require('bluebird');
var Request = require('./request');
var Response = require('./response');

module.exports = new Class('Server', function() {
	this.$.initialize = function(app, config) {
		var self = this;

		this.server = http.createServer();
		this.application = app;
		this.config = config;

		// Mount the application
		this.server.on('request', function(req, res) {
			var request = new Request(req);
			var response = new Response(res);

			self.application.call(request, response)
			.catch(function(err) {
				console.log(err);
				console.log(err.stack);
			})
			.finally(function() {
				if (!response.sent) {
					response.send();
				}
			});
		});

		// Promisify the server
		Promise.promisifyAll(this.server);
	};

	this.$.listen = function() {
		return this.server.listenAsync(this.config.port, this.config.hostname);
	};
});

