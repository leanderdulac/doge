const Middleware = require('../middleware')
const { httpLogger } = require('../../../config/escriba-config')

module.exports = new Class('Logger', Middleware, function Logger () {
  this.$.initialize = function initialize (logger) {
    if (!logger) {
      logger = httpLogger
    }
    this.logger = logger
  }

  this.$.call = function call (req, res, next) {
    const preparePayload = () => {
      let request = {}
      let response = {}

      try {
        request = Object.assign(
          {},
          req,
          {
            body: req.body.length > 0 ? JSON.parse(req.body.toString()) : {},
          }
        )
        response = Object.assign(
          {},
          res,
          {
            body: JSON.stringify(res.body),
          }
        )
        response.end = () => {
          /*
            Escriba expected an express function called end that is
            attached to the response object. This function is called
            when the response process was finished, escriba get this
            finished signal and create a log for response.
            by @vitorabner
           */
        }
      } catch (e) {
        console.error(e)
      }

      return ({ request, response })
    }

    const logPayload = ({ request, response }) => {
      this.logger(request, response, () => {})
      if (response.body) {
        response.end(response.body)
      }
    }

    return next()
      .bind(this)
      .then(preparePayload)
      .then(logPayload)
  }
})

