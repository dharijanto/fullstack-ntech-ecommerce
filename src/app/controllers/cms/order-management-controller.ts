import * as path from 'path'

import * as Promise from 'bluebird'
import * as log from 'npmlog'

import BaseController from '../base-controller'
import { SiteData } from '../../../site-definitions'
import OrderService from '../../local-shop-services/order-service'
import * as AppConfig from '../../../app-config'

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

    // TODO: Modify this so we only show data for the past 7 days
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

      // Change order status to 'Closed', print customer receipt, print merchant receipt.
      OrderService.closeOrder(orderId).then(resp => {
        if (resp.status) {
          return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${orderId}&originalCopy=1`, 1).then(resp => {
            if (resp.status && resp.data) {
              return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${orderId}`, 1).then(resp => {
                if (resp.status && resp.data) {
                  res.json({ status: true })
                } else {
                  res.json(resp)
                  return
                }
              })
            } else {
              res.json(resp)
              return
            }
          }).catch(err => {
            log.error(TAG, err)
            res.json({ status: false, errMessage: 'Failed to close order: ' + err.message })
          })
        } else {
          res.json({ status: false, errMessage: resp.errMessage })
          return
        }
      })
    })

    super.routePost('/order/close-po', (req, res, next) => {
      const orderId = req.body.id
      OrderService.finishPOOrder(orderId).then(resp => {
        if (resp.status) {
          return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${orderId}&originalCopy=1`, 1).then(resp => {
            if (resp.status && resp.data) {
              res.json({ status: true })
              return
            } else {
              res.json(resp)
              return
            }
          })
        } else {
          res.json({ status: false, errMessage: resp.errMessage })
          return
        }
      })
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
      const originalCopy = req.query.originalCopy
      OrderService.getReceipt(orderId).then(resp => {
        if (resp.status && resp.data) {
          // Render using pug
          res.locals.receipt = resp.data
          res.locals.originalCopy = originalCopy
          res.render('cms/receipt')
        } else {
          res.status(500).send('Error: ' + resp.errMessage)
          // res.json(resp)
        }
      }).catch(next)
    })

    super.routeGet('/order/dummy-receipt', (req, res, next) => {
      // Render using pug
      res.locals.receipt = {
        orderId: 1,
        fullName: 'John Doe',
        phoneNumber: '081122334455',
        status: 'Close',
        totalPrice: 100000,
        orderDate: '12 January 2019',
        printDate: '12 January 2019 10:00',
        items: [
          {
            status: 'Ready',
            name: 'SanDisk Cruzer 32GB',
            variant: 'Hitam',
            price: 65000,
            quantity: 1
          },
          {
            status: 'Ready',
            name: 'USB Logitech Mini E11',
            variant: 'Biru',
            price: 35000,
            quantity: 1
          }
        ]
      }
      res.locals.originalCopy = true
      res.render('cms/receipt')
    })

    super.routeGet('/order-details/receipt', (req, res, next) => {
      const orderId = req.query.orderId
      Promise.join<NCResponse<any>>(
        OrderService.getOrderDetails(orderId),
        OrderService.getOrder(orderId)
      ).spread((resp: NCResponse<OrderDetail[]>, resp2: NCResponse<Order>) => {
        if (resp.status && resp.data && resp2.status && resp2.data) {
          // Render using pug
          res.locals.order = resp2.data
          res.locals.orderId = orderId
          res.locals.orderDetails = resp.data
          res.render('cms/aisles-receipt')
        } else {
          res.status(500).send('Error: ' + resp.errMessage)
          // res.json(resp)
        }
      }).catch(next)
    })

    super.routePost('/order-details/print-receipt', (req, res, next) => {
      res.json({ status: false, errMessage: 'Not yet implemented!' })
      const orderId = req.body.orderId

      // TODO: This is very inefficient because we're technically calling getOrderDetails() twice:
      // Here, and from print-service. But for now, we'll live with it...
      OrderService.getOrderDetails(orderId).then(resp => {
        if (resp.status) {
          return OrderService.printReceipt(`${AppConfig.BASE_URL}${this.getRouter().path()}/order-details/receipt?orderId=${orderId}`).then(resp => {
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
      const quantity = parseInt(req.body.quantity, 10)
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
