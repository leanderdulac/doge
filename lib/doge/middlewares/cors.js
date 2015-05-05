var Middleware = require('../middleware');

module.exports = new Class('Cors', Middleware, function() {
	this.$.call = function(req, res, next) {
		res.headers['Access-Control-Allow-Origin'] = '*';
		res.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE';
		res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override';

		if (req.method == 'OPTIONS') {
			return res.send();
		} else {
			return next();
		}
	};
});


