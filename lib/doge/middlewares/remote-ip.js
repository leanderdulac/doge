var forwarded = require('forwarded');
var proxyAddr = require('proxy-addr');
var Middleware = require('../middleware');

module.exports = new Class('RemoteIp', Middleware, function() {
	this.$.initialize = function(trust) {
		if (!trust) {
			trust = Doge.configuration.trustProxy;

			if (trust === true) {
				trust = function() { return true; };
			}
		}

		if (!trust) {
			trust = 'loopback';
		}

		this.trust = proxyAddr.compile(trust);
	};

	this.$.call = function(req, res, next) {
		req.remoteIps = proxyAddr.all(req.raw, this.trust);
		req.remoteIp = req.remoteIps[req.remoteIps.length - 1];

		return next();
	};
});

