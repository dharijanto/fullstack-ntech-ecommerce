import BaseController from '../base-controller'

import { SiteData } from '../../../site-definitions'
import LocalShopService from '../../local-shop-services/local-shop-service';
import SyncService from '../../local-shop-services/sync-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class ShopSyncController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    // Get this shop's sync histories from the cloud
    /* super.routeGet('/cloud-sync/histories', (req, res, next) => {
    })
 */
    // Cron job calls on this GET request periodically
    super.routeGet('/cloud-sync/request', (req, res, next) => {
      try {
        SyncService.cloudToLocalSync().then(resp => {
          res.json(resp)
        })
      } catch (err) {
        next(err)
      }
    })
  }
}
