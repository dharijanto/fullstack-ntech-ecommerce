import * as express from 'express'
import * as Promise from 'bluebird'
import * as sharp from 'sharp'

import * as AppConfig from '../app-config'
import BaseController from './controllers/base-controller'
import CartController from './controllers/shop/cart-controller'
import CMSController from './controllers/cms-controller'
import CloudSyncController from './controllers/cloud-sync-controller'
import LocalSyncController from './controllers/shop-sync-controller'
import LocalShopService from './local-shop-services/local-shop-service'
import ProductService from '../services/product-service'
import ShopController from './controllers/shop/shop-controller'
import SequelizeService from '../services/sequelize-service'
import SearchService from '../services/search-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'
import PassportManager from './libs/passport-manager'

const path = require('path')

let log = require('npmlog')
log.level = 'debug'

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    // Full resolution images
    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH, { maxAge: AppConfig.PRODUCTION ? '1h' : '0' }))

    // Thumbnail images
    // The images are generated dynamically. We rely on caching in order to
    // reduce CPU load
    this.routeGet('/thumbnail-images/:imageFilename(*)', (req, res, next) => {
      const inputImage = path.join(AppConfig.IMAGE_PATH, req.params.imageFilename)

      // TODO: We should move this to util
      sharp(inputImage).resize(250).png().toBuffer().then(data => {
        res.contentType('png')
        res.setHeader('Cache-Control', `public, max-age=${AppConfig.PRODUCTION ? '1h' : '0'}`)
        res.end(data)
      }).catch(err => {
        if (err.message === 'Input file is missing') {
          next()
        } else {
          next(err)
        }
      })
    })

    Promise.join(
      LocalShopService.initialize(),
      SearchService.initialize()
    ).spread((resp1: NCResponse<null>, resp2: NCResponse<null>) => {
      PassportManager.initialize(LocalShopService.getLocalShopId()).then(() => {
        if (resp1.status && resp2.status) {
          this.addInterceptor((req, res, next) => {
            log.verbose(TAG, 'req.path=' + req.path)
            log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
            log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
            res.locals.user = req.user
            ProductService.getCategories({}, true).then(resp => {
              if (resp.status && resp.data) {
                Object.keys(Utils).forEach(key => {
                  res.locals[key] = Utils[key]
                })
                res.locals.categories = resp.data
                next()
              } else {
                throw new Error('Failed to retrieve categories: ' + resp.errMessage)
              }
            }).catch(err => {
              next(err)
            })
          })

          // It's convenient to allow dev server to act as both cloud and local server, especially for testing purposes
          if (!AppConfig.PRODUCTION || AppConfig.IS_CLOUD_SERVER) {
            // Cloud specific
            this.routeUse('/cloud-sync', (new CloudSyncController(siteData).getRouter()))
          }
          if (!AppConfig.PRODUCTION || !AppConfig.IS_CLOUD_SERVER) {
            // Local specific
            this.routeUse('/local-sync', (new LocalSyncController(siteData).getRouter()))
            // CMS path
            this.routeUse('/cms', (new CMSController(siteData).getRouter()))
            this.routeUse('/cart', (new CartController(siteData).getRouter()))
          }

          // More involved logics are separated into different controllers
          this.routeUse('/', (new ShopController(siteData).getRouter()))

        } else {
          throw new Error(resp1.errMessage || resp2.errMessage)
        }
      })
    }).catch(err => {
      this.routeUse('*', (req, res, next) => {
        next(err)
      })
    })
  }
}

module.exports = Controller
