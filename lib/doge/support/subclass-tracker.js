var _ = require('lodash');
var SubclassTracker = new Module('SubclassTracker');
var ClassMethods = new Module('SubclassTracker::ClassMethods');

SubclassTracker.metaclass.$.included = function(base) {
	base.extend(ClassMethods);
};

ClassMethods.$.inherited = function(klass) {
	if (!this._subclasses) {
		this._subclasses = [];
	}

	this._subclasses.push(klass);

	$super();
};

ClassMethods.defineGetter('subclasses', function() {
	var subclasses = this._subclasses || [];

	return subclasses.concat(_(subclasses).map(function(klass) {
		return klass.subclasses;
	})
	.flatten()
	.value());
});

module.exports = SubclassTracker;

