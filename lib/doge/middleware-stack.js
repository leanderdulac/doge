var _ = require('lodash');
var Promise = require('bluebird');
var Middleware = new require('./middleware');

module.exports = new Class('MiddlewareStack', function() {
	var createMiddleware = function(args) {
		args = Array.prototype.slice.call(args);

		var middleware = args.shift();

		if (middleware.kindOf(Class) && middleware.ancestors.indexOf(Middleware) !== -1) {
			middleware = middleware.create.apply(middleware, args);
		}

		return middleware;
	};

	this.$.initialize = function() {
		this.stack = [];
	};

	this.$.use = function(middleware) {
		if (this.has(middleware)) {
			return false;
		}

		this.stack.push(createMiddleware(arguments));
		
		return true;
	};

	this.$.remove = function(middleware) {
		var index = this.indexOf(middleware);

		if (index === -1) {
			return false;
		}

		this.stack.splice(index, 1);

		return true;
	};

	this.$.swap = function(old, middleware) {
		var index = this.indexOf(old);
		var args = Array.prototype.slice.call(arguments, 1);

		if (index === -1) {
			return false;
		}

		this.stack[index] = createMiddleware(args);

		return true;
	};

	this.$.has = function(middleware) {
		return this.indexOf(middleware) !== -1;
	};

	this.$.indexOf = function(middleware) {
		for (var i = 0; i < this.stack.length; i++) {
			var m = this.stack[i];

			if (m == middleware || m.constructor == middleware || m.name == middleware || m.constructor.name == middleware) {
				return i;
			}
		}

		return -1;
	};

	this.$.call = function(req, res, next) {
		aonsole.log('b');

		var run = function(index) {
			if (index >= this.stack.length) {
				if (next) {
					return next();
				} else {
					return;
				}
			}

			var middleware = this.stack[index];

			return Promise.bind(this)
			.then(function() {
				return middleware.call(req, res, function() {
					return run(index + 1);
				});
			})
			.catch(function(err) {
				if (next) {
					return next(err);
				} else {
					throw err;
				}
			});
		}.bind(this);

		return run(0);
	};
});

