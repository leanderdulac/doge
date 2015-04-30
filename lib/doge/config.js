var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var MiddlewareStack = require('./middleware-stack');
var MethodOverride = require('./middlewares/method-override');
var JsonBodyParser = require('./middlewares/json-body-parser');
var UrlEncodedBodyParser = require('./middlewares/urlencoded-body-parser');
var RequestId = require('./middlewares/request-id');
var Logger = require('./middlewares/logger');

module.exports = new Class('ApplicationConfiguration', function() {
	this.$.initialize = function(root, env) {
		this.root = root;
		this.environment = env;

		this.middlewares = new MiddlewareStack();

		// Default middleware stack
		this.middlewares.use(MethodOverride);
		this.middlewares.use(RequestId);
		this.middlewares.use(Logger);
		this.middlewares.use(JsonBodyParser);
		this.middlewares.use(UrlEncodedBodyParser);

		this.paths = {
			root: root,
			app: path.join(root, 'app'),
			controllers: path.join(root, 'app/controllers'),
			config: path.join(root, 'config'),
			routes: path.join(root, 'config/routes.js')
		};
	};

	this.$.load = function(name) {
		var config = yaml.load(fs.readFileSync(path.join(this.paths.config, name + '.yml')));

		return config[this.environment];
	};
});

