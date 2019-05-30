import * as path from 'path'

import * as Promise from 'bluebird'

import BaseController from '../base-controller'
import ProductService from '../../../services/product-service'
import { ImageService } from '../../../site-definitions'

import * as AppConfig from '../../../app-config'
import AccountService from '../../../services/account-service'
import SearchService from '../../../services/search-service'
import OrderService from '../../local-shop-services/order-service'

let log = require('npmlog')

const TAG = 'OtherManagementController'
export default class OtherManagementController extends BaseController {
  constructor (siteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    super.routeGet('/', (req, res, next) => {
      res.render('cms/other-management')
    })

    super.routeGet('/test-receipt-printer', (req, res, next) => {
      OrderService.printReceipt(`${AppConfig.BASE_URL}/cms/order-management/order/dummy-receipt`).then(resp => {
        if (resp.status && resp.data) {
          res.json({ status: true })
        } else {
          res.json(resp)
          return
        }
      }).catch(err => {
        res.json({ status: false, errMessage: 'Error: ' + err.message })
      })
    })

    /**
     * Test that the build environment is set up properly.
     * Since there are components that when missing or not setup correctly isn't easily spotted,
     * this route is used to validate them.
     *
     * Things to check:
     * 1. Sphinx setup
     *  a. Be able to rotate the log
     * 2.
     */
    this.routeGet('/reindex-search-database', (req, res, next) => {
      Promise.join(
        SearchService.reindexDatabase()
      ).spread((resp: NCResponse<any>) => {
        res.json('Success! \n' + JSON.stringify(resp.data))
      }).catch(next)
    })

  }
}
