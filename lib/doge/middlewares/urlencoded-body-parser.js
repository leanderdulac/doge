var Middleware = require('../middleware');

module.exports = Middleware.fromConnectMiddleware('UrlEncodedBodyParser', require('body-parser').urlencoded, {
	extended: true
});

