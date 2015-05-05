var qs = require('qs');
var dogeon = require('dogeon');
var Middleware = require('../middleware');
var Promise = require('bluebird');

module.exports = new Class('BodyParser', Middleware, function() {
	this.$.call = function(req, res, next) {
		var readBody = function() {
			return new Promise(function(resolve) {
				var body = [];

				req.raw.on('data', function(data) {
					body.push(data);
				});

				req.raw.on('end', function() {
					req.body = Buffer.concat(body);
					resolve();
				});
			});
		};

		if (req.contentType == 'application/json') {
			return readBody()
			.then(function() {
				req.requestParameters = JSON.parse(req.body);
			})
			.catch(function() {})
			.then(function() {
				return next();
			});
		} else if (req.contentType == 'application/dson') {
			return readBody()
			.then(function() {
				req.requestParameters = dogeon.parse(req.body);
			})
			.catch(function() {})
			.then(function() {
				return next();
			});
		} else if (req.contentType == 'application/x-www-form-urlencoded') {
			return readBody()
			.then(function() {
				req.requestParameters = qs.parse(req.body);
			})
			.catch(function() {})
			.then(function() {
				return next();
			});
		} else {
			return next();
		}
	};
});

