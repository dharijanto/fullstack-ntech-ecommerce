import * as log from 'npmlog'
import * as Promise from 'bluebird'

import BaseController from './controllers/base-controller'
import OrderManagementController from './controllers/order-management-controller'
import AccountManagementController from './controllers/account-management-controller'
import ProductManagementController from './controllers/product-management-controller'
import ShopManagementController from './controllers/shop-management-controller'
import SupplierManagementController from './controllers/supplier-management-controller'
import SQLViewService from '../services/sql-view-service'

import { SiteData, ImageService } from '../site-definitions'
import * as Utils from '../libs/utils'

import * as AppConfig from '../app-config'
import SearchService from '../services/search-service'
import LocalSyncService from '../app/local-shop-services/sync-service'
import OrderService from '../app/local-shop-services/order-service'

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

      res.locals.__sidebar = []

      // Cloud-only menu
      if (AppConfig.IS_CLOUD_SERVER || !AppConfig.PRODUCTION) {
        res.locals.__sidebar.push({ title: 'Product Management', url: `/${this.siteHash}/`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Shop Management', url: `/${this.siteHash}/shop-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Supplier Management', url: `/${this.siteHash}/supplier-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Promotion Management', url: `/${this.siteHash}/shop-management/promotion-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Order Management', url: `/${this.siteHash}/order-management/`, faicon: '' })
      }

      // Local-only menu
      if (!AppConfig.IS_CLOUD_SERVER || !AppConfig.PRODUCTION) {
        res.locals.__sidebar.push({ title: 'Account Management', url: `/${this.siteHash}/account-management/`, faicon: '' })
      }

      // Menu for both local and cloud
      res.locals.__sidebar.push({ title: 'Populate Views', url: `/${this.siteHash}/populate-views`, faicon: '' })
      res.locals.__sidebar.push({ title: 'Reindex Search Cache', url: `/${this.siteHash}/reindex-search-database`, faicon: '' })
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

    /**
     * Test that the build environment is set up properly.
     * Since there are components that when missing or not setup correctly isn't easily spotted,
     * this route is used to validate them.
     *
     * Things to check:
     * 1. Sphinx setup
     *  a. Be able to rotate the log
     * 2.
     */
    this.routeGet('/reindex-search-database', (req, res, next) => {
      Promise.join(
        SearchService.reindexDatabase()
      ).spread((resp: NCResponse<any>) => {
        res.json('Success! \n' + JSON.stringify(resp.data))
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
