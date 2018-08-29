import { CRUDService } from './crud-service'
import ShopService from './shop-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'
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

  getProductsWithPrimaryImage () {
    return ShopService.getProducts(this.localShopId, true).then(resp => {
      if (!resp.status) {
        return resp
      } else if (resp.status && resp.data) {
        return { status: true, data: resp.data.filter(product => product.disable) }
      } else {
        return { status: false, errMessage: 'Data is expected but not found!' }
      }
    })
  }

  // Get all products with all images
  getProductWithAllImages (productSearchClause): Promise<NCResponse<Product[]>> {
    return ShopService.getProducts(this.localShopId, false, productSearchClause)
    /* return super.getModels('Product').findAll<Product>({
      where: searchClause,
      include: [
        {
          model: super.getModels('ProductImage')
        },
        {
          model: super.getModels('SubCategory'),
          include: [{ model: super.getModels('Category') }]
        },
        {
          model: super.getModels('Variant'),
          include: [
            {
              model: super.getModels('ShopStock'),
              where: {
                shopId: this.localShopId
              }
            }
          ]
        }
      ]//, order: ['product.productImages.primary']
    }).then(readData => {
      return { status: true, data: readData.map(data => data.get({ plain: true })) }
    }) */
  }
}
export default new LocalShopService()
