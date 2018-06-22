import BaseController from './controllers/base-controller'

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  constructor (initData) {
    initData.logTag = 'FiloseduCMSController'
    super(Object.assign(initData, {viewPath: path.join(__dirname, 'views/v1')}))

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      next()
    })

    this.routeGet('/', (req, res, next) => {
      res.render('category')
    })
  }

  getSidebar () {
    return [
      {
        title: 'Course Management',
        url: '/course-management',
        faicon: 'fa-dashboard'
      },
      {
        title: 'Dependency Visualizer',
        url: '/dependency-visualizer',
        faicon: 'fa-bar-chart-o',
        children: [
          {title: 'A', url: '/dependency-visualizer/a'},
          {title: 'B', url: '/dependency-visualizer/b'}]
      }
    ]
  }
}

module.exports = MainController
