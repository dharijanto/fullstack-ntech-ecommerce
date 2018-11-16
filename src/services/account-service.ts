import { Model, WhereOptions } from 'sequelize'
import * as Promise from 'bluebird'

import * as Utils from '../libs/utils'
import { CRUDService } from './crud-service'
import LocalShopService from './local-shop-service'
import ProductService from './product-service'
import Formatter from '../libs/formatter'
import Crypto from '../libs/crypto'

const log = require('npmlog')

const TAG = 'AccountService'

class AccountService extends CRUDService {
  getAccounts (shopId): Promise<NCResponse<User[]>> {
    if (shopId) {
      return super.read<User>('User', { shopId })
    } else {
      return Promise.resolve({ status: false, errMessage: 'shopId is required!' })
    }
  }

  private validateCredential (shopId: number, credential: Partial<User>, isPasswordOptional = false, isExistingUser = false): Promise<NCResponse<Partial<User>>> {
    const username = credential.username
    const password = credential.password
    const passwordConfirm = credential.confirmPassword
    const fullName = credential.fullName
    const privilege = credential.privilege

    log.verbose(TAG, `validateCredential(): credential=${JSON.stringify(credential, null, 4)}`)
    // If either password or confirm password is entered, they have to match in order
    // for anything to be updated
    const errMessages: string[] = []
    let data: Partial<User> = {}
    if (username) {
      if (!Formatter.validateUsername(username)) {
        errMessages.push('Username has to start with letter and of 5-16 characters long!')
      } else {
        data.username = username.toLowerCase()
      }
    } else {
      errMessages.push('Username is required!')
    }

    if (!isPasswordOptional) {
      if (password && passwordConfirm) {
        if (password !== passwordConfirm) {
          errMessages.push('Passwords do not match!')
        } else if (password.length < 4) {
          errMessages.push('Password has to be minimum 4 characters!')
        } else {
          const salted = Crypto.genSaltedPass(password)
          data.saltedPass = salted.passwordHash
          data.salt = salted.salt
        }
      } else {
        errMessages.push('Password is required!')
      }
    }

    if (!fullName) {
      errMessages.push('Full name is required!')
    } else {
      data.fullName = fullName
    }

    if (!privilege) {
      errMessages.push('Privilege is required!')
    } else {
      data.privilege = privilege
    }

    if (!shopId) {
      errMessages.push('shopId is required')
    } else {
      data.shopId = shopId
    }

    // const whereClause = isExistingUser ? { id: credential.id } : super.getSequelize().and({ username }, { shopId })
    const whereClause = isExistingUser ? { id: credential.id } : { username, shopId }
    return super.readOne<User>('User', whereClause).then(resp => {
      if (isExistingUser && !resp.status) {
        errMessages.push('Account is not found!')
      } else if (!isExistingUser && resp.status) {
        errMessages.push('Username is already taken!')
      }
      if (errMessages.length) {
        return { status: false, errMessage: errMessages.join(', ') }
      } else {
        return { status: true, data }
      }
    })
  }

  createAccount (shopId: number, credential: Partial<User>): Promise<NCResponse<User>> {
    if (shopId) {
      return this.validateCredential(shopId, credential, false, false).then(resp => {
        if (resp.status) {
          const data = Object.assign({}, resp.data, { shopId })
          return super.create('User', data)
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'shopId is required!' })
    }
  }

  updateAccount (shopId: number, userId: number, credential: Partial<User>): Promise<NCResponse<number>> {
    const isPasswordOptional = !(credential && credential.password && credential.password.length > 0)
    if (shopId && userId) {
      return this.validateCredential(shopId, credential, isPasswordOptional, true).then(resp => {
        if (resp.status && resp.data) {
          return super.update('User', resp.data, { id: userId })
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'shopId and userId are required!' })
    }
  }

  deleteAccount (userId: number): Promise<NCResponse<number>> {
    if (userId) {
      return super.delete('User', {id : userId })
    } else {
      return Promise.resolve({ status: false, errMessage: 'userId is required!' })
    }
  }
}

export default new AccountService()
