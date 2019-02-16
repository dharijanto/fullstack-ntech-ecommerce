import * as express from 'express'
import * as Promise from 'bluebird'
import * as pug from 'pug'

import BaseController from '../base-controller'
import CartService from '../../../services/cart-service'
import { SiteData } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'
import OrderService from '../../../services/local-shop/order-service'
import AppConfig from '../../../app-config';

const path = require('path')

let log = require('npmlog')

const TAG = 'OrderManagementController'

export default class OrderManagementController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })

    super.routeGet('/', (req, res, next) => {
      res.redirect(`${req.baseUrl}/open-order-management`)
    })

    super.routeGet('/open-order-management', (req, res, next) => {
      res.render('cms/open-order-management')
    })

    super.routeGet('/closed-order-management', (req, res, next) => {
      res.render('cms/closed-order-management')
    })

    super.routeGet('/open-orders', (req, res, next) => {
      OrderService.getOpenOrders().then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/closed-orders', (req, res, next) => {
      OrderService.getClosedOrders().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order', (req, res, next) => {
      OrderService.addOrder(req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/edit', (req, res, next) => {
      OrderService.editOrder(req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/cancel', (req, res, next) => {
      OrderService.cancelOrder(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/close', (req, res, next) => {
      const orderId = req.body.id
      OrderService.closeOrder(orderId).then(resp => {
        return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${orderId}`, 1).then(resp => {
          if (resp.status && resp.data) {
            res.json({ status: true })
          } else {
            res.json(resp)
            return
          }
        })
      })
    })

    super.routePost('/order/close-po', (req, res, next) => {
      OrderService.finishPOOrder(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order/print-receipt', (req, res, next) => {
      const orderId = req.body.orderId
      // TODO: This is very inefficient because we're technically calling getReceipt() twice:
      // Here, and from print-service. But for now, we'll live with it...
      OrderService.getReceipt(orderId).then(resp => {
        if (resp.status) {
          return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${orderId}`).then(resp => {
            if (resp.status && resp.data) {
              res.json({ status: true })
            } else {
              res.json(resp)
              return
            }
          })
        } else {
          res.json({ status: false, errMessage: resp.errMessage })
          return
        }
      }).catch(err => {
        res.json({ status: false, errMessage: 'Error: ' + err.message })
      })
    })

    super.routeGet('/order/receipt', (req, res, next) => {
      const orderId = req.query.orderId
      OrderService.getReceipt(orderId).then(resp => {
        if (resp.status && resp.data) {
          console.dir(resp.data)
          // Render using pug
          res.locals.receipt = resp.data
          res.render('cms/receipt')
          // res.json({ status: true, data: rendered })
        } else {
          res.status(500).send('Error: ' + resp.errMessage)
          // res.json(resp)
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
      const orderId = req.query.orderId
      const variantId = req.body.variantId
      const quantity = req.body.quantity
      OrderService.addOrderDetail(orderId, variantId, quantity).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/order-detail/edit', (req, res, next) => {
      // TODO: Implement this. ATM this is disabled from UI
      res.json({ status: false, errMessage: 'Not implemented yet!' })
    })

    super.routePost('/order-detail/delete', (req, res, next) => {
      const orderDetailId = req.body.id
      OrderService.deleteOrderDetail(orderDetailId).then(res.json.bind(res)).catch(next)
    })
  }
}
