import * as path from 'path'
import BaseController from './base-controller'
import ProductService from '../../services/product-service'
import { ImageService } from '../../site-definitions'

import * as AppConfig from '../../app-config'
import AccountService from '../../services/account-service'

let log = require('npmlog')

const TAG = 'ProductManagementController'
export default class AccountManagementController extends BaseController {
  constructor (initData) {
    super(initData, false)
    super.routeGet('/', (req, res, next) => {
      res.render('account-management')
    })

    super.routeGet('/accounts', (req, res, next) => {
      AccountService.getAccounts(req.query.shopId).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/account', (req, res, next) => {
      AccountService.createAccount(req.query.shopId, req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/account/edit', (req, res, next) => {
      AccountService.updateAccount(req.query.shopId, req.body.id, req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/account/delete', (req, res, next) => {
      AccountService.deleteAccount(req.body.id).then(res.json.bind(res)).catch(next)
    })
  }
}
