import * as express from 'express'
import AppConfig from '../../app-config'
import * as Promise from 'bluebird'

import BaseController from './base-controller'
import CartService from '../../services/cart-service'
import OrderManagementController from './cms/order-management-controller'
import { SiteData } from '../../site-definitions'
import * as Utils from '../../libs/utils'
import LocalShopService from '../../services/local-shop-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class CMSController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    super.routeGet('/', (req, res, next) => {
      res.redirect('/cms/order-management')
    })

    super.routeUse('/order-management', new OrderManagementController(siteData).getRouter())
  }
}
