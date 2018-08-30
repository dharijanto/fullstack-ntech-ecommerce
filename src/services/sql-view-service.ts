import { CRUDService } from './crud-service'
import { Model, Instance } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

/*
  This is used by ShopManagement in the CMS.
  We have LocalShopService, this is specifically for shop-specific code.
*/
class SQLViewService extends CRUDService {
  /*
    This view combines:
    1. Product -> basic information about available products
    2. ShopProduct -> shop-specific information, used for per-shop product personalitzation
    3. ShopStock -> figure out how many physical stocks available
    4. OrderDetail -> figure out how many of the physical stocks have been used up
    5. SupplierStock -> figure out how many suppliers available
  */
  createShopifiedProductView () {
    return super.getSequelize().query(`
CREATE VIEW shopifiedProductsView AS
(SELECT products.id, products.name as name, products.description as description, products.warranty as warranty, products.price as defaultPrice,
        stockTable.shopId as shopId, IFNULL(stockTable.stockQuantity, 0) as stockQuantity,
        IFNULL(supplierTable.supplierCount, 0) as supplierCount,
        IFNULL(shopProducts.createdAt, products.createdAt) as createdAt,
        IFNULL(shopProducts.updatedAt, products.updatedAt) as updatedAt,
        IFNULL(shopProducts.price, products.price) as shopPrice,
        IFNULL(shopProducts.preOrderAllowed,${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderAllowed ? 'TRUE' : 'FALSE'}) as preOrderAllowed,
        IFNULL(shopProducts.preOrderDuration, ${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderDuration}) as preOrderDuration,
        IFNULL(shopProducts.disabled, ${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.disabled}) as disabled
 FROM products

LEFT OUTER JOIN
  (SELECT shopStocks.shopId AS shopId, productid AS productId, SUM(shopStocks.quantity) stockQuantity
   FROM variants INNER JOIN shopStocks ON variants.id = shopStocks.variantId
   GROUP BY shopId, productId) AS stockTable
ON products.id = stockTable.productId

LEFT OUTER JOIN
  (SELECT variants.productId as productId, count(*) as supplierCount from variants
   INNER JOIN supplierStocks ON variants.id = supplierStocks.variantId
   GROUP BY variants.productId) as supplierTable
ON products.id = supplierTable.productId

LEFT OUTER JOIN shopProducts ON products.id = shopProducts.productId AND stockTable.shopId = shopProducts.shopId)
    `)
  }

  createShopifiedVariantView () {
    return super.getSequelize().query(`
CREATE VIEW shopifiedVariantsView AS
(SELECT variants.id as id, variants.productId as productId, variants.name as name,
        shopStocksTable.shopId as shopId, IFNULL(shopStocksTable.stockQuantity, 0) as stockQuantity,
        IFNULL(supplierStocksTable.supplierCount, 0) as supplierCount
 FROM variants

LEFT OUTER JOIN
  (SELECT shopStocks.variantId as variantId, shopStocks.shopId as shopId, SUM(shopStocks.quantity) as stockQuantity
    FROM shopStocks
    GROUP BY shopStocks.variantId, shopStocks.shopId) as shopStocksTable
ON variants.id = shopStocksTable.variantId

LEFT OUTER JOIN
  (SELECT supplierStocks.variantId as variantId, COUNT(*) as supplierCount
   FROM supplierStocks
   GROUP BY supplierStocks.variantId) as supplierStocksTable
ON variants.id = supplierStocksTable.variantId
);
    `)
  }

  createInShopProductView () {

  }

  createInShopVariantView () {

  }

  createPOProductView () {

  }

  createPOVariantView () {

  }

  populateViews () {
    const promises: Array<() => Promise<any>> = [this.createShopifiedProductView, this.createShopifiedVariantView]
    return promises.reduce((acc, promise) => {
      return acc.then(() => {
        return promise()
      })
    }, Promise.resolve())
  }
}

export default new SQLViewService()
