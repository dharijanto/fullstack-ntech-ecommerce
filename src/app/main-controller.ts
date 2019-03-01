import * as express from 'express'
import AppConfig from '../app-config'
import * as Promise from 'bluebird'

import BaseController from './controllers/base-controller'
import CartController from './controllers/cart-controller'
import CMSController from './controllers/cms-controller'
import ProductService from '../services/product-service'
import LocalShopService from '../services/local-shop-service'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'

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
      if (!resp.status) {
        this.routeGet('*', (req, res, next) => {
          res.status(500).send(resp.errMessage)
        })
      } else {
        this.addInterceptor((req, res, next) => {
          log.verbose(TAG, 'req.path=' + req.path)
          log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
          log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
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

        this.routeUse('/cms', (new CMSController(siteData).getRouter()))

        // More involved logics are separated into different controllers
        this.routeUse('/cart', (new CartController(siteData).getRouter()))

        // Landing page
        // The main view where we show promoted items, categories & subs, and latest products
        // TODO:
        // 1. Show latest products instead of all products
        this.routeGet('/', (req, res, next) => {
          res.locals.currentPOProductPage = req.query['po-products-page'] || 1
          res.locals.currentInStockProductPage = req.query['in-stock-products-page'] || 1
          const inStockProductPageSize = 9
          const poProductPageSize = 9

          Promise.join<NCResponse<any>>(
            LocalShopService.getPromotion(),
            LocalShopService.getInStockProducts({ pageIndex: res.locals.currentInStockProductPage - 1, pageSize: inStockProductPageSize }),
            LocalShopService.getPOProducts({ pageIndex: res.locals.currentPOProductPage - 1, pageSize: poProductPageSize })
          ).spread((resp: NCResponse<Promotion[]>,
                    resp3: NCResponse<{products: InStockProduct[], totalProducts: number}>,
                    resp4: NCResponse<{products: POProduct[], totalProducts: number}>) => {
            if (resp.status && resp.data &&
                resp3.status && resp3.data &&
                resp4.status && resp4.data) {
              // 2 spots for larger promotion banner, the rest is regular promotions
              res.locals.inStockProductTotalPage = Utils.getNumberOfPage(resp3.data.totalProducts, inStockProductPageSize)
              res.locals.poProductTotalPage = Utils.getNumberOfPage(resp4.data.totalProducts, poProductPageSize)
              res.locals.promotions = resp.data.slice(0, 2)
              res.locals.smallPromotions = resp.data.slice(2, resp.data.length)
              res.locals.inStockProducts = resp3.data.products
              res.locals.poProducts = resp4.data.products
              res.render('home')
              // res.send('haha')
            } else {
              throw new Error('Failed to retrieve some information: ' +
                    resp.errMessage || resp3.errMessage || resp4.errMessage)
            }
          }).catch(next)
        })

        // Product page
        // Information related to a specific product, customer can order here
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
              res.render('instock-product')
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

        // Sub-category page
        this.routeGet('/:categoryId/*/:subCategoryId/*/', (req, res, next) => {
          const subCategoryId = req.params.subCategoryId
          res.locals.currentInStockProductPage = req.query['in-stock-products-page'] || 1
          res.locals.currentPOProductPage = req.query['po-products-page'] || 1
          const inStockProductPageSize = 15
          const poProductPageSize = 15

          Promise.join<NCResponse<any>>(
            LocalShopService.getInStockProducts({ subCategoryId }),
            LocalShopService.getPOProducts({ subCategoryId }),
            ProductService.getSubCategory(subCategoryId)
          ).spread((resp1: NCResponse<{ products: InStockProduct[], totalProducts: number }>,
                    resp2: NCResponse<{ products: POProduct[], totalProducts: number }>,
                    resp3: NCResponse<SubCategory>) => {
            if (resp1.status && resp1.data &&
                resp2.status && resp2.data &&
                resp3.status && resp3.data) {
              res.locals.inStockProductTotalPage = Utils.getNumberOfPage(resp1.data.totalProducts, inStockProductPageSize)
              res.locals.poProductTotalPage = Utils.getNumberOfPage(resp2.data.totalProducts, poProductPageSize)
              res.locals.inStockProducts = resp1.data.products
              res.locals.poProducts = resp2.data.products
              res.locals.subCategory = resp3.data
              res.locals.category = resp3.data.category
              res.render('sub-category')
            } else {
              console.dir('resp1=' + JSON.stringify(resp1))
              console.dir('resp2=' + JSON.stringify(resp2))
              console.dir('resp3=' + JSON.stringify(resp3))
              throw new Error('Failed to retrieve inStockProducts, poProducts, or subCategory: ' + (resp1.errMessage || resp2.errMessage || resp3.errMessage))
            }
          }).catch(err => {
            next(err)
          })
        })

        // Category page
        // NOTE: Because this route path is a 'super-path' of sub-category page, this has to be defined later
        this.routeGet('/:categoryId/*/', (req, res, next) => {
          const categoryId = req.params.categoryId
          res.locals.currentInStockProductPage = req.query['in-stock-products-page'] || 1
          res.locals.currentPOProductPage = req.query['po-products-page'] || 1
          const inStockProductPageSize = 15
          const poProductPageSize = 15

          log.verbose(TAG, '/:categoryId/*.GET: req.params=' + JSON.stringify(req.params))
          Promise.join<NCResponse<any>>(
            LocalShopService.getInStockProducts({ categoryId, pageSize: inStockProductPageSize,
              pageIndex: res.locals.currentInStockProductPage - 1 }),
            LocalShopService.getPOProducts({ categoryId, pageSize: poProductPageSize,
              pageIndex: res.locals.currentPOProductPage - 1 }),
            ProductService.getCategory(categoryId)
          ).spread((resp1: NCResponse<{ products: InStockProduct[], totalProducts: number}>,
                    resp2: NCResponse<{ products: POProduct[], totalProducts: number }>,
                    resp3: NCResponse<Category>) => {
            if (resp1.status && resp1.data &&
                resp2.status && resp2.data &&
                resp3.status && resp3.data) {
              res.locals.inStockProductTotalPage = Utils.getNumberOfPage(resp1.data.totalProducts, inStockProductPageSize)
              res.locals.poProductTotalPage = Utils.getNumberOfPage(resp2.data.totalProducts, poProductPageSize)
              res.locals.inStockProducts = resp1.data.products
              res.locals.poProducts = resp2.data.products
              res.locals.category = resp3.data
              res.render('category')
            } else {
              throw new Error('Failed to retrieve inStockProducts, poProducts, or subCategory: ' + resp1.errMessage || resp2.errMessage || resp3.errMessage)
            }
          }).catch(err => {
            next(err)
          })
        })
      }
    })
    /* this.routeUse((new CredentialController(initData)).getRouter()) */

  }
}

module.exports = Controller
