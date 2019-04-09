import * as path from 'path'
import BaseController from './base-controller'
import ProductService from '../../services/product-service'
import { ImageService } from '../../site-definitions'

import * as AppConfig from '../../app-config'
import ShopService from '../../services/shop-service'

let log = require('npmlog')

const TAG = 'ProductManagementController'
export default class SupplierManagementController extends BaseController {
  constructor (initData) {
    super(initData, false)
    super.routeGet('/', (req, res, next) => {
      res.render('supplier-management')
    })

    super.routeGet('/suppliers', (req, res, next) => {
      ShopService.read<Supplier>('Supplier', {}).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/supplier', (req, res, next) => {
      ShopService.create<Supplier>('Supplier', req.body).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/supplier/edit', (req, res, next) => {
      ShopService.update<Supplier>('Supplier', req.body, { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routePost('/supplier/delete', (req, res, next) => {
      ShopService.delete<Supplier>('Supplier', { id: req.body.id }).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/products', (req, res, next) => {
      ShopService.getProductsWithSuppliersCount().then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/variants', (req, res, next) => {
      const productId = req.query.productId
      ShopService.getVariantsWithSupplierCount(productId).then(res.json.bind(res)).catch(next)
    })

    super.routeGet('/supplier-stocks', (req, res, next) => {
      const supplierId = req.query.supplierId
      if (!supplierId) {
        res.send({ status: false, errMessage: 'supplierId is required' })
      } else {
        ShopService.getSupplierStock(supplierId).then(resp => {
          res.json(resp)
        }).catch(next)
      }
    })

    super.routePost('/supplier-stock', (req, res, next) => {
      const variantId = req.query.variantId
      const supplierId = req.query.supplierId
      if (!variantId || !supplierId) {
        res.json({ status: false, errMessage: 'variantId and supplierId are requried' })
      } else {
        ShopService.addSupplierStock(Object.assign({ supplierId, variantId }, req.body)).then(res.json.bind(res)).catch(next)
      }
    })

    super.routePost('/supplier-stock/edit', (req, res, next) => {
      ShopService.update<SupplierStock>('SupplierStock', req.body, { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/supplier-stock/delete', (req, res, next) => {
      ShopService.delete<SupplierStock>('SupplierStock', { id : req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })
  }
}
