import BaseController from './controllers/base-controller'
const path = require('path')

var log = require('npmlog')

var CredentialController = require(path.join(__dirname, 'controllers/credential-controller'))

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData) {
    super(siteData)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })

    this.routeGet('/', (req, res, next) => {
      res.send('hello')
    })

    /* this.routeUse((new CredentialController(initData)).getRouter()) */
  }
}

module.exports = Controller
