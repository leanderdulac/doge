var Middleware = require('../middleware');

module.exports = Middleware.fromConnectMiddleware('BodyParser', require('body-parser'));

