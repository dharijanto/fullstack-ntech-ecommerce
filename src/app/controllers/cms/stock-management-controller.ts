import * as express from 'express'
import * as Promise from 'bluebird'
import * as pug from 'pug'

import AppConfig from '../../../app-config'
import BaseController from '../base-controller'
import ShopService from '../../../services/shop-service'
import LocalShopService from '../../local-shop-services/local-shop-service'
import LocalStockService from '../../local-shop-services/stock-service'
import { SiteData, ImageService } from '../../../site-definitions'
import * as Utils from '../../../libs/utils'

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

    super.routeGet('/stocks', (req, res, next) => {
      LocalShopService.getShopStock().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/stock', (req, res, next) => {
      const variantId = req.query.variantId

      if (!variantId) {
        res.json({ status: false, errMessage: 'variantId is required' })
      } else {
        LocalShopService.addShopStock(Object.assign({}, req.body, { variantId })).then(res.json.bind(res)).catch(next)
      }
    })

    // We should only be able to update & delete stock from today
    super.routePost('/stock/edit', (req, res, next) => {
      ShopService.update<ShopStock>('ShopStock', req.body, { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    // We should only be able to update & delete stock from today
    super.routePost('/stock/delete', (req, res, next) => {
      ShopService.delete<ShopStock>('ShopStock', { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/aisle-management', (req, res, next) => {
      res.render('cms/stock-management/aisle')
    })

    super.routeGet('/aisles', (req, res, next) => {
      LocalStockService.getAisles().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle', (req, res, next) => {
      LocalStockService.createAisle(req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle/edit', (req, res, next) => {
      LocalStockService.updateAisle(req.body.id, req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/aisle/delete', (req, res, next) => {
      LocalStockService.deleteAisle(req.body.id).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/opname', (req, res, next) => {
      res.render('cms/stock-management')
    })

    super.routeGet('/in', (req, res, next) => {
      // res.send('haha')
      res.render('cms/stock-management/in')
    })
  }
}
