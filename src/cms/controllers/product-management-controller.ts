import BaseController from './base-controller'
import ProductService from '../../services/product-service'

export default class ProductManagementController extends BaseController {
  constructor (initData) {
    super(initData)

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
      ProductService.getSubCategories(req.query.categoryId).then(resp => {
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
      if (req.query.subCategoryId) {
        ProductService.create('Product', { ...req.body, subCategoryId: req.query.subCategoryId }).then(resp => {
          res.json(resp)
        }).catch(next)
      } else {
        res.json({ status: false, errMessage: 'Sub-Category is needed' })
      }
    })

    super.routeGet('/products', (req, res, next) => {
      ProductService.read<Product>('Product', { subCategoryId: req.query.subCategoryId }).then(resp => {
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
  }
}
