var cuid = require('cuid');
var Middleware = require('../middleware');

module.exports = new Class('RequestId', Middleware, function() {
	this.$.call = function(req, res, next) {
		req.requestId = cuid();
		res.set('X-Request-Id', req.requestId);

		return next();
	};
});

