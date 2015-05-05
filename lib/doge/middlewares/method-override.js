var Middleware = require('../middleware');

module.exports = new Class('MethodOverride', Middleware, function() {
	this.$.call = function(req, res, next) {
		if (req.headers['X-Method-Override']) {
			req.method = req.headers['X-Method-Override'];
		}

		return next();
	};
});

