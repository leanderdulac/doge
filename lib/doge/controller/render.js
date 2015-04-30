var Promise = require('bluebird');

module.exports = new Module('Render', function() {
	this.$.render = function(value, options) {
		if (!options) {
			options = {};
		}

		if (options.status) {
			this.response.status = options.status;
		}

		return Promise.bind(this)
		.then(function() {
			this.response.body = value;
		});
	};

	this.$.renderError = function(errors, options) {
		if (!options) {
			options = {};
		}

		if (options.status) {
			this.response.status = options.status;
		}

		if (!(errors instanceof Array)) {
			errors = [errors];
		}

		return Promise.bind(this)
		.then(function() {
			this.response.body = {
				url: this.request.url,
				method: this.request.method,
				errors: errors
			};
		});
	};
});

