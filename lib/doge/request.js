module.exports = new Class('Request', function() {
	this.$.initialize = function(raw) {
		this.raw = raw;
		this.method = raw.method;
		this.headers = raw.headers;
		this.url = raw.url;
		this.remoteIp = raw.ip;
		this.protocol = raw.protocol;
		this.queryParameters = raw.query || {};
		this.pathParameters = raw.params || {};
		this.requestParameters = raw.body || {};
	};

	this.defineGetter('host', function() {
		return this.headers['host'];
	});

	this.defineGetter('format', function() {
		return this.headers['accept'];
	});
});

