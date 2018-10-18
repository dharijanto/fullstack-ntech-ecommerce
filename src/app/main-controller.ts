import * as express from 'express'
import AppConfig from '../app-config'
import * as Promise from 'bluebird'

import BaseController from './controllers/base-controller'
import CartService from '../services/cart-service'
import ProductService from '../services/product-service'
import LocalShopService from '../services/local-shop-service'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'

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
            LocalShopService.getInStockProducts({}),
            LocalShopService.getPOProducts({})
          ).spread((resp: NCResponse<Promotion[]>, resp2: NCResponse<Category[]>, resp3: NCResponse<InStockProduct[]>, resp4: NCResponse<POProduct[]>) => {
            if (resp.status && resp.data &&
                resp2.status && resp2.data &&
                resp3.status && resp3.data) {
              // 2 spots for larger promotion banner, the rest is regular promotions
              res.locals.promotions = resp.data.slice(0, 2)
              res.locals.smallPromotions = resp.data.slice(2, resp.data.length)
              res.locals.categories = resp2.data
              res.locals.inStockProducts = resp3.data
              res.locals.poProducts = resp4.data
              res.render('home')
            } else {
              next('Failed to retrieve some information: ' + resp.errMessage || resp2.errMessage || resp3.errMessage)
            }
          }).catch(next)
        })

        this.routeGet('/:categoryId/*/:subCategoryId/*/:productId/*/', (req, res, next) => {
          const categoryId = req.params.categoryId
          const subCategoryId = req.params.subCategoryId
          const productId = req.params.productId
          Promise.join<NCResponse<any>>(
            LocalShopService.getInStockProduct(productId),
            LocalShopService.getPOProduct(productId)
          ).spread((resp1: NCResponse<InStockProduct>, resp2: NCResponse<POProduct>) => {
            if (resp1.status) {
              res.locals.product = resp1.data
              log.verbose(TAG, 'product=' + JSON.stringify(resp1.data))
              res.render('ready-product')
            } else if (resp2.status) {
              res.locals.product = resp2.data
              log.verbose(TAG, 'product=' + JSON.stringify(resp2.data))
              res.render('po-product')
            } else {
              /* next(new Error('Product with id=' + productId + ' is not found!')) */
              // TODO: render "maaf produk ini sedang tidak tersedia"
              res.render('product-unavailable')
            }
          }).catch(err => {
            next(err)
          })
        })

        this.routePost('/cart/add-item', (req, res, next) => {
          console.dir(req.session)
          if (req.session) {
            CartService.addItemToCart(req.session.cart, req.body).then(resp => {
              if (resp.status) {
                if (req.session) {
                  req.session.cart = resp.data
                  res.json({ status: true, data: resp.data })
                } else {
                  res.json({ status: false, errMessage: 'Session is not defined!' })
                }
              } else {
                res.json(resp)
              }
            })
          } else {
            res.json({ status: false, errMessage: 'Session is not defined!' })
          }
        })

        this.routePost('/cart/add-po-item', (req, res, next) => {
          console.dir(req.session)
          if (req.session) {
            CartService.addPOItemToCart(req.session.cart, req.body).then(resp => {
              if (resp.status) {
                if (req.session) {
                  req.session.cart = resp.data
                  res.json({ status: true, data: resp.data })
                } else {
                  res.json({ status: false, errMessage: 'Session is not defined!' })
                }
              } else {
                res.json(resp)
              }
            })
          } else {
            res.json({ status: false, errMessage: 'Session is not defined!' })
          }
        })

        this.routeGet('/cart', (req, res, next) => {
          if (req.session) {
            CartService.getCart(req.session.cart).then(resp => {
              if (resp.status) {
                res.locals.cart = resp.data
                res.render('cart')
              } else {
                next(new Error(resp.errMessage))
              }
            })
          } else {
            next(new Error('Session is not defined!'))
          }
        })
      }
    })
    /* this.routeUse((new CredentialController(initData)).getRouter()) */
  }
}

module.exports = Controller
