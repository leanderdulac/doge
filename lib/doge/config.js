var fs = require('fs');
var Path = require('path');
var yaml = require('js-yaml');
var MiddlewareStack = require('./middleware-stack');
var MethodOverride = require('./middlewares/method-override');
var JsonBodyParser = require('./middlewares/json-body-parser');
var UrlEncodedBodyParser = require('./middlewares/urlencoded-body-parser');
var RequestId = require('./middlewares/request-id');
var Logger = require('./middlewares/logger');

module.exports = new Class('ApplicationConfiguration', function() {
	this.$.initialize = function(app) {
		var root = app.root;

		this.app = app;
		this.root = root;

		this.middleware = new MiddlewareStack();

		// Default middleware stack
		this.middleware.use(MethodOverride);
		this.middleware.use(RequestId);
		this.middleware.use(Logger);
		this.middleware.use(MethodOverride);
		this.middleware.use(JsonBodyParser);
		this.middleware.use(UrlEncodedBodyParser);
		this.middleware.use(this.app.router);

		this.paths = {
			root: root,
			app: Path.join(root, 'app'),
			controllers: Path.join(root, 'app/controllers'),
			config: Path.join(root, 'config'),
			routes: Path.join(root, 'config/routes'),
			initializers: Path.join(root, 'config/initializers')
		};
	};

	this.$.load = function(name, path) {
		if (!path) {
			path = name;
			name = undefined;
		}

		if (name && this[name]) {
			return this[name];
		}

		var config = yaml.load(fs.readFileSync(Path.join(this.paths.config, path + '.yml')));

		config = config[Doge.env];

		if (name) {
			this[name] = config;
		}

		return config;
	};
});

