import * as express from 'express'
import * as Promise from 'bluebird'
import * as pug from 'pug'

import BaseController from '../base-controller'
import CartService from '../../../services/cart-service'
import { SiteData } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'
import OrderService from '../../../services/local-shop/order-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class OrderManagementController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    super.routeGet('/', (req, res, next) => {
      res.render('cms/order-management')
    })

    super.routeGet('/orders', (req, res, next) => {
      OrderService.getOrders().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/edit', (req, res, next) => {
      OrderService.editOrder(req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/cancel', (req, res, next) => {
      OrderService.cancelOrder(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/close', (req, res, next) => {
      OrderService.closeOrder(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/close-po', (req, res, next) => {
      OrderService.finishPOOrder(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/print-receipt', (req, res, next) => {
      OrderService.printReceipt(req.body.id).then(resp => {
        if (resp.status && resp.data) {
          // Render using pug
          const rendered = pug.renderFile(path.join(this.viewPath, '/cms/receipt.pug'))
          res.json({ status: true, data: rendered })
        } else {
          res.json(resp)
        }
      }).catch(next)
    })

    super.routeGet('/order/print-preview', (req, res, next) => {
      const receiptId = req.query.orderId
      OrderService.printReceipt(receiptId).then(resp => {
        if (resp.status && resp.data) {
          console.dir(resp.data)
          // Render using pug
          res.locals.receipt = resp.data
          res.render('cms/receipt')
          // res.json({ status: true, data: rendered })
        } else {
          res.json(resp)
        }
      }).catch(next)
    })

    super.routeGet('/order-details', (req, res, next) => {
      const orderId = req.query.orderId
      if (orderId) {
        OrderService.getOrderDetails(orderId).then(res.json.bind(res)).catch(next)
      } else {
        res.json({ status: false, errMessage: 'orderId is required!' })
      }
    })

    super.routePost('/order-detail', (req, res, next) => {

    })

    super.routePost('/order-detail/edit', (req, res, next) => {

    })

    super.routePost('/order-detail/delete', (req, res, next) => {

    })
  }
}
