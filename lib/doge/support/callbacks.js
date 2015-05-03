var _ = require('lodash');
var Promise = require('bluebird');

var SubclassTracker = require('./subclass-tracker');

var hookStorageName = function(hookName) {
	return '_' + hookName + 'Hooks';
};

var HookChain = new Class('HookChain', function() {
	this.$.initialize = function(hook, instance) {
		var checkConditions = function(hooks) {
			return _.filter(hooks, function(hook) {
				return _.all(hook.options.conditions || [], function(condition) {
					return condition.apply(instance);
				});
			});
		};

		this.instance = instance;
		this.before = checkConditions(hook.hooks.before);
		this.after = checkConditions(hook.hooks.after);
	};

	this.$.execute = function(fn) {
		return Promise.bind(this)
		.then(function() {
			return Promise.bind(this)
			.then(function() {
				return this.before;
			})
			.each(function(hook) {
				var fn = hook.hook;

				if (_.isString(fn)) {
					fn = this.instance[fn];
				}

				return fn.apply(this.instance);
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
				var fn = hook.hook;

				if (_.isString(fn)) {
					fn = this.instance[fn];
				}

				return fn.apply(this.instance);
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

	this.$.add = function(type, hook, options) {
		if (!options) {
			options = {};
		}

		if (type != 'before' && type != 'after') {
			throw new ArgumentError('invalid type option');
		}

		var existent = _.find(this.hooks[type], { hook: hook });

		if (existent) {
			existent.options = this.mergeOptions(existent.options, options);
		} else {
			this.hooks[type].push({
				hook: hook,
				options: options
			});
		}
	};

	this.$.skip = function(type, hook, options) {
		if (!options) {
			options = {};
		}

		this.add(type, hook, this.invertConditions(options));
	};

	this.$.build = function(instance) {
		return new HookChain(this, instance);
	};

	this.$.invertConditions = function(options) {
		options = _.clone(options);

		if (options.conditions) {
			options.conditions = _.map(options.conditions, function(condition) {
				return function() {
					return !condition.apply(this, arguments);
				};
			});
		}

		return options;
	};

	this.$.mergeOptions = function(a, b) {
		var options = {};

		a.conditions = (a.conditions || []).concat(b.conditions || []);

		return options;
	};

	this.$.clone = function() {
		var other = new HookCollection(this.name);

		other.hooks = _.clone(other.hooks);

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

		this.$.addHook = function(name, type, hook, options) {
			this._modifyHooks(name, function(klass, storage) {
				storage.add(type, hook, options);
			});
		};
		
		this.$.skipHook = function(name, type, hook, options) {
			this._modifyHooks(name, function(klass, storage) {
				storage.skip(type, hook, options);
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

