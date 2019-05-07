import BaseController from './base-controller'
import PassportManager from '../libs/passport-manager'
import PassportHelper from '../libs/passport-helper'
import * as log from 'npmlog'

/* var PassportHelper = require(path.join(__dirname, '../utils/passport-helper')) */

const TAG = 'AccountController'
export default class AccountController extends BaseController {
  constructor (initData) {
    super(initData)

    this.routeGet('/register', (req, res, next) => {
      res.locals.errors = req.flash('error')
      res.render('cms/register')
    })

    this.routeGet('/login', (req, res, next) => {
      res.locals.errors = req.flash('error')
      res.render('cms/login')
    })

    this.routePost('/login', PassportManager.authShopCMSLogin({
      failureRedirect: `/cms/account/login`,
      failureFlash: true
    }), (req, res, next) => {
      log.verbose(TAG, 'submitlogin.POST(): redirecting to: ' + (req.session && req.session.returnTo))
      res.redirect((req.session && req.session.returnTo) || '/cms/')
    })

    this.routeGet('/logout', PassportHelper.logOut('/cms/account/login'))
  }
}
