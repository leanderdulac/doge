var methods = require('methods');

module.exports = new Module('Router::HTTP', function() {
	methods.forEach(function(method) {
		this.$[method] = function() {
			this.match.apply(this, Array.prototype.slice.call(arguments).concat({
				via: method
			}));
		};
	}.bind(this));
});

