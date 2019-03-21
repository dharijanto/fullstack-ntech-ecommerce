import * as express from 'express'
import * as Promise from 'bluebird'
import * as pug from 'pug'

import BaseController from '../base-controller'
import ShopService from '../../../services/shop-service'
import LocalShopService from '../../../services/local-shop-service'
import { SiteData } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'
import OrderService from '../../../services/local-shop/order-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

/*
TODO: Only user with admin privilege can access this page!
*/
export default class ProductManagementController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    super.routeGet('/', (req, res, next) => {
      res.render('cms/product-management')
    })

    super.routeGet('/products', (req, res, next) => {
      LocalShopService.getShopifiedProducts().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/product/edit', (req, res, next) => {
      const productId = req.body.id
      const data = {
        price: req.body['shopPrice'],
        preOrderAllowed: req.body['preOrderAllowed'],
        preOrderDuration: req.body['preOrderDuration'],
        disabled: req.body['disabled']
      }

      LocalShopService.updateProduct(productId, data).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/variants', (req, res, next) => {
      const productId = req.query.productId
      LocalShopService.getShopifiedVariants(productId).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/shop-stocks', (req, res, next) => {
      LocalShopService.getShopStock().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/shop-stock', (req, res, next) => {
      const variantId = req.query.variantId

      if (!variantId) {
        res.json({ status: false, errMessage: 'variantId is required' })
      } else {
        LocalShopService.addShopStock(Object.assign({}, req.body, { variantId })).then(res.json.bind(res)).catch(next)
      }
    })

    // We should only be able to update & delete stock from today
    super.routePost('/shop-stock/edit', (req, res, next) => {
      ShopService.update<ShopStock>('ShopStock', req.body, { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    // We should only be able to update & delete stock from today
    super.routePost('/shop-stock/delete', (req, res, next) => {
      ShopService.delete<ShopStock>('ShopStock', { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

  }
}
