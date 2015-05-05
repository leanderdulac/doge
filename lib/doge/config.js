var fs = require('fs');
var Path = require('path');
var yaml = require('js-yaml');
var MiddlewareStack = require('./middleware-stack');
var Runtime = require('./middlewares/runtime');
var MethodOverride = require('./middlewares/method-override');
var RequestId = require('./middlewares/request-id');
var Logger = require('./middlewares/logger');
var RemoteIp = require('./middlewares/remote-ip');
var BodyParser = require('./middlewares/body-parser');
var Cors = require('./middlewares/cors');

module.exports = new Class('ApplicationConfiguration', function() {
	this.$.initialize = function(app) {
		var root = app.root;

		this.app = app;
		this.root = root;
		this.middleware = new MiddlewareStack();
		this.trustProxy = 'loopback';
		this.defaultContentType = 'application/json';

		this.paths = {
			root: root,
			app: Path.join(root, 'app'),
			controllers: Path.join(root, 'app/controllers'),
			config: Path.join(root, 'config'),
			routes: Path.join(root, 'config/routes'),
			initializers: Path.join(root, 'config/initializers')
		};
	};

	this.$.initializeDefaultMiddlewareStack = function() {
		this.middleware.use(Logger);
		this.middleware.use(Runtime);
		this.middleware.use(MethodOverride);
		this.middleware.use(RequestId);
		this.middleware.use(RemoteIp);
		this.middleware.use(BodyParser);
		this.middleware.use(Cors);
		this.middleware.use(this.app.routes);
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

