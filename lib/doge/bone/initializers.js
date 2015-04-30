var Initializers = new Module('Initializers');
var ClassMethods = new Module('Initializers::ClassMethods');

Initializers.metaclass.$.included = function(base) {
	base.extend(ClassMethods);
};

Initializers.$.runInitializers = function() {
	console.log(this.constructor.initializers);
	console.log(this.constructor);
	var run = function(index) {
		if (index >= this.constructor.initializers.length) {
			return;
		}

		return Promise.bind(this)
		.then(function() {
			var initializer = this.constructor.initializers[index];

			return initializer.constructor.fn();
		})
		.then(function() {
			return run(index + 1);
		})
	}.bind(this);

	return run(0);
};

ClassMethods.defineGetter('initializers', function() {
	if (!this._initializers) {
		this._initializers = [];
	}

	return this._initializers;
});

ClassMethods.$.initializer = function(name, fn) {
	this.initializers.push({
		name: name,
		fn: fn
	});
};

module.exports = Initializers;

