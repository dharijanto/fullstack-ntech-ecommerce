import BaseController from './controllers/base-controller'
import ProductController from './controllers/product-controller';

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  constructor (initData) {
    super(initData)
    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      next()
    })

    
    this.routeGet('/', (req, res, next) => {
      res.render('category')
    })

    this.routeUse('product-management', new ProductController(initData).getRouter())
  }
}

module.exports = MainController
