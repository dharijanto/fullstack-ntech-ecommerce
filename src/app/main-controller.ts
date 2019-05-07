import * as express from 'express'
import * as Promise from 'bluebird'

import * as AppConfig from '../app-config'
import BaseController from './controllers/base-controller'
import CartController from './controllers/shop/cart-controller'
import AccountController from './controllers/account-controller'
import CMSController from './controllers/cms-controller'
import LocalShopService from './local-shop-services/local-shop-service'
import ProductService from '../services/product-service'
import ShopController from './controllers/shop/shop-controller'
import SequelizeService from '../services/sequelize-service'
import SearchService from '../services/search-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'
import PassportManager from './libs/passport-manager'
import PassportHelper from './libs/passport-helper'

const path = require('path')

let log = require('npmlog')
log.level = 'debug'

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH))

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

          this.routeUse('/cms/account', (new AccountController(siteData).getRouter()))
          this.routeUse('/cms', PassportHelper.ensureLoggedIn({}), (new CMSController(siteData).getRouter()))
          // More involved logics are separated into different controllers
          this.routeUse('/cart', (new CartController(siteData).getRouter()))
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
