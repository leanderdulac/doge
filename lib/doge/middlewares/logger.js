var log4js = require('log4js');
var Middleware = require('../middleware');

module.exports = new Class('Logger', Middleware, function() {
	this.$.initialize = function(logger) {
		if (!logger) {
			logger = log4js.getLogger('HTTP');
		}

		this.logger = logger;
	};
	
	this.$.call = function(req, res, next) {
		return next()
		.bind(this)
		.finally(function() {
			this.logger.info('%s %s %s %s', req.remoteIp, req.method, req.url, res.status);
		});
	};
});

