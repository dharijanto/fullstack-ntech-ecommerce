import * as path from 'path'

import BaseController from './base-controller'

import { SiteData } from '../../site-definitions'
import SyncService from '../local-shop-services/sync-service'

let log = require('npmlog')

const TAG = 'ShopSyncController'

export default class ShopSyncController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    super.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'ShopSyncController: path=' + req.path)
      next()
    })
    // Cron job calls on this GET request periodically
    super.routeGet('/cloud/request', (req, res, next) => {
      SyncService.cloudToLocalSync().then(resp => {
        res.json(resp)
      }).catch(err => {
        next(err)
      })
    })
    // Get this shop's sync histories from the cloud
    /* super.routeGet('/cloud-sync/histories', (req, res, next) => {
    })
 */
  }
}
