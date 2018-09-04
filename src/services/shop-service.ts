import { CRUDService } from './crud-service'
import { Model, Instance, Sequelize } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

/*
  This is used to do shop management.
  For example, to customize price for product
*/
class ShopService extends CRUDService {
  /*
    Return product joined with shopProduct meta information.
    If shopProduct is not defined, append meta information:
    {
      id: null,
      price: product.price,
      preOrder: true,
      poLength: 3 days,
      disable: false
    }
  */

  // TODO: We should create test cases to ensure this is correct...
  // i.e. when there are suppliers, supplier count is correct
  //      when there are shopStocks, the count is correct
  getProducts (shopId, primaryImagesOnly = false, productSearchClause = {}, categorySearchClause = {}): Promise<NCResponse<ShopifiedProduct[]>> {
    return this.getSequelize().query(`SELECT * FROM shopifiedProductsView WHERE shopId = ${shopId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getVariants (shopId, productId): Promise<NCResponse<ShopifiedVariant[]>> {
    return this.getSequelize().query(`SELECT * FROM shopifiedVariantsView WHERE shopId = ${shopId} AND productId =${productId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  // Update shopProduct entry
  // In actuality, this can be insert/update
  updateProduct (shopId: number, productId: number, data: Partial<ShopProduct>) {
    const { price, preOrderAllowed, preOrderDuration, disabled } = data
    return this.getModels('ShopProduct').findOne({ where: { shopId, productId } }).then(data => {
      return {
        id: data && data.id,
        productId,
        shopId,
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

  getShopStock (searchClause) {
    return (this.getModels('ShopStock') as Model<Instance<ShopStock>, Partial<ShopStock>>).findAll({
      where: searchClause,
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

  addShopStock (data: Partial<ShopStock>) {
    const { shopId, variantId, price, quantity, date } = data
    return this.create<ShopStock>('ShopStock', {
      shopId,
      variantId,
      price,
      quantity,
      date
    })
  }

  getSupplierStock (supplierId: number) {
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
