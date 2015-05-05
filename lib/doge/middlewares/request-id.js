var cuid = require('cuid');
var Middleware = require('../middleware');

module.exports = new Class('RequestId', Middleware, function() {
	this.$.call = function(req, res, next) {
		// Generates an unique ID for the request
		req.uuid = cuid();
		res.headers['X-Request-Id'] = req.uuid;

		return next();
	};
});

