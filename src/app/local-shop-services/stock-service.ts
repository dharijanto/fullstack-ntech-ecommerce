import * as util from 'util'

import * as Promise from 'bluebird'
import { Model } from 'sequelize'
import * as moment from 'moment'

import * as AppConfig from '../../app-config'
import CRUDService from '../../services/crud-service'
import LocalShopService from './local-shop-service'
import ShopService from '../../services/shop-service'
import PrintService from '../../services/print-service'
import orderService from '../../services/order-service'
import productService from '../../services/product-service'

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

  // Used for opname, return aisle with number of quantity in it
  getAislesWithQuantity (): Promise<NCResponse<Array<{ aisle: string, quantity: number }>>> {
    return super.rawReadQuery(`SELECT aisle AS aisle, SUM(quantity) AS quantity FROM shopStocksView GROUP BY aisle;`)
  }

  getAisleContent (aisle: string): Promise<NCResponse<Array<{ productName: string, variantName: string, quantity: number }>>> {
    if (aisle) {
      return super.rawReadQuery(`
  SELECT products.name AS productName, variants.name AS variantName, shopStocksView.quantity AS quantity
  FROM shopStocksView
  INNER JOIN variants ON variants.id = shopStocksView.variantId
  INNER JOIN products ON products.id = variants.productId
  WHERE aisle = '${aisle}'`)
    } else {
      return Promise.resolve({ status: false, errMessage: 'aisle is required!' })
    }
  }

  getNonEmptyAisles (): Promise<NCResponse<string[]>> {
    const shopId = LocalShopService.getLocalShopId()
    return super.rawReadQuery(`SELECT aisle FROM shopStocksView WHERE shopId = ${shopId} GROUP BY aisle ORDER BY aisle`).then(resp => {
      if (resp.status && resp.data) {
        return { status: true, data: resp.data.map(row => row.aisle) }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  getProductsByAisle (aisle: string, pageSize: number, pageIndex: number):
      Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    if (!aisle) {
      // return Promise.resolve({ status: false, errMessage: 'aisle is required!' })
      return Promise.resolve({ status: true, data: { products: [], totalProducts: 0 } })
    } else {
      return super.rawReadQuery(
        `SELECT products.id id
         /* products.name name, SSV.aisle aisle, SSV.quantity quantity */
         FROM shopStocksView SSV
         INNER JOIN variants ON variants.id = variantId
         INNER JOIN products on variants.productId = products.Id
         WHERE aisle = "${aisle}"`
      ).then(resp => {
        if (resp.status && resp.data) {
          if (resp.data.length > 0) {
            const ids: any = resp.data.map(data => data.id)
            return LocalShopService.getInStockProducts({ pageIndex, pageSize, productId : ids }).then(resp2 => {
              if (resp2.status) {
                return resp2
              } else {
                return { status: false, errMessage: resp2.errMessage }
              }
            })
          } else {
            return { status: true, data: { products: [], totalProducts: 0 } }
          }
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    }
  }

  getStockBSTs (): Promise<NCResponse<Array<ShopStockBSTWithQuantity>>> {
    return super.rawReadQuery(`SELECT * FROM shopStockBSTsView`)
  }

  addStockBST (data: Partial<ShopStockBST>): Promise<NCResponse<ShopStockBST>> {
    if (!data.description) {
      return Promise.resolve({ status: false, errMessage: 'description is required!' })
    } else if (!data.date) {
      return Promise.resolve({ status: false, errMessage: 'date is required!' })
    } else {
      return super.create<ShopStockBST>('ShopStockBST', { ...data, shopId: LocalShopService.getLocalShopId() })
    }
  }

  updateStockBST (bstId: number, data: Partial<ShopStockBST>): Promise<NCResponse<number>> {
    if (!bstId) {
      return Promise.resolve({ status: false, errMessage: 'bstId is required!' })
    } else if (!data.description) {
      return Promise.resolve({ status: false, errMessage: 'description is required!' })
    } else if (!data.date) {
      return Promise.resolve({ status: false, errMessage: 'date is required!' })
    } else {
      return super.update<ShopStockBST>('ShopStockBST', data, { id : bstId })
    }
  }

  deleteStockBST (bstId: number): Promise<NCResponse<number>> {
    if (!bstId) {
      return Promise.resolve({ status: false, errMessage: 'bstId is required!' })
    } else {
      return super.delete<ShopStockBST>('ShopStockBST', { id: bstId })
    }
  }

  getStocks (bstId: number): Promise<NCResponse<Partial<ShopStock[]>>> {
    if (!bstId) {
      return Promise.resolve({ status: false, errMessage: 'bstId is required!' })
    } else {
      return ShopService.getShopStock(LocalShopService.getLocalShopId(), { shopStockBSTId: bstId })
    }
  }

  getStocksGroupedByAisle (variantId: number): Promise<NCResponse<ShopStock[]>> {
    return super.rawReadQuery(`SELECT * FROM shopStocksView WHERE shopId=${LocalShopService.getLocalShopId()} AND variantId=${variantId} AND quantity > 0`)
  }

  addShopStock (bstId: number, data: Partial<ShopStock>): Promise<NCResponse<ShopStock>> {
    const { variantId, price, quantity, aisle, date } = data

    if (!bstId) {
      return Promise.resolve({ status: false, errMessage: 'bstId is required!' })
    } else if (!price) {
      return Promise.resolve({ status: false, errMessage: 'price is required!' })
    } else if (!variantId) {
      return Promise.resolve({ status: false, errMessage: 'variantId is required!' })
    } else {
      return this.create<ShopStock>('ShopStock', {
        shopId: LocalShopService.getLocalShopId(),
        shopStockBSTId: bstId,
        variantId,
        price,
        quantity,
        aisle,
        date
      })
    }
  }

}

export default new LocalStockService()
