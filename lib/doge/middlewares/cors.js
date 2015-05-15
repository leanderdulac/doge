var Middleware = require('../middleware');

module.exports = new Class('Cors', Middleware, function() {
	this.$.call = function(req, res, next) {
		res.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || '*';
		res.headers['Access-Control-Allow-Methods'] = req.headers['access-control-request-methods'] || 'GET,POST,PUT,DELETE,OPTIONS';
		res.headers['Access-Control-Allow-Headers'] = req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override';
		res.headers['Access-Control-Allow-Credentials'] = 'true';

		if (req.method == 'OPTIONS') {
			return res.send();
		} else {
			return next();
		}
	};
});


