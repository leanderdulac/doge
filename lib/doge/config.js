var MiddlewareStack = require('./middleware-stack');
var MethodOverride = require('./middlewares/method-override');
var JsonBodyParser = require('./middlewares/json-body-parser');
var UrlEncodedBodyParser = require('./middlewares/urlencoded-body-parser');

module.exports = new Class('ApplicationConfiguration', function() {
	this.$.initialize = function() {
		this.middlewares = new MiddlewareStack();

		// Default middleware stack
		this.middlewares.use(MethodOverride);
		this.middlewares.use(JsonBodyParser);
		this.middlewares.use(UrlEncodedBodyParser);
	};
});

