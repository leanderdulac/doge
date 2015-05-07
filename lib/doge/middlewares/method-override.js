var Middleware = require('../middleware');

module.exports = new Class('MethodOverride', Middleware, function() {
	this.$.call = function(req, res, next) {
		if (req.headers['x-method-override']) {
			req.method = req.headers['x-method-override'];
		}

		return next();
	};
});

