var _ = require('lodash');
var tsort = require('tsort');
var Promise = require('bluebird');

var Initializer = new Class('Initializer');

Initializer.$.initialize = function(name, context, options, fn){
	this.name = name;
	this.context = context;
	this.options = options;
	this.fn = fn;
}

Initializer.defineGetter('before', function(){
	return this.options.before;
});

Initializer.defineGetter('after', function(){
	return this.options.after;
});

Initializer.$.belongsTo = function(group){
	return this.options.group == group || this.options.group == 'all';
}

Initializer.$.run = function(args){
	this.fn.apply(this.context, args);
}

Initializer.$.bind = function(context){
	if (this.context) {
		return this;
	}

	return new Initializer(this.name, context, this.options, this.fn);
}

var ClassMethods = new Module('Initializable::ClassMethods', function() {
	this.$.initializer = function(name, opts, fn){
		if (!fn) {
			fn = opts;
			opts = undefined;
		}

		if (!opts) {
			opts = {};
		}

		if (!opts.after) {
			if (this.initializers.length > 0) {
				opts.after = this.initializers[this.initializers.length - 1].name;
			} else {
				opts.after = _.find(this.initializers, { name: opts.before });
			}
		}

		this.initializers.push(new Initializer(name, null, opts, fn));
	}

	this.$.initializersFor = function(binding){
		return _.map(this.initializersChain, function(fn) {
			return fn.bind(binding);
		});
	}

	this.defineGetter('initializers', function(){
		if(!this._initializers) {
			this._initializers = [];
		}

		return this._initializers;
	});

	this.defineGetter('initializersChain', function() {
		return _(this.ancestors.reverse())
		.map(function(klass) {
			return klass.initializers || [];
		})
		.concat()
		.flatten()
		.value();
	});
});

module.exports = new Module('Initializable', function() {
	this.metaclass.$.included = function(base) {
		base.extend(ClassMethods);
	};

	this.defineGetter('initializers', function(){
		if (!this._initializers) {
			this._initializers = this.constructor.initializersFor(this);
		}

		return this._initializers;
	});

	this.$.runInitializers = function() {
		var args = Array.prototype.slice.call(arguments);

		if (this._ran) {
			return;
		}

		var sorter = tsort();
		var initializers = this.initializers;

		for (var i = 0; i < initializers.length; i++) {
			var initializer = initializers[i];
			
			sorter.add(null, initializer.name);

			_.filter(initializers, function(i) {
				return i.before == initializer.name || i.name == initializer.after;
			}).forEach(function(i) {
				sorter.add(i.name, initializer.name);
			});
		}

		return Promise.resolve(sorter.sort())
		.bind(this)
		.map(function(name) {
			return _.find(initializers, { name: name });
		})
		.each(function(i) {
			if (!i) {
				return null;
			}

			return i.run(args);
		});
	};
});

