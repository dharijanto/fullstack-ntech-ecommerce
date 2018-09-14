import { CRUDService } from './crud-service'
import { Model, Instance } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

let log = require('npmlog')

const TAG = 'SQLViewService'
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
  createShopifiedProductsView () {
    log.info(TAG, 'createShopifiedProductsView()')
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

  createShopifiedVariantsView () {
    log.info(TAG, 'createShopifiedVariantsView()')
    return super.getSequelize().query(`
CREATE VIEW shopifiedVariantsView AS
(SELECT variants.id as id, variants.productId as productId, variants.name as name, variants.createdAt as createdAt, variants.updatedAt as updatedAt,
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

  createInStockProductsView () {
    log.info(TAG, 'createInStockProductsView()')
    return super.getSequelize().query(`
CREATE VIEW inStockProductsView AS
(SELECT spView.id as id, spView.shopId as shopId, spView.name as name, spView.description as description, spView.createdAt as createdAt, spView.updatedAt as updatedAt,
         spView.warranty as warranty, IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.stockQuantity as stockQuantity
  FROM shopifiedProductsView as spView WHERE disabled = FALSE and stockQuantity > 0
);`)
  }

  createInStockVariantsView () {
    log.info(TAG, 'createInStockVariantsView()')
    return super.getSequelize().query(`
CREATE VIEW inStockVariantsView AS
(
SELECT svView.id as id, svView.shopId as shopId, svView.productId as productId,
       svView.name as name, svView.stockQuantity as stockQuantity, svView.createdAt as createdAt, svView.updatedAt as updatedAt
FROM shopifiedVariantsView as svView WHERE stockQuantity > 0
);
`)
  }

  createPOProductsView () {
    log.info(TAG, 'createPOProductsView()')
    return super.getSequelize().query(`
CREATE VIEW poProductsView AS
(
SELECT spView.id as id, spView.shopId as shopId, spView.name as name, spView.description as description, spView.createdAt as createdAt, spView.updatedAt as updatedAt,
        spView.warranty as warranty, IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.preOrderDuration as preOrderDurati\
on
FROM shopifiedProductsView as spView WHERE disabled = FALSE AND preOrderAllowed = TRUE AND supplierCount > 0
);
`)
  }

  createPOVariantsView () {
    log.info(TAG, 'createPOVariantsView()')
    return super.getSequelize().query(`
CREATE VIEW poVariantsView AS
(
SELECT svView.id as id, svView.shopId as shopId, svView.productId as productId, svView.createdAt as createdAt, svView.updatedAt as updatedAt,
        svView.name as name, svView.supplierCount as supplierCount
FROM shopifiedVariantsView as svView WHERE supplierCount > 0
);`)
  }

  createOrderView () {
    return super.getSequelize().query(`
CREATE VIEW ordersView AS
(
SELECT orders.id as id, orders.fullName as fullName, orders.phoneNumber as phoneNumber, orders.notes as notes, orders.status as status, orders.createdAt as createdAt, orders.updatedAt as updatedAt,
SUM(orderDetails.quantity) as quantity, SUM(orderDetails.price) as price, orders.shopId as shopId
FROM orders
INNER JOIN orderDetails on  orderDetails.orderId = orders.id
GROUP BY orderDetails.orderId
);`)
  }

  createOrderDetailsView () {
    return super.getSequelize().query(`
CREATE VIEW orderDetailsView AS
(
SELECT orderDetails.id AS id, orderDetails.orderId AS orderId, orderDetails.quantity AS quantity,
       orderDetails.price AS price, orderDetails.status AS status,
       orderDetails.createdAt AS createdAt, orderDetails.updatedAt AS updatedAt,
       variants.name AS variantName, variants.id AS variantId,
       products.name AS productName, products.id AS productId,
       shopifiedProductsView.preOrderDuration AS preOrderDuration
FROM orderDetails
INNER JOIN variants ON orderDetails.variantId = variants.id
INNER JOIN products ON variants.productId = products.id
INNER JOIN orders ON orders.id = orderDetails.orderId
INNER JOIN shopifiedProductsView on variants.productId = shopifiedProductsView.id AND shopifiedProductsView.shopId = orders.shopId
WHERE orderDetails.deletedAt IS NULL
);`)
  }

  destroyViews () {
    log.info(TAG, 'destroyViews()')

    const views = ['shopifiedProductsView', 'shopifiedVariantsView',
      'inStockProductsView', 'inStockVariantsView', 'poProductsView', 'poVariantsView', 'ordersView', 'orderDetailsView']

    return views.reduce((acc, view) => {
      return acc.then(() => {
        return
      }).catch(err => {
        log.info(TAG, err)
      }).finally(() => {
        // Even if there's an error (i.e. the view to be dropped doesn't exist, we want
        // to continue
        return super.getSequelize().query(`DROP VIEW ${view};`).catch(() => {
          return
        })
      })
    }, Promise.resolve())
  }

  populateViews () {
    const promises: Array<() => Promise<any>> = [
      this.createShopifiedProductsView,
      this.createShopifiedVariantsView,
      this.createInStockProductsView,
      this.createInStockVariantsView,
      this.createPOProductsView,
      this.createPOVariantsView,
      this.createOrderView,
      this.createOrderDetailsView
    ]
    return this.destroyViews().then(result => {
      return promises.reduce((acc, promise) => {
        return acc.then(() => {
          return promise()
        })
      }, Promise.resolve())
    })
  }
}

export default new SQLViewService()
