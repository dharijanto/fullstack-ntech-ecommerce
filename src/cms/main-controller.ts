import BaseController from './controllers/base-controller'
import ProductManagementController from './controllers/product-management-controller'
import { SiteData, ImageService } from '../site-definitions'

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
      res.render('product-management')
    })

    this.routeUse('/product-management', new ProductManagementController(initData).getRouter())
  }
}

module.exports = MainController
