import BaseController from './controllers/base-controller'
import OrderManagementController from './controllers/order-management-controller'
import AccountManagementController from './controllers/account-management-controller'
import ProductManagementController from './controllers/product-management-controller'
import ShopManagementController from './controllers/shop-management-controller'
import SupplierManagementController from './controllers/supplier-management-controller'
import SQLViewService from '../services/sql-view-service'

import { SiteData, ImageService } from '../site-definitions'
import * as Utils from '../libs/utils'

import AppConfig from '../app-config'

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  private imageService: ImageService
  private readonly imageURLFormatter

  constructor (initData: SiteData) {
    super(initData)
    this.imageService = new initData.services.ImageService(initData.db.sequelize, initData.db.models)
    this.imageURLFormatter = filename => `${AppConfig.BASE_URL}${AppConfig.IMAGE_MOUNT_PATH}${filename}`

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      res.locals.siteHash = this.siteHash
      next()
    })

    this.routePost('/image/get-url', (req, res, next) => {
      const filename = req.body.filename
      res.json({ status: true, data: Utils.getImageURL(filename) })
    })

    super.routeGet('/images', (req, res, next) => {
      this.imageService.getImages(this.imageURLFormatter).then(resp => {
        log.verbose(TAG, '/images.GET():' + JSON.stringify(resp))
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/image',
      this.imageService.getExpressUploadMiddleware(
        AppConfig.IMAGE_PATH, this.imageURLFormatter))

    super.routePost('/image/delete', (req, res, next) => {
      log.verbose(TAG, 'image/delete.POST: req.body=' + JSON.stringify(req.body))
      this.imageService.deleteImage(AppConfig.IMAGE_PATH, req.body.filename).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    this.routeGet('/', (req, res, next) => {
      res.locals.renderSidebar = true
      res.render('product-management')
    })

    this.routeGet('/populate-views', (req, res, next) => {
      SQLViewService.populateViews().then(resp => {
        res.json(resp)
      }).catch(next)
    })

    this.routeUse('/product-management', new ProductManagementController(initData).getRouter())
    this.routeUse('/shop-management', new ShopManagementController(initData).getRouter())
    this.routeUse('/supplier-management', new SupplierManagementController(initData).getRouter())
    this.routeUse('/order-management', new OrderManagementController(initData).getRouter())
    this.routeUse('/account-management', new AccountManagementController(initData).getRouter())
  }
}

module.exports = MainController
