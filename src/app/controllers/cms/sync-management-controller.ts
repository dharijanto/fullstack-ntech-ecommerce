import * as path from 'path'
import BaseController from '../base-controller'
import ProductService from '../../../services/product-service'
import { ImageService } from '../../../site-definitions'

import * as AppConfig from '../../../app-config'
import AccountService from '../../../services/account-service'
import SyncService from '../../local-shop-services/sync-service'

let log = require('npmlog')

const TAG = 'SyncManagementController'
export default class SyncManagementController extends BaseController {
  constructor (siteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    super.routeGet('/cloud-to-local', (req, res, next) => {
      res.render('cms/cloud-to-local-sync-management')
    })

    super.routeGet('/cloud-to-local/history', (req, res, next) => {
      SyncService.getHistories().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/cloud-to-local/sync', (req, res, next) => {
      SyncService.cloudToLocalSync().then(resp => {
        res.json(resp)
      }).catch(err => {
        next(err)
      })
    })
  }
}
