var _ = require('lodash');
var Promise = require('bluebird');

var SubclassTracker = require('./subclass-tracker');

var hookStorageName = function(hookName) {
	return '_' + hookName + 'Hooks';
};

var Hook = Class('Hook', function() {
	this.$.initialize = function(name, filter, kind, options) {
		this.name = name;
		this.kind = kind;
		this.filter = filter;
		this.if = options.if || [];
		this.unless = options.unless || [];
	};

	this.$.merge = function(newOptions) {
		var options = {
			if: this.if,
			unless: this.unless
		};

		options.if = options.if.concat(newOptions.if || []);
		options.unless = options.unless.concat(newOptions.unless || []);

		return new Hook(this.name, this.filter, this.kind, options);
	};

	this.defineGetter('conditions', function() {
		return _.map(this.if, function(c) {
			return this.makeFunction(c);
		}, this).concat(_.map(this.unless, function(c) {
			return this.makeFunction(this.invertFunction(c));
		}, this));
	});

	this.$.invertFunction = function(fn) {
		return function() {
			return !fn.apply(this, arguments);
		};
	};

	this.$.makeFunction = function(name) {
		var fn;

		if (_.isString(name)) {
			fn = function(receiver, args) {
				return receiver[name].apply(receiver, args);
			};
		} else if (_.isFunction(name)) {
			fn = function(receiver, args) {
				return name.apply(receiver, args);
			};
		}

		return fn;
	};

	this.$.apply = function(receiver, args) {
		var conditions = this.conditions;

		return Promise.resolve(conditions)
		.bind(this)
		.map(function(c) {
			return c(receiver, args);
		}, { concurrency: 1 })
		.then(function(conditions) {
			if (!_.all(conditions, _.identity)) {
				return;
			}

			return this.makeFunction(this.filter)(receiver, args);
		});
	};
});

var HookChain = new Class('HookChain', function() {
	this.$.initialize = function(hook, instance) {
		this.instance = instance;
		this.before = hook.hooks.before;
		this.after = hook.hooks.after;
	};

	this.$.execute = function(fn) {
		return Promise.bind(this)
		.then(function() {
			return Promise.bind(this)
			.then(function() {
				return this.before;
			})
			.each(function(hook) {
				return hook.apply(this.instance);
			});
		})
		.then(function() {
			if (_.isString(fn)) {
				fn = this.instance[fn];
			}

			return fn.apply(this.instance);
		})
		.tap(function() {
			return Promise.bind(this)
			.then(function() {
				return this.after;
			})
			.each(function(hook) {
				return hook.apply(this.instance);
			});
		})
		.catch(function(err) {
			if (err !== 'abort') {
				throw err;
			}
		});
	};
});

var HookCollection = new Class('HookCollection', function() {
	this.$.initialize = function(name) {
		this.name = name;
		this.hooks = {
			before: [],
			after: []
		};
	};

	this.$.add = function(type, hook) {
		this.hooks[type].push(hook);
	};

	this.$.find = function(type, matcher) {
		return _.find(this.hooks[type], matcher);
	};

	this.$.replace = function(type, hook, newHook) {
		var chain = this.hooks[type];
		var index = chain.indexOf(hook);

		if (index === -1) {
			return false;
		}

		chain[index] = newHook;
		
		return true;
	};

	this.$.build = function(instance) {
		return new HookChain(this, instance);
	};

	this.$.clone = function() {
		var other = new HookCollection(this.name);

		other.hooks = {
			before: _.clone(this.hooks.before),
			after: _.clone(this.hooks.after)
		};

		return other;
	};
});

module.exports = new Module('Callbacks', function() {
	this.ClassMethods = new Module('Callbacks::ClassMethods', function() {
		this.$.defineHook = function(name) {
			var storageName = hookStorageName(name);

			this['_' + storageName] = new HookCollection(name);

			this.metaclass.defineGetter(storageName, function() {
				if (!this['_' + storageName]) {
					this['_' + storageName] = this.superclass[storageName].clone();
				}

				return this['_' + storageName];
			});
		};

		this.$._modifyHooks = function(name, callback) {
			var storageName = hookStorageName(name);

			[this].concat(this.subclasses).forEach(function(klass) {
				callback(klass, klass[storageName]);
			});
		};

		this.$.addHook = function(name, type, filter, options) {
			var hook = new Hook(name, filter, type, options);

			this._modifyHooks(name, function(klass, storage) {
				storage.add(type, hook);
			});
		};
		
		this.$.skipHook = function(name, type, filter, options) {
			options = {
				if: options.unless,
				unless: options.if
			};

			this._modifyHooks(name, function(klass, storage) {
				var existent = storage.find(type, function(h) {
					return h.filter == filter;
				});

				if (existent) {
					storage.replace(type, existent, existent.merge(options));
				}
			});
		};
	});

	this.metaclass.$.included = function(base) {
		base.include(SubclassTracker);
		base.extend(this.ClassMethods);
	};

	this.$.executeWithHooks = function(name, fn) {
		return this.constructor[hookStorageName(name)].build(this).execute(fn);
	};
});

