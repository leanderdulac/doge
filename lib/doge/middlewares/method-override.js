var Middleware = require('../middleware');

module.exports = Middleware.fromConnectMiddleware('MethodOverride', require('method-override'));

