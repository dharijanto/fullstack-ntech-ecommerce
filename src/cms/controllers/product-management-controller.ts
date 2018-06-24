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
  }
}
