import * as Promise from 'bluebird'

import * as AppConfig from '../../../app-config'
import AnalyticsService from '../../local-shop-services/analytics-service'
import BaseController from '../base-controller'
import { SiteData } from '../../../site-definitions'
import LocalShopService from '../../local-shop-services/local-shop-service'
import ProductService from '../../../services/product-service'
import * as Utils from '../../../libs/utils'
import SearchService from '../../../services/search-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'ShopController'

export default class ShopBaseController extends BaseController {
  constructor (siteData: SiteData) {
    let viewPath
    let assetPath = path.join(__dirname, `../../views/assets`)
    if (AppConfig.UI.THEME_NAME) {
      viewPath = path.join(__dirname, `../../views/themes/${AppConfig.UI.THEME_NAME}/pug`)
    } else {
      viewPath = path.join(__dirname, '../../views')
    }
    super(Object.assign(siteData, { viewPath, assetPath }))
  }
}
