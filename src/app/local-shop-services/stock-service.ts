import * as util from 'util'

import * as Promise from 'bluebird'
import { Model } from 'sequelize'
import * as moment from 'moment'

import AppConfig from '../../app-config'
import CRUDService from '../../services/crud-service'
import LocalShopService from './local-shop-service'
import OrderService from '../../services/order-service'
import PrintService from '../../services/print-service'

/*
  Used for shop-specific code. This should re-use what's in shop-service as much as possible, though.

  TODO:
  1. Update orderHistories whenever an update is made to order table, so that we have better ideas when
     a problem happens
 */
class LocalStockService extends CRUDService {
  getAisles (): Promise<NCResponse<Aisle[]>> {
    return super.read<Aisle>('ShopAisle', { shopId: LocalShopService.getLocalShopId() })
  }

  createAisle (data: Partial<Aisle>): Promise<NCResponse<Aisle>> {
    return super.create<Aisle>('ShopAisle', { shopId: LocalShopService.getLocalShopId(), ...data })
  }

  updateAisle (aisleId: number, data: Partial<Aisle>): Promise<NCResponse<number>> {
    if (aisleId) {
      return super.update<Aisle>('ShopAisle', data, { id: aisleId })
    } else {
      return Promise.resolve({ status: false, errMessage: 'aisleId is required!' })
    }
  }

  deleteAisle (aisleId: number): Promise<NCResponse<number>> {
    if (aisleId) {
      return super.delete<Aisle>('ShopAisle', { id: aisleId, shopId: LocalShopService.getLocalShopId() })
    } else {
      return Promise.resolve({ status: false, errMessage: 'aisleId is required!' })
    }
  }
}

export default new LocalStockService()
