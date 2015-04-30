var Middleware = require('../middleware');

module.exports = Middleware.fromConnectMiddleware('DsonBodyParser', require('dson-middleware'));

