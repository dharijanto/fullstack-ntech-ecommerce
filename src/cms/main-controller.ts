import BaseController from './controllers/base-controller'
import ProductManagementController from './controllers/product-management-controller'
import { SiteData } from '../site-definitions'

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  constructor (initData: SiteData) {
    super(initData)
    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      res.locals.siteHash = this.siteHash
      next()
    })

    this.routeGet('/', (req, res, next) => {
      res.render('category')
    })

    initData.site.hash = ''
    this.routeUse('/product-management', new ProductManagementController(initData).getRouter())
  }
}

module.exports = MainController
