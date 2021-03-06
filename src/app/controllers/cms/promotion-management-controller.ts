import * as AppConfig from '../../../app-config'
import BaseController from '../base-controller'
import LocalShopService from '../../local-shop-services/local-shop-service'
import { SiteData, ImageService } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

/*
TODO: Only user with admin privilege can access this page!
*/
export default class PromotionManagementController extends BaseController {
  private imageService: ImageService
  private readonly imageURLFormatter
  private readonly PROMOTION_IMAGES_PATH: string = AppConfig.IMAGE_PATH

  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    this.imageService = new siteData.services.ImageService(siteData.db.sequelize, siteData.db.models)
    this.imageURLFormatter = (imageFilename) => Utils.getImageURL(imageFilename, true)

    super.routeGet('/', (req, res, next) => {
      res.render('cms/promotion-management')
    })

    super.routeGet('/promotions', (req, res, next) => {
      LocalShopService.getPromotions().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/promotion', (req, res, next) => {
      const productId = req.query.productId
      if (!productId) {
        res.json({ status: false, errMessage: 'productId is required' })
      } else {
        LocalShopService.createPromotion(productId, req.body).then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/promotion/edit', (req, res, next) => {
      const productId = req.query.productId

      if (!productId) {
        res.json({ status: false, errMessage: 'productId is required' })
      } else {
        LocalShopService.updatePromotion(productId, req.body.id, req.body)
            .then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/promotion/delete', (req, res, next) => {
      LocalShopService.deletePromotion(req.body.id).then(res.json.bind(res)).catch(next)
    })

    this.routePost('/image/get-url', (req, res, next) => {
      const filename = req.body.filename
      res.json({ status: true, data: this.imageURLFormatter(filename) })
    })

    super.routeGet('/images', (req, res, next) => {
      this.imageService.getImages(this.imageURLFormatter).then(resp => {
        log.verbose(TAG, '/images.GET():' + JSON.stringify(resp))
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/image',
      this.imageService.getExpressUploadMiddleware(this.PROMOTION_IMAGES_PATH, this.imageURLFormatter))

    super.routePost('/image/delete', (req, res, next) => {
      log.verbose(TAG, 'image/delete.POST: req.body=' + JSON.stringify(req.body))
      this.imageService.deleteImage(this.PROMOTION_IMAGES_PATH, req.body.filename).then(resp => {
        res.json(resp)
      }).catch(next)
    })
  }
}
