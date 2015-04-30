var Promise = require('bluebird');

global.CyclicErrorHandling = new Class('CyclicErrorHandling', StandardError, function() {
	this.$.initialize = function(error, newError) {
		$super("cyclic error handling detected for " + error.toString());

		this.error = error;
		this.newError = newError;
	};
});

var ClassMethods = new Module('Rescuable::ClassMethods', function() {
	this.defineGetter('rescuers', function() {
		if (!this._rescuers) {
			this._rescuers = [];
		}

		return this._rescuers;
	});

	this.$.rescueFrom = function(err, handler) {
		this.rescuers.push({
			error: err,
			handler: handler
		});
	};

	this.$.rescuerFor = function(err) {
		var klass = this;

		if (!err) {
			return null;
		}

		if (!err.kindOf) {
			return null;
		}

		while (klass) {
			if (klass.rescuers) {
				for (var i = klass.rescuers.length - 1; i >= 0; i--) {
					if (err.kindOf(klass.rescuers[i].error)) {
						return klass.rescuers[i].handler;
					}
				}
			}

			klass = klass.superclass;
		}

		return null;
	};
});

module.exports = new Module('Rescuable', function() {
	this.metaclass.$.included = function(base) {
		base.extend(ClassMethods);
	};

	this.$.rescueWithHandler = function(err) {
		return Promise.bind(this)
		.then(function() {
			var rescuer = this.constructor.rescuerFor(err);
			var fn;

			if (!rescuer) {
				throw err;
			}

			if (rescuer.constructor == String) {
				fn = this[rescuer];
			} else if (rescuer.constructor == Function) {
				fn = rescuer;
			}

			if (!fn) {
				throw err;
			}

			return Promise.bind(this)
			.then(function() {
				return fn.call(this, err);
			})
			.catch(function(newError) {
				if (err.constructor == newError.constructor) {
					throw new CyclicErrorHandling(err, newError);
				}

				return this.rescueWithHandler(newError);
			});
		});
	};
});


