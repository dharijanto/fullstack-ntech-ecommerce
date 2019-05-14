import BaseController from '../base-controller'
import LocalShopService from '../../local-shop-services/local-shop-service'
import { SiteData } from '../../../site-definitions'

const path = require('path')

/*
TODO: Only user with admin privilege can access this page!
*/
export default class ProductManagementController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    super.routeGet('/', (req, res, next) => {
      res.render('cms/product-management')
    })

    super.routeGet('/products', (req, res, next) => {
      LocalShopService.getShopifiedProducts().then(res.json.bind(res)).catch(next)
    })

    super.routePost('/product/edit', (req, res, next) => {
      const productId = req.body.id
      const data = {
        price: req.body['shopPrice'],
        preOrderAllowed: req.body['preOrderAllowed'],
        preOrderDuration: req.body['preOrderDuration'],
        disabled: req.body['disabled']
      }

      LocalShopService.updateProduct(productId, data).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/variants', (req, res, next) => {
      const productId = req.query.productId
      LocalShopService.getShopifiedVariants(productId).then(res.json.bind(res)).catch(next)
    })
  }
}
