import * as express from 'express'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'
import BaseController from './controllers/base-controller'
import CartController from './controllers/shop/cart-controller'
import CMSController from './controllers/cms-controller'
import LocalShopService from './local-shop-services/local-shop-service'
import ShopController from './controllers/shop/shop-controller'
import SequelizeService from '../services/sequelize-service'
import SearchService from '../services/search-service'
import { SiteData } from '../site-definitions'

const path = require('path')

let log = require('npmlog')
log.level = 'debug'

let CredentialController = require(path.join(__dirname, 'controllers/credential-controller'))

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH))

    LocalShopService.initialize().then(resp => {
      SearchService.initialize().then(() => {
        if (!resp.status) {
          this.routeGet('*', (req, res, next) => {
            res.status(500).send(resp.errMessage)
          })
        } else {
          this.addInterceptor((req, res, next) => {
            log.verbose(TAG, 'req.path=' + req.path)
            log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
            log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
            next()
          })
          this.routeUse('/cms', (new CMSController(siteData).getRouter()))
          // More involved logics are separated into different controllers
          this.routeUse('/cart', (new CartController(siteData).getRouter()))
          this.routeUse('/', (new ShopController(siteData).getRouter()))
        }
      })
      /* this.routeUse((new CredentialController(initData)).getRouter()) */
    })
  }
}

module.exports = Controller
