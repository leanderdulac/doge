var _ = require('lodash');
var stream = require('stream');
var contentType = require('content-type');
var Promise = require('bluebird');

module.exports = new Class('Response', function() {
	this.$.initialize = function(raw) {
		this.raw = raw;
		this.headersSent = false;
		this.sent = false;
		this.status = 200;
		this.headers = {};
		this.body = null;
		this.contentType = 'application/json';
		this.charset = 'utf8';
		this.location = null;
	};

	this.defineProperty('contentLength', function() {
		return this.headers['Content-Length'];
	}, function(value) { 
		this.headers['Content-Length'] = value;
	});

	this.$.sendHeaders = function() {
		if (this.headersSent) {
			throw new StandardError('headers already sent');
		}

		if (this.location) {
			this.headers['Location'] = this.location;
		}

		this.headers['Content-Type'] = contentType.format({
			type: this.contentType,
			parameters: {
				charset: this.charset
			}
		});

		this.raw.writeHead(this.status, this.headers);

		this.headersSent = true;
	};

	this.$.write = function(buffer) {
		var self = this;

		return new Promise(function(resolve, reject) {
			self.raw.write(buffer, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		})
		.then(function() {
			this.headersSent = true;
		});
	};

	this.$.send = function() {
		var self = this;

		if (this.sent) {
			throw new StandardError('response already sent');
		}

		// TODO: Do this in a proper place
		if (!_.isString(this.body) && !(this.body instanceof Buffer) && !(this.body instanceof stream.ReadableStream)) {
			this.body = JSON.stringify(this.body);
		}

		return Promise.bind(this)
		.then(function() {
			if (!this.headersSent) {
				// If not set, try to set the content length
				if (this.body && this.headers['Content-Length']) {
					this.headers['Content-Length'] = this.body.length;
				}

				return this.sendHeaders();
			}
		})
		.then(function() {
			if (this.body) {
				// Write the body if available
				if (this.body instanceof streams.ReadableStream) {
					this.body.pipe(this.raw);
				} else {
					this.write(this.body);
				}
			}
		})
		.then(function() {
			// Close the request
			return new Promise(function(resolve, reject) {
				self.raw.end(function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		})
		.then(function() {
			this.sent = true;
		});
	};
});

