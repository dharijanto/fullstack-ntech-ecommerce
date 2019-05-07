import * as path from 'path'
import BaseController from './base-controller'
import ProductService from '../../services/product-service'
import { ImageService } from '../../site-definitions'

import * as Utils from '../../libs/utils'

import * as AppConfig from '../../app-config'

let log = require('npmlog')

const TAG = 'ProductManagementController'
export default class ProductManagementController extends BaseController {
  private imageService: ImageService
  private readonly imageURLFormatter
  constructor (initData) {
    super(initData, false)
    this.imageService = new initData.services.ImageService(initData.db.sequelize, initData.db.models)
    this.imageURLFormatter = Utils.getImageURL// filename => `${AppConfig.BASE_URL}${AppConfig.IMAGE_MOUNT_PATH}${filename}`

    // Product-Management
    super.routePost('/category', (req, res, next) => {
      ProductService.createCategory(req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routeGet('/categories', (req, res, next) => {
      ProductService.getCategories().then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/category/edit', (req, res, next) => {
      ProductService.updateCategory(req.body.id, req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/category/delete', (req, res, next) => {
      ProductService.deleteCategory(req.body.id).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/subCategory', (req, res, next) => {
      if (req.query.categoryId) {
        ProductService.createSubCategory({ ...req.body, categoryId: req.query.categoryId }).then(resp => {
          res.json(resp)
        }).catch(next)
      } else {
        res.json({ status: false, errMessage: 'Category is needed' })
      }
    })

    super.routeGet('/subCategories', (req, res, next) => {
      ProductService.getSubCategories({ categoryId: req.query.categoryId }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/subCategory/edit', (req, res, next) => {
      ProductService.updateSubCategory(req.body.id, req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/subCategory/delete', (req, res, next) => {
      ProductService.deleteSubCategory(req.body.id).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product', (req, res, next) => {
      ProductService.createProduct({ ...req.body, subCategoryId: req.query.subCategoryId }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routeGet('/products', (req, res, next) => {
      const searchClause = req.query.subCategoryId ? { subCategoryId: req.query.subCategoryId } : {}
      ProductService.read<Product>('Product', searchClause).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/edit', (req, res, next) => {
      ProductService.update('Product', req.body, { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/delete', (req, res, next) => {
      ProductService.delete('Product', { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/variant', (req, res, next) => {
      if (req.query.productId) {
        ProductService.create('Variant', { ...req.body, productId: req.query.productId }).then(resp => {
          res.json(resp)
        }).catch(next)
      } else {
        res.json({ status: false, errMessage: 'Product is needed' })
      }
    })

    super.routeGet('/variants', (req, res, next) => {
      ProductService.read<Variant>('Variant', { productId: req.query.productId }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/variant/edit', (req, res, next) => {
      ProductService.update('Variant', req.body, { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/variant/delete', (req, res, next) => {
      ProductService.delete('Variant', { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routeGet('/variant/qr-code', (req, res, next) => {
      const variantId = req.query.variantId
      if (variantId) {
        ProductService.readOne<Variant>('Variant', { id: variantId }).then(resp => {
          if (resp.status && resp.data) {
            res.locals.serializedQRData = resp.data.id
            res.locals.variant = resp.data
            return ProductService.readOne<Product>('Product', { id: resp.data.productId }).then(resp2 => {
              if (resp2.status && resp2.data) {
                res.locals.product = resp2.data
                // QRCode contains variantId
                res.render('qrcode')
              } else {
                throw new Error(resp2.errMessage)
              }
            })
          } else {
            throw new Error(resp.errMessage)
          }
        }).catch(next)
      } else {
        res.status(500).send('variantId is required!')
      }
    })

    // Product Description
    super.routeGet('/product/description', (req, res, next) => {
      const id = req.query.id
      ProductService.readOne<Product>('Product', { id }).then(resp => {
        if (resp.status) {
          res.locals.product = resp.data
          res.render('product-description')
        } else {
          /* next(new Error('Product does not exist')) */
          res.json(resp)
        }
      }).catch(next)
    })

    super.routeGet('/product/images', (req, res, next) => {
      const productId = req.query.productId
      ProductService.getProductImages(productId).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/image', (req, res, next) => {
      const productId = req.query.productId
      ProductService.create<ProductImage>('ProductImage', Object.assign(req.body, { productId })).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/image/edit', (req, res, next) => {
      const id = req.body.id
      ProductService.update<ProductImage>('ProductImage', req.body, { id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/image/delete', (req, res, next) => {
      ProductService.delete<ProductImage>('ProductImage', { id: req.body.id }).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/product/image/get-url', (req, res, next) => {
      const filename = req.body.filename
      res.json({ status: true, data: this.imageURLFormatter(filename) })
    })
  }
}
