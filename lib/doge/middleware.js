module.exports = new Class('Middleware', function() {
	this.metaclass.$.fromConnectMiddleware = function(name, middleware) {
		var defaultArgs = Array.prototype.slice.call(arguments, 2);

		return new Class(name, module.exports, function() {
			this.$.initialize = function() {
				this.middleware = middleware.apply(null, defaultArgs.concat(Array.prototype.slice.call(arguments)));
			};

			this.$.call = function(req, res, next) {
				var self = this;

				return new Promise(function(resolve, reject) {
					self.middleware(req, res, function(err) {
						if (err) {
							return reject(err);
						}

						resolve(next());
					});
				});
			};
		});
	};

	this.$.call = function(req, res, next) {
		return next();
	};
});

