import { CRUDService } from './crud-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

class ShopService extends CRUDService {
  getShopStock (shopId) {
    return this.getModels('ShopStock').findAll({
      where: { shopId },
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    })
  }

  addShopStock ({ shopId, variantId, price, quantity, date }) {
    return this.create<ShopStock>('ShopStock', {
      shopId,
      variantId,
      price,
      quantity,
      date
    })
  }

  getSupplierStock (supplierId) {
    return this.getModels('SupplierStock').findAll({
      where: { supplierId },
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    }).catch(this.errHandler)
  }

  addSupplierStock ({ supplierId, variantId, price }) {
    return this.create<SupplierStock>('SupplierStock', {
      supplierId,
      variantId,
      price
    })
  }

  getPromotion (shopId): Promise<NCResponse<Promotion[]>> {
    return this.getModels('Promotion').findAll({
      where: { shopId },
      include: [
        {
          model: this.getModels('Product')
        }
      ]
    }).then(data => {
      return { status: true, data }
    }).catch(this.errHandler)
  }
}

export default new ShopService()
