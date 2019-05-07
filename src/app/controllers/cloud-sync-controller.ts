import BaseController from './base-controller'
import { SiteData } from '../../site-definitions'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

/*
This controller is running only on the cloud server in order to serve syncing
 */
export default class CloudSyncController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    // Get data from the cloud, update it to the local database
    // TODO: Figure out how we do this, since cloud data can be pretty large,
    //       we'll have to wait
    /*
    req:
    {
      shopName: 'Shop 1',
      lastSync: '2019-04-16 17:00:00'
    }

    resp:
    { status: true
      data : {
        state: 'preparing'
      }
    }

    { status: true
      data : {
        state: 'ready',
        syncTime: '2019-04-16 18:20:00'
        syncData : {
          Image: ...
          Category: ...
          SubCategory: ...
          Product: ...
          ProductImage: ...
          Variant: ...
          Supplier: ...
          SupplierStock: ...
          Promotion: ...
        }
      }
    }
     */
    super.routeGet('/sync-cloud-data', (req, res, next) => {
      res.send('hello')
    })
  }
}
