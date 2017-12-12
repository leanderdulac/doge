const log4js = require('log4js')
const escriba = require('escriba')

const log4jsConfig = {
  appenders: [{
    type: 'console',
    layout: {
      type: 'pattern',
      pattern: '%[%m%]%n',
    },
  }],
}

log4js.configure(log4jsConfig)

const escribaConfig = {
  loggerEngine: log4js.getLogger(),
  service: 'api-admin',
  sensitive: {
    api_admin: {
      paths: [
        'body.card_cvv',
        'body.card_number',
        'body.card_expiration_date',
        'body.password',
        'body.expiration_date',
        'body.number',
      ],
      pattern: /\w.*/g,
      replacer: '*',
    },
    keys: {
      paths: [
        'body.api_key',
        'body.api_key.test',
        'query',
        'originalUrl',
        'url',
        'body.api_key.live',
        'body.encryption_key.live',
        'body.encryption_key.test',
      ],
      pattern: /"?session_id"?[=|:]"?(\w{60})"?|(ak_(live|test)_|ek_(live|test)_)(\w{30})/g,
      replacer: '*',
    },
  },
  httpConf: {
    logIdPath: 'headers.x-request-id',
    propsToLog: {
      request: [
        'id',
        'method',
        'url',
        'body',
        'headers.X-Request-ID',
        'httpVersion',
        'referrer',
        'referer',
        'user-agent',
      ],
      response: [
        'id',
        'method',
        'url',
        'company._id',
        'company.name',
        'status',
        'body',
        'httpVersion',
        'referrer',
        'referer',
        'user-agent',
        'latency',
        'authenticationMethod',
        'user._id',
        'user.email',
        'user.name',
      ],
    },
    skipRules: {
      bannedRoutes: [/\/status/],
      bannedMethods: ['OPTIONS'],
      bannedBodyRoutes: [/.*\.(csv|xlsx)$/, /\/search/],
    },
  },
}

module.exports = escriba(escribaConfig)
