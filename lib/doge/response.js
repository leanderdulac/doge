var Promise = require('bluebird');

module.exports = new Class('Response', function() {
	this.$.initialize = function(raw) {
		this.raw = raw;
		this.sent = false;
		this.status = 200;
		this.body = null;
		this.headers = {};
		this.contentType = 'application/json';
		this.charset = 'utf8';
		this.location = null;
	};

	this.$.send = function() {
		if (this.sent) {
			throw new StandardError('response already sent');
		}

		return Promise.bind(this)
		.then(function() {
			for (var key in this.headers) {
				this.raw.set(key, this.headers[key]);
			}

			if (this.location) {
				this.raw.set('Location', this.location);
			}

			this.raw.set('Content-Type', this.contentType + '; charset=' + this.charset);

			this.raw.status(this.status);
			this.raw.send(this.body);
		})
		.then(function() {
			this.sent = true;
		});
	};
});

