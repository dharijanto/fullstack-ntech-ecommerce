import BaseController from './controllers/base-controller'
import ProductController from './controllers/product-controller';
import { SiteData } from '../site-definitions';

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  constructor (initData: SiteData) {
    super(initData)
    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      res.locals.siteHash = this.siteHash
      next()
    })
    
    this.routeGet('/', (req, res, next) => {
      res.render('category')
    })

    this.routeGet('/asd', (req, res, next) => {
      res.send('haha')
    })


    initData.site.hash = ''
    this.routeUse('/product-management', new ProductController(initData).getRouter())
  }
}

module.exports = MainController
