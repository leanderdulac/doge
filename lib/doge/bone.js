var Promise = require('bluebird');
var SubclassTracker = require('./support/subclass-tracker');

module.exports = new Class('Bone', function() {
	this.include(SubclassTracker);
	this.include(require('./initializable'));

	// Mark us as abstract
	this.abstract = true

	// Track all our descendants
	this.$.initialize = function() {
		if (this.constructor.abstract) {
			throw new Error("abstract class cannot be instantiated");
		}
	};

	// Singleton instance
	this.metaclass.defineGetter('instance', function() {
		if (!this._instance) {
			this._instance = new this();
		}

		return this._instance;
	});
});

