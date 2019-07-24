import * as express from 'express'
import * as Promise from 'bluebird'
import * as sharp from 'sharp'

import * as AppConfig from '../app-config'
import BaseController from './controllers/base-controller'
import CartController from './controllers/shop/cart-controller'
import CMSController from './controllers/cms-controller'
import CloudSyncController from './controllers/cloud-sync-controller'
import * as AppHelper from '../libs/application-helper'
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
    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH, { maxAge: AppConfig.ENABLE_MAX_AGE_CACHING ? '1h' : '0' }))

    // Thumbnail images
    // The images are generated dynamically. We rely on caching in order to reduce CPU load
    this.routeGet('/thumbnail-images/:imageFilename(*)', (req, res, next) => {
      const inputImage = path.join(AppConfig.IMAGE_PATH, req.params.imageFilename)
      // TODO: We should move this to util
      sharp(inputImage).resize(250).png().toBuffer().then(data => {
        res.contentType('png')
        res.setHeader('Cache-Control', `public, max-age=${AppConfig.ENABLE_MAX_AGE_CACHING ? '1h' : '0'}`)
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
      // This throws an error if server type fails to validate
      AppHelper.validateApplicationConfig(),
      LocalShopService.initialize(),
      SearchService.initialize()
    ).spread((resp0: NCResponse<null>, resp1: NCResponse<null>, resp2: NCResponse<null>) => {
      if (resp0.status && resp1.status && resp2.status) {
        return PassportManager.initialize(LocalShopService.getLocalShopId()).then(() => {
          this.addInterceptor((req, res, next) => {
            // Helper utilities (i.e. string formatter)
            Object.keys(Utils).forEach(key => {
              res.locals[key] = Utils[key]
            })
            res.locals.serverType = AppHelper.getServerType()
            // Currently logged-in user
            res.locals.user = req.user
            next()
          })

          // It's convenient to allow dev server to act as both cloud and local server, especially for testing purposes
          if (!AppConfig.PRODUCTION || AppConfig.SERVER_TYPE === 'CLOUD_ONLY') {
            // Cloud specific
            this.routeUse('/cloud-sync', (new CloudSyncController(siteData).getRouter()))
          }
          if (!AppConfig.PRODUCTION || AppConfig.SERVER_TYPE === 'ON_PREMISE') {
            // Local specific
            this.routeUse('/local-sync', (new LocalSyncController(siteData).getRouter()))
          }

          // CMS controller
          this.routeUse('/cms', (new CMSController(siteData).getRouter()))
          // More involved logics are separated into different controllers
          this.routeUse('/', (new ShopController(siteData).getRouter()))
        })
      } else {
        throw new Error(resp0.errMessage || resp1.errMessage || resp2.errMessage)
      }
    }).catch(err => {
      log.error(TAG, 'Error in initializing application: ' + err.message)
      this.routeUse('*', (req, res, next) => {
        next(err)
      })
    })
  }
}

module.exports = Controller
