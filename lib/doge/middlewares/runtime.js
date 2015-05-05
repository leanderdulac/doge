var Middleware = require('../middleware');

module.exports = new Class('Runtime', Middleware, function() {
	this.$.call = function(req, res, next) {
		var start = Date.now();

		return next()
		.then(function() {
			res.headers['X-Runtime'] = (Date.now() - start) / 1000;
		});
	};
});

