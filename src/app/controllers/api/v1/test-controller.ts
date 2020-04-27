import { SiteData } from '../../../../site-definitions'
import BaseController from '../../base-controller'
import ProductService from '../../../../services/product-service'
import cloudSyncService from '../../../../services/cloud-sync-service'

import * as AppConfig from '../../../../app-config'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class CartController extends BaseController {
  constructor (siteData: SiteData) {
    super(siteData)
    this.routeGet('/getAllDatas', (req, res, next) => {
      cloudSyncService.getDataSince(AppConfig.LOCAL_SHOP_INFORMATION.NAME, '2017-10-10').then(data => {
        res.json(data)
      }).catch(err => {
        res.status(500).send('Failed!')
      })
    })
  }
}
