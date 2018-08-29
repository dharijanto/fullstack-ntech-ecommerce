import * as path from 'path'
import BaseController from './base-controller'
import ProductService from '../../services/product-service'
import { ImageService } from '../../site-definitions'

import AppConfig from '../../app-config'
import ShopService from '../../services/shop-service'
import LocalShopService from '../../services/local-shop-service'

let log = require('npmlog')

const TAG = 'ProductManagementController'
export default class ShopManagementController extends BaseController {
  constructor (initData) {
    super(initData, false)
    super.routeGet('/', (req, res, next) => {
      res.render('shop-management')
    })

    super.routeGet('/promotion-management', (req, res, next) => {
      res.render('promotion-management')
    })

    super.routeGet('/promotion', (req, res, next) => {
      const shopId = req.query.shopId
      if (!shopId) {
        res.json({ status: false, errMessage: 'shopId is required!' })
      } else {
        ShopService.getPromotion(shopId).then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/promotion', (req, res, next) => {
      const shopId = req.query.shopId
      const productId = req.query.productId
      console.dir(req.query)
      if (!shopId || !productId) {
        res.json({ status: false, errMessage: 'shopId and productId are required' })
      } else {
        ShopService.create<Promotion>('Promotion', Object.assign({ shopId, productId }, req.body))
          .then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/promotion/edit', (req, res, next) => {
      const shopId = req.query.shopId
      const productId = req.query.productId
      console.dir(req.query)
      if (!shopId || !productId) {
        res.json({ status: false, errMessage: 'shopId and productId are required' })
      } else {
        ShopService.update<Promotion>('Promotion',
         Object.assign({ shopId, productId }, req.body),
         { id: req.body.id }).then(res.json.bind(res)).catch(next)
      }
    })

    super.routeGet('/shops', (req, res, next) => {
      ShopService.read<Shop>('Shop', {}).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/shop', (req, res, next) => {
      ShopService.create<Shop>('Shop', req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/shop/edit', (req, res, next) => {
      ShopService.update<Shop>('Shop', req.body, { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/shop/delete', (req, res, next) => {
      ShopService.delete<Shop>('Shop', { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/products', (req, res, next) => {
      const shopId = req.query.shopId
      if (shopId) {
        ShopService.getProducts(shopId).then(res.json.bind(res)).catch(next)
      } else {
        res.json({ status: false, errMessage: 'shopId is required!' })
      }
    })

    super.routePost('/product/edit', (req, res, next) => {
      const shopId = req.query.shopId
      const productId = req.body.id
      const data = {
        price: req.body['price'],
        preOrder: req.body['preOrder'],
        poLength: req.body['poLength'],
        disable: req.body['disable']
      }

      if (shopId) {
        ShopService.updateProduct(shopId, productId, data).then(res.json.bind(res)).catch(next)
      } else {
        res.json({ status: false, errMessage: 'shopId is required!' })
      }
    })

    super.routeGet('/shop-stocks', (req, res, next) => {
      const shopId = req.query.shopId
      if (!shopId) {
        res.json({ status: false, errMessage: 'shopId is required' })
      } else {
        ShopService.getShopStock(shopId).then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/shop-stock', (req, res, next) => {
      const variantId = req.query.variantId
      const shopId = req.query.shopId

      if (!variantId || !shopId) {
        res.json({ status: false, errMessage: 'variantId and shopId are required' })
      } else {
        ShopService.addShopStock(Object.assign({ shopId, variantId }, req.body)).then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/shop-stock/edit', (req, res, next) => {
      ShopService.update<ShopStock>('ShopStock', req.body, { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/shop-stock/delete', (req, res, next) => {
      ShopService.delete<ShopStock>('ShopStock', { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })
  }

}
