import { CRUDService } from './crud-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

class LocalShopService extends CRUDService {
  private localShopId: number = -1

  getLocalShopId () {
    if (!AppConfig.LOCAL_SHOP_INFORMATION || !AppConfig.LOCAL_SHOP_INFORMATION.NAME) {
      return Promise.reject(new Error('Local Shop Information is not defined!'))
    } else {
      if (this.localShopId === -1) {
        return super.readOne<Shop>('Shop', { name: AppConfig.LOCAL_SHOP_INFORMATION.NAME }).then(resp => {
          if (resp.status && resp.data) {
            this.localShopId = resp.data.id
            return { status: true, data: resp.data.id }
          } else {
            return resp
          }
        })
      } else {
        return Promise.resolve({ status: true, data: this.localShopId })
      }
    }
  }
}
export default new LocalShopService()
