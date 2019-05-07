import * as path from 'path'
let LocalStrategy = require('passport-local').Strategy
import * as log from 'npmlog'
import * as passport from 'passport'
import * as Promise from 'bluebird'
// let UserService = require(path.join(__dirname, '../services/user-service'))
import AccountService from '../../services/account-service'

const TAG = 'PassportManager'
const APP_LOGIN = 'app_login'
const APP_REGISTER = 'app_register'

// Contains all the logic related to passport
class PassportManager {
  public shopCMSLoginIdentifier: string = 'app_login'

  initialize (shopId) {
    log.verbose(TAG, `initialize(): shopId=${shopId}`)
    return new Promise((resolve, reject) => {
      // Generic reusable user login
      passport.use(this.shopCMSLoginIdentifier, new LocalStrategy({ passReqToCallback: true },
        function (req, username, password, cb) {
          AccountService.login(username, password, shopId).then(resp => {
            if (resp.status && resp.data) {
              const user = resp.data
              // siteId is a little quirks needed in order for ncloud to deserialize user correctly.
              // ideally we should fix ncloud so that we don't have to do this
              cb(null, { ...user, siteId: req.site.id })
            } else {
              cb(null, false, { message: resp.errMessage, errCode: resp.errCode })
            }
          }).catch(err => {
            cb(err)
          })
        }))
      resolve()
    })
  }

  authShopCMSLogin (option) {
    return passport.authenticate(this.shopCMSLoginIdentifier, option)
  }

  /* authAppRegistration (option) {
    return passport.authenticate(APP_REGISTER, option)
  } */
}

export default new PassportManager()
