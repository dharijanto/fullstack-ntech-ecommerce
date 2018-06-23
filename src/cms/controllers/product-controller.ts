import BaseController from './base-controller'
import ProductService from '../../services/product-service'

export default class ProductController extends BaseController {
  constructor (initData) {
    super(initData)

    super.routeGet('/categories', (req, res, next) => {
      ProductService.getCategories().then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/category', (req, res, next) => {
      ProductService.createCategory(req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/category/edit', (req, res, next) => {
      ProductService.updateCategory(req.query.id, req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routeGet('/subCategories', (req, res, next) => {
      ProductService.getSubCategories(req.query.categoryId).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/subCategory', (req, res, next) => {
      ProductService.createSubCategory(req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/subCategory/edit', (req, res, next) => {
      ProductService.updateSubCategory(req.query.id, req.body).then(resp => {
        res.json(resp)
      }).catch(next)
    })

  }
}