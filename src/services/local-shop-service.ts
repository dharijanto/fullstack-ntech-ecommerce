import * as util from 'util'

import { CRUDService } from './crud-service'
import ShopService from './shop-service'
import OrderService from './order-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'
import * as Utils from '../libs/utils'

export interface LocalShopifiedProduct {

}

/*
  Used for shop-specific code. This should re-use what's in shop-service as much as possible, though.
 */
class LocalShopService extends CRUDService {
  private localShopId: number = -1
  initialize (): Promise<NCResponse<null>> {
    if (!AppConfig.LOCAL_SHOP_INFORMATION || !AppConfig.LOCAL_SHOP_INFORMATION.NAME) {
      return Promise.resolve({ status: false, errMessage: 'Local Shop Information is not defined!' })
    } else {
      if (this.localShopId === -1) {
        return super.readOne<Shop>('Shop', { name: AppConfig.LOCAL_SHOP_INFORMATION.NAME }).then(resp => {
          if (resp.status && resp.data) {
            this.localShopId = resp.data.id
            return { status: true, data: null }
          } else {
            return { status: false, errMessage: 'Shop name is not found!' }
          }
        })
      } else {
        return Promise.resolve({ status: true, data: null })
      }
    }
  }

  getPromotion (): Promise<NCResponse<Promotion[]>> {
    if (this.localShopId === -1) {
      return Promise.reject(new Error('localShopId is invalid!'))
    } else {
      return ShopService.getPromotion(this.localShopId)
    }
  }

  /*
    InStockProduct[] with:
    -primaryImage
    -subCategories

    This is used by landing page, where we display
  */
  getInStockProducts ({ pageSize = 10, pageIndex = 0, productId = null }): Promise<NCResponse<InStockProduct[]>> {
    return ShopService.getInStockProducts({ pageSize, pageIndex, productId }, this.localShopId)
  }

  getInStockProduct (productId): Promise<NCResponse<InStockProduct>> {
    return this.getInStockProducts({ productId, pageSize: 1, pageIndex: 0 }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data && resp.data.length > 0) {
          return { status: true, data: resp.data[0] }
        } else {
          return { status: false, errMessage: 'Product not found!' }
        }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  getPOProducts ({ pageSize = 10, pageIndex = 0, productId = null }): Promise<NCResponse<POProduct[]>> {
    return ShopService.getPOProducts({ pageSize, pageIndex, productId }, this.localShopId)
  }

  getPOProduct (productId): Promise<NCResponse<POProduct>> {
    return this.getPOProducts({ pageSize: 1, pageIndex: 0, productId }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data.length) {
          return { status: true, data: resp.data[0] }
        } else {
          return { status: false, errMessage: 'Product not found!' }
        }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  // Update shopProduct entry
  // In actuality, this can be insert/update
  updateProduct (productId: number, data: Partial<ShopProduct>) {
    const { price, preOrderAllowed, preOrderDuration, disabled } = data
    return this.getModels('ShopProduct').findOne({ where: { shopId: this.localShopId, productId } }).then(data => {
      return {
        id: data && data.id,
        productId,
        shopId: this.localShopId,
        price,
        preOrderAllowed,
        preOrderDuration,
        disabled
      }
    }).then(shopProduct => {
      return this.getModels('ShopProduct').upsert(shopProduct).then(count => {
        return { status: true }
      })
    })
  }

  addShopStock (data: Partial<ShopStock>) {
    const { variantId, price, quantity, date } = data
    return this.create<ShopStock>('ShopStock', {
      shopId: this.localShopId,
      variantId,
      price,
      quantity,
      date
    })
  }

  getOrders () {
    return OrderService.getOrders(this.localShopId)
  }

  getOrderDetails (orderId) {
    return OrderService.getOrderDetails(orderId)
  }
}
export default new LocalShopService()
