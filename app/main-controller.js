const path = require('path')

var log = require('npmlog')

var BaseController = require(path.join(__dirname, 'controllers/base-controller'))
var CredentialController = require(path.join(__dirname, 'controllers/credential-controller'))

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (initData) {
    super(initData)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })

    this.routeUse((new CredentialController(initData)).getRouter())
  }
}

module.exports = Controller
