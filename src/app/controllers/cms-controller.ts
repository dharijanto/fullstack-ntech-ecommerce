import * as express from 'express'
import AppConfig from '../../app-config'
import * as Promise from 'bluebird'

import BaseController from './base-controller'
import CartService from '../local-shop-services/cart-service'
import OrderManagementController from './cms/order-management-controller'
import ProductManagementController from './cms/product-management-controller'
import PromotionManagementController from './cms/promotion-management-controller'
import StockManagementController from './cms/stock-management-controller'
import { SiteData } from '../../site-definitions'
import * as Utils from '../../libs/utils'
import LocalShopService from '../local-shop-services/local-shop-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class CMSController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    super.routeGet('/', (req, res, next) => {
      res.redirect('/cms/order-management')
    })

    super.routeGet('/price-list', (req, res, next) => {
      LocalShopService.getProductsByCategories().then(resp => {
        if (resp.status && resp.data) {
          console.log(JSON.stringify(resp.data, null, 2))
          res.locals.lastUpdated = resp.data.lastUpdated
          res.locals.categories = resp.data.categories
          res.render('cms/price-list')
        } else {
          next(new Error(resp.errMessage))
        }
      })
    })

    super.routeUse('/order-management', new OrderManagementController(siteData).getRouter())
    super.routeUse('/product-management', new ProductManagementController(siteData).getRouter())
    super.routeUse('/promotion-management', new PromotionManagementController(siteData).getRouter())
    super.routeUse('/stock-management', new StockManagementController(siteData).getRouter())
  }
}
