var qs = require('qs');
var url = require('url');
var contentType = require('content-type');

module.exports = new Class('Request', function() {
	this.$.initialize = function(raw) {
		this.raw = raw;
		this.method = raw.method;
		this.headers = raw.headers;
		this.uri = url.parse(raw.url);
		this.url = this.uri.pathname;
		this.queryParameters = qs.parse(this.uri.query);

		if (this.headers['content-type']) {
			this.headers['content-type'] = Doge.configuration.defaultContentType;
		}

		if (this.headers['content-type']) {
			var type = contentType.parse(this.headers['content-type']);

			this.contentType = type.type;
			this.charset = type.parameters.charset;
		}
	};

	this.defineGetter('host', function() {
		return this.headers['host'];
	});

	this.defineGetter('format', function() {
		return this.headers['accept'];
	});
});

