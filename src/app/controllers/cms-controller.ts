import * as AppConfig from '../../app-config'
import * as AppHelper from '../../libs/application-helper'
import BaseController from './base-controller'
import OrderManagementController from './cms/order-management-controller'
import OtherManagementController from './cms/other-management-controller'
import PassportHelper from '../libs/passport-helper'
import ProductManagementController from './cms/product-management-controller'
import PromotionManagementController from './cms/promotion-management-controller'
import StockManagementController from './cms/stock-management-controller'
import SyncManagementController from './cms/sync-management-controller'
import { SiteData } from '../../site-definitions'
import LocalShopService from '../local-shop-services/local-shop-service'
import UnauthenticatedController from './cms/unauthenticated-controller'

const path = require('path')

interface SidebarMenu {
  id: string
  title: string,
  privileges: UserPrivilege[]
  serverTypes: AppHelper.ServerType[],
  children: Array<{
    href: string,
    title: string
  }>
}

interface SimpleSidebarMenu {
  href: string
  title: string
  faIcon: string
}

export default class CMSController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))

    super.addInterceptor((req, res, next) => {
      if (req.user) {
        const sidebar: Array<SidebarMenu | SimpleSidebarMenu> = [
          {
            id: 'order-management',
            title: 'Online Inquiry',
            serverTypes: ['CLOUD_ONLY', 'CLOUD_SERVER'],
            privileges: ['Admin', 'Cashier'],
            children: [
              { href: '/cms/order-management/open-order-management', title: 'Open Order' },
              { href: '/cms/order-management/closed-order-management', title: 'Closed Order' }
            ]
          },
          {
            id: 'order-management',
            title: 'Order Management',
            serverTypes: ['CLOUD_ONLY', 'ON_PREMISE'],
            privileges: ['Admin', 'Cashier'],
            children: [
              { href: '/cms/order-management/open-order-management', title: 'Open Order' },
              { href: '/cms/order-management/closed-order-management', title: 'Closed Order' }
            ]
          },
          {
            id: 'stock-management',
            title: 'Stock Management',
            serverTypes: ['CLOUD_ONLY', 'ON_PREMISE'],
            privileges: ['Admin'],
            children: [
              { href: '/cms/stock-management/aisle-management', title: 'Aisles' },
              { href: '/cms/stock-management/in-management', title: 'Stock-in' },
              { href: '/cms/stock-management/opname', title: 'Opname' }
            ]
          },
          {
            id: 'shop-management',
            title: 'Shop Management',
            serverTypes: ['CLOUD_ONLY', 'ON_PREMISE'],
            privileges: ['Admin'],
            children: [
              { href: '/cms/product-management', title: 'Product' },
              { href: '/cms/promotion-management', title: 'Promotion' }
            ]
          },
          {
            id: 'sync-management',
            title: 'Sync Management',
            serverTypes: ['ON_PREMISE'],
            privileges: ['Admin', 'Cashier'],
            children: [
              { href: '/cms/sync-management/cloud-to-local', title: 'Cloud-to-Local' }
            ]
          },
          {
            id: 'other-management',
            title: 'Other',
            serverTypes: ['CLOUD_ONLY', 'ON_PREMISE'],
            privileges: ['Admin', 'Cashier'],
            children: [
              { href: '/cms/other-management/test-receipt-printer', title: 'Test Receipt Printer' },
              { href: '/cms/other-management/reindex-search-database', title: 'Reindex Search DB' },
              { href: '/cms/other-management/generate-tokopedia-spreadsheet', title: 'Generated Tokopedia Spreadsheet' }
            ]
          },
          {
            href: '/cms/account/logout',
            title: 'Logout',
            faIcon: 'fa-power-off'
          }
        ]

        // Filter out sidebar where user doesn't have proper permission
        if (req.user) {
          const user = req.user
          res.locals.sidebar = sidebar.filter(menu => {
            if (('privileges' in menu && menu.privileges.indexOf(user.privilege) === -1) ||
                ('serverTypes' in menu && menu.serverTypes.indexOf(AppHelper.getServerType()) === -1)) {
              return false
            } else {
              return true
            }
          })
        }
      }
      next()
    })

    super.routeGet('/', (req, res, next) => {
      res.redirect('/cms/order-management')
    })

    super.routeGet('/price-list', (req, res, next) => {
      LocalShopService.getProductsByCategories().then(resp => {
        if (resp.status && resp.data) {
          // console.log(JSON.stringify(resp.data, null, 2))
          res.locals.lastUpdated = resp.data.lastUpdated
          res.locals.categories = resp.data.categories
          res.render('cms/price-list')
        } else {
          next(new Error(resp.errMessage))
        }
      })
    })

    // Paths that don't require authentication / any privilege to access
    super.routeUse('/', new UnauthenticatedController(siteData).getRouter())
    // TODO: Add privilege-based authentication
    super.routeUse('/order-management', PassportHelper.ensureLoggedIn({}), new OrderManagementController(siteData).getRouter())
    super.routeUse('/product-management', PassportHelper.ensureLoggedIn({ privileges: ['Admin'] }), new ProductManagementController(siteData).getRouter())
    super.routeUse('/promotion-management', PassportHelper.ensureLoggedIn({ privileges: ['Admin'] }), new PromotionManagementController(siteData).getRouter())
    super.routeUse('/stock-management', PassportHelper.ensureLoggedIn({ privileges: ['Admin'] }), new StockManagementController(siteData).getRouter())
    super.routeUse('/sync-management', PassportHelper.ensureLoggedIn({}), new SyncManagementController(siteData).getRouter())
    super.routeUse('/other-management', PassportHelper.ensureLoggedIn({}), new OtherManagementController(siteData).getRouter())
  }
}
