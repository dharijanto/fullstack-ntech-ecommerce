import BaseController from './controllers/base-controller'
import ProductManagementController from './controllers/product-management-controller'
import ShopManagementController from './controllers/shop-management-controller'
import SupplierManagementController from './controllers/supplier-management-controller'

import { SiteData, ImageService } from '../site-definitions'

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
    this.routeUse('/shop-management', new ShopManagementController(initData).getRouter())
    this.routeUse('/supplier-management', new SupplierManagementController(initData).getRouter())
  }
}

module.exports = MainController
