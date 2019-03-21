import * as express from 'express'
import * as Promise from 'bluebird'
import * as pug from 'pug'

import AppConfig from '../../../app-config'
import BaseController from '../base-controller'
import ShopService from '../../../services/shop-service'
import LocalShopService from '../../../services/local-shop-service'
import { SiteData, ImageService } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'
import OrderService from '../../../services/local-shop/order-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

/*
TODO: Only user with admin privilege can access this page!
*/
export default class PromotionManagementController extends BaseController {
  private imageService: ImageService

  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    this.imageService = new siteData.services.ImageService(siteData.db.sequelize, siteData.db.models)

    super.routeGet('/aisle-management', (req, res, next) => {
      res.render('cms/stock-management/aisle')
    })

    super.routeGet('/aisles', (req, res, next) => {
      LocalShopService.getAisles().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle', (req, res, next) => {
      LocalShopService.createAisle(req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle/edit', (req, res, next) => {
      LocalShopService.updateAisle(req.body.id, req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle/delete', (req, res, next) => {
      LocalShopService.deleteAisle(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/opname', (req, res, next) => {
      res.render('cms/stock-management')
    })

    super.routeGet('/in', (req, res, next) => {
      res.render('cms/stock-management/in')
    })
  }
}
