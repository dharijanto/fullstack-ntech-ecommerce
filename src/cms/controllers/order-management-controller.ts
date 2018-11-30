import * as path from 'path'
import BaseController from './base-controller'
import OrderService from '../../services/order-service'
import { ImageService } from '../../site-definitions'

import AppConfig from '../../app-config'
import ShopService from '../../services/shop-service'

let log = require('npmlog')

const TAG = 'OrderManagementController'
export default class OrderManagementController extends BaseController {
  constructor (initData) {
    super(initData, false)
    super.routeGet('/', (req, res, next) => {
      res.render('order-management')
    })

    super.routeGet('/orders', (req, res, next) => {
      const shopId = req.query.shopId
      if (shopId) {
        OrderService.getOrders(shopId).then(res.json.bind(res)).catch(next)
      } else {
        res.json({ status: false, errMessage: 'shopId is required!' })
      }
    })

    super.routeGet('/order-details', (req, res, next) => {
      const orderId = req.query.orderId
      if (orderId) {
        OrderService.getOrderDetails(orderId).then(res.json.bind(res)).catch(next)
      } else {
        res.json({ status: false, errMessage: 'orderId is required!' })
      }
    })
  }
}
