var Middleware = require('../middleware');

module.exports = Middleware.fromConnectMiddleware('JsonBodyParser', require('body-parser').json);

