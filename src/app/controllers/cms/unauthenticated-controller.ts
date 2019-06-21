import * as path from 'path'

import * as Promise from 'bluebird'
import * as log from 'npmlog'

import BaseController from '../base-controller'
import PassportManager from '../../libs/passport-manager'
import PassportHelper from '../../libs/passport-helper'
import { SiteData } from '../../../site-definitions'
import OrderService from '../../local-shop-services/order-service'
import SyncService from '../../local-shop-services/sync-service'

const TAG = 'UnauthenticatedCMSController'

// These are the paths that anybody (without having to login) can access
// Currently is used by puppeteer to access the receipts
export default class UnauthenticatedCMSController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })
    // --------- Sync-related controller path ------------
    // ------------------------------------------------------
    super.routePost('/sync-management/cloud-to-local/sync', (req, res, next) => {
      SyncService.cloudToLocalSync().then(resp => {
        res.json(resp)
      }).catch(err => {
        next(err)
      })
    })
    // ------------------------------------------------------

    // --------- Account-related controller path ------------
    // ------------------------------------------------------
    this.routeGet('/account/login', (req, res, next) => {
      res.locals.errors = req.flash('error')
      res.render('cms/login')
    })

    this.routePost('/account/login', PassportManager.authShopCMSLogin({
      failureRedirect: `/cms/account/login`,
      failureFlash: true
    }), (req, res, next) => {
      log.verbose(TAG, 'submitlogin.POST(): redirecting to: ' + (req.session && req.session.returnTo))
      res.redirect((req.session && req.session.returnTo) || '/cms/')
    })

    this.routeGet('/account/logout', PassportHelper.logOut('/cms/account/login'))
    // ------------------------------------------------------
    // ------------------------------------------------------

    // ------------ Order-related paths ---------------------
    // ------------------------------------------------------
    // Note: This is needed because we use puppeeteer to generate the receipt
    //       Puppeteer needs to be able to access receipt path without authentication
    super.routeGet('/order-management/order/receipt', (req, res, next) => {
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

    super.routeGet('/order-management/order-details/receipt', (req, res, next) => {
      const orderId = req.query.orderId

      if (orderId) {
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
      } else {
        res.json({ status: false, errMessage: 'orderId is required!' })
      }
    })

    this.routeGet('/order-management/order/dummy-receipt', (req, res, next) => {
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
    // ------------------------------------------------------
    // ------------------------------------------------------
  }
}
