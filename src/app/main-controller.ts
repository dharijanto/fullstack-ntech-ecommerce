import * as express from 'express'
import AppConfig from '../app-config'
import * as Promise from 'bluebird'

import BaseController from './controllers/base-controller'
import ProductService from '../services/product-service'
import LocalShopService from '../services/local-shop-service'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'
import shopService from '../services/shop-service';

const path = require('path')

let log = require('npmlog')

let CredentialController = require(path.join(__dirname, 'controllers/credential-controller'))

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })
    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH))

    LocalShopService.initialize().then(resp => {
      if (!resp.status) {
        this.routeGet('*', (req, res, next) => {
          res.status(500).send(resp.errMessage)
        })
      } else {
        this.addInterceptor((req, res, next) => {
          Object.keys(Utils).forEach(key => {
            res.locals[key] = Utils[key]
          })
          next()
        })

        this.routeGet('/', (req, res, next) => {
          Promise.join<NCResponse<any[]>>(
            LocalShopService.getPromotion(),
            ProductService.getCategories({}, true),
            LocalShopService.getProductsWithPrimaryImage()
          ).spread((resp: NCResponse<Promotion[]>, resp2: NCResponse<Category[]>, resp3: NCResponse<Product[]>) => {
            if (resp.status && resp.data &&
                resp2.status && resp2.data &&
                resp3.status && resp3.data) {
              // 2 spots for larger promotion banner, the rest is regular promotions
              res.locals.promotions = resp.data.slice(0, 2)
              res.locals.smallPromotions = resp.data.slice(2, resp.data.length)
              res.locals.categories = resp2.data
              res.locals.products = resp3.data
              res.render('home')
            } else {
              next('Failed to retrieve some information: ' + resp.errMessage || resp2.errMessage || resp3.errMessage)
            }
          }).catch(next)
        })

        this.routeGet('/:categoryId/*/:subCategoryId/*/:productId/*', (req, res, next) => {
          const categoryId = req.params.categoryId
          const subCategoryId = req.params.subCategoryId
          const productId = req.params.productId

          Promise.join<NCResponse<any[]>>(
            LocalShopService.getProductWithAllImages({ id: productId })
          ).spread((resp: NCResponse<Product[]>) => {
            if (resp.status && resp.data && resp.data.length) {
              res.locals.product = resp.data[0]
              log.verbose(TAG, 'product=' + JSON.stringify(resp.data))
              res.render('product')
            } else {
              res.status(500).send('Failed to retrieve product information')
            }
          }).catch(next)
          // res.send(`categoryId=${categoryId} subCategoryId=${subCategoryId} productId=${productId}`)
        })
      }
    })
    /* this.routeUse((new CredentialController(initData)).getRouter()) */
  }
}

module.exports = Controller
