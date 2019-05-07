import * as log from 'npmlog'

const TAG = 'PassportHelper'

class PassportHelper {
  // TODO: No longer needed as the session bug apparently came from express-session and is already fixed
  // Adapted from Jared Hanson's connect-ensure-login
  // The difference is that this waits until session is saved before redirecting
  static ensureLoggedIn (options) {
    if (typeof options === 'string') {
      options = { redirectTo: options }
    }
    options = options || {}

    let url = options.redirectTo || '/cms/account/login'
    let setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo

    return function (req, res, next) {
      log.verbose(TAG, `ensureLoggedIn(): options=${JSON.stringify(options)} req.isAuthenticated()=${req.isAuthenticated()}`)
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        if (setReturnTo && req.session) {
          req.session.returnTo = req.originalUrl || req.url
          req.session.save(() => {
            res.redirect(url)
          })
        } else {
          return res.redirect(url)
        }
      } else {
        next()
      }
    }
  }

  static ensureAdmin () {
    return (req, res, next) => {

    }
  }

  static logOut (redirectPath: string) {
    return function (req, res, next) {
      req.session.returnTo = '/cms/'
      req.logout()
      req.session.save(() => {
        res.redirect(redirectPath)
      })
    }
  }
}

export default PassportHelper
