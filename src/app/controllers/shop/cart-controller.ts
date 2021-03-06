import AnalyticsService from '../../local-shop-services/analytics-service'
import ShopBaseController from '../shop/shop-base-controller'
import CartService from '../../local-shop-services/cart-service'
import { SiteData } from '../../../site-definitions'
import LocalShopService from '../../local-shop-services/local-shop-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class CartController extends ShopBaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../../views') }))

    // TODO: This should take into account the case where number thing to add > available stocks
    this.routePost('/add-item', (req, res, next) => {
      log.verbose(TAG, '/add-item.POST:' + JSON.stringify(req.session, null, 2))
      if (req.body.variantId && req.body.quantity) {
        const data = {
          variantId: req.body.variantId,
          quantity: parseInt(req.body.quantity, 10)
        }
        LocalShopService.getVariantAvailability(req.body.variantId).then(resp => {
          if (resp.status && resp.data) {
            if (resp.data.status === 'preOrder') {
              AnalyticsService.poProductCarted(data.variantId, data.quantity)
            } else {
              AnalyticsService.inStockProductCarted(data.variantId, data.quantity)
            }

            if (req.session) {
              CartService.addItemToCart(resp.data.status, req.session.cart, data).then(resp => {
                if (resp.status) {
                  if (req.session) {
                    req.session.cart = resp.data
                    res.json({ status: true, data: resp.data })
                  } else {
                    res.json({ status: false, errMessage: 'Session is not defined!' })
                  }
                } else {
                  res.json(resp)
                }
              })
            }
          } else {
            res.json({ status: false, errMessage: 'Failed to get variant availability: ' + resp.errMessage })
          }
        })
      } else {
        res.json({ status: false, errMessage: 'variantId and quantity are required!' })
      }
    })

    // Used for debugging purposes
    this.routeGet('/details', (req, res, next) => {
      res.json(req.session ? req.session.cart : 'Your cart is empty!')
    })

    this.routePost('/place-order', (req, res, next) => {
      if (req.session) {
        CartService.placeOrder(req.body.fullName, req.body.phoneNumber, req.body.notes, req.session.cart).then(resp => {
          if (resp.status) {
            if (req.session) {
              CartService.emptyCart(req.session.cart).then(resp2 => {
                if (!resp2.status) {
                  log.error(TAG, 'place-order.POST: emptyCart failed!')
                }
                res.json(resp)
              })
            } else {
              res.json(resp)
            }
          } else {
            res.json({ status: false, errMessage: resp.errMessage })
          }
        }).catch(next)
      } else {
        res.json({ status: false, errMessage: 'Session is not defined!' })
      }
    })

    this.routeGet('/order-placed', (req, res, next) => {
      res.render('order-placed')
    })

    this.routeGet('/', (req, res, next) => {
      if (req.session) {
        CartService.getCart(req.session.cart).then(resp => {
          if (resp.status) {
            res.locals.cart = resp.data
            res.render('cart')
          } else {
            next(new Error(resp.errMessage))
          }
        })
      } else {
        next(new Error('Session is not defined!'))
      }
    })

  }
}
