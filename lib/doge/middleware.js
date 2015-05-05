module.exports = new Class('Middleware', function() {
	this.$.call = function(req, res, next) {
		return next();
	};
});

