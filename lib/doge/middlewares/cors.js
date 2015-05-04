var Middleware = require('../middleware');

module.exports = new Class('Cors', Middleware, function() {
	this.$.call = function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override');

		if (req.method == 'OPTIONS') {
			res.send(200);
		} else {
			return next();
		}
	};
});


