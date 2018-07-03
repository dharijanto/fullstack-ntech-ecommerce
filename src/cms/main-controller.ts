import BaseController from './controllers/base-controller'
import ProductManagementController from './controllers/product-management-controller'
import { SiteData, ImageService } from '../site-definitions'

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  private imageService: ImageService
  constructor (initData: SiteData) {
    super(initData)
    const ImageServiceImpl = initData.services.ImageService
    this.imageService = new ImageServiceImpl(initData.db.sequelize, initData.db.models)

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
