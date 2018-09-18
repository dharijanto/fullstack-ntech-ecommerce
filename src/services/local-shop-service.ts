import { CRUDService } from './crud-service'
import ShopService from './shop-service'
import OrderService from './order-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

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
    -Primary image only
  */
  getInStockProducts (pageSize = 10, pageIndex = 0): Promise<NCResponse<InStockProduct[]>> {
    return this.getSequelize().query(`
SELECT
  inStockProductsView.shopId as shopId,
  inStockProductsView.name as name,
  inStockProductsView.description as description,
  inStockProductsView.warranty as warranty,
  inStockProductsView.price as price,
  inStockProductsView.stockQuantity as stockQuantity,
  productImages.imageFilename as \`primaryImage.imageFilename\`,
  productImages.productId as \`primaryImage.productId\`,
  subCategories.name as \`subCategory.name\`,
  subCategories.description as \`subCategory.description\`,
  subCategories.categoryId as \`subCategory.categoryId\`,
  subCategories.imageFilename as \`subCategory.imageFilename\`,
  categories.name as \`subCategory.category.name\`,
  categories.description as \`subCategory.category.description\`
 FROM inStockProductsView
 LEFT OUTER JOIN productImages on inStockProductsView.id = productImages.productId
 LEFT OUTER JOIN subCategories on subCategories.id = inStockProductsView.subCategoryId
 LEFT OUTER JOIN categories on subCategories.categoryId = categories.id
 WHERE inStockProductsView.shopId = ${this.localShopId} AND productImages.primary = TRUE
 ORDER BY inStockProductsView.id LIMIT ${pageSize * pageIndex}, ${pageSize};
    `, { type: this.getSequelize().QueryTypes.SELECT, nest: true }).then(data => {
      return { status: true, data }
    })
  }

  getPOProducts (pageSize = 10, pageIndex = 0) {
    return this.getSequelize().query(`
SELECT
  poProductsView.shopId as shopId,
  poProductsView.name as name,
  poProductsView.description as description,
  poProductsView.warranty as warranty,
  poProductsView.price as price,
  poProductsView.preOrderDuration as preOrderDuration,
  productImages.imageFilename as \`primaryImage.imageFilename\`,
  productImages.productId as \`primaryImage.productId\`,
  subCategories.name as \`subCategory.name\`,
  subCategories.description as \`subCategory.description\`,
  subCategories.categoryId as \`subCategory.categoryId\`,
  subCategories.imageFilename as \`subCategory.imageFilename\`,
  categories.name as \`subCategory.category.name\`,
  categories.description as \`subCategory.category.description\`
 FROM poProductsView
 LEFT OUTER JOIN productImages on poProductsView.id = productImages.productId
 LEFT OUTER JOIN subCategories on subCategories.id = poProductsView.subCategoryId
 LEFT OUTER JOIN categories on subCategories.categoryId = categories.id
 WHERE poProductsView.shopId = ${this.localShopId} AND productImages.primary = TRUE
 ORDER BY poProductsView.id LIMIT ${pageSize * pageIndex}, ${pageSize};
    `, { type: this.getSequelize().QueryTypes.SELECT, nest: true }).then(data => {
      return { status: true, data }
    })
  }

  getInStockProduct (productId): Promise<NCResponse<InStockProduct>> {
    // Unfortunately, join raw query doesn't get parsed nicely by Sequelize by default
    // for that, we have to manually parse the SELECT clause
    return this.getSequelize().query(`
SELECT
    p.id as id,
    p.shopId as shopId,
    p.name as name,
    p.description as description,
    p.warranty as warranty,
    p.price as price,
    p.stockQuantity as stockQuantity,
    v.id as \`variants.id\`,
    v.shopId as \`variants.shopId\`,
    v.productId as \`variants.productId\`,
    v.name as \`variants.name\`,
    v.stockQuantity as \`variants.stockQuantity\`,
    v.name as \`variants.name\`
FROM inStockProductsView AS p
INNER JOIN inStockVariantsView AS v ON p.id = v.productId AND p.shopId = v.shopId
WHERE p.id=${productId} AND p.shopId=${this.localShopId}
    `, { type: this.getSequelize().QueryTypes.SELECT, nest: true }).then(data => {
      if (data.length > 0) {
        return { status: true, data: data[0] }
      } else {
        return { status: false, errMessage: 'Product is not found!' }
      }
    })
  }

  getPOProduct (productId) {
    return
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
  getProductWithAllImages (productSearchClause): Promise<NCResponse<ShopifiedProduct[]>> {
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

  getOrders () {
    return OrderService.getOrders(this.localShopId)
  }

  getOrderDetails (orderId) {
    return OrderService.getOrderDetails(orderId)
  }
}
export default new LocalShopService()
