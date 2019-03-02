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
  // Get quantity of orders that are inStock (i.e. not PO)
  // This is used to compute the number of remaining stocks
  // (i.e. stocks left for variant X = all shop stocks - all in-stock orders)
  createInStockOrdersView () {
    return super.getSequelize().query(`
CREATE VIEW inStockOrdersView AS
(SELECT orders.shopId AS shopId,
        # Only the quantity of 'Ready'-stock item is considered when calculating stockQuantity
        SUM(IF(orderDetails.status = 'Ready', orderDetails.quantity, 0)) AS quantity,
        variants.productId, variants.id as variantId
FROM orders
LEFT OUTER JOIN orderDetails ON orderDetails.orderId = orders.id AND orderDetails.deletedAt IS NULL
LEFT OUTER JOIN variants ON variants.id = orderDetails.variantId AND variants.deletedAt IS NULL
WHERE orders.status != 'Cancelled' AND orders.deletedAt IS NULL
GROUP BY orders.shopId, variants.productId, variants.id)
`)
  }
  /*
    This view combines:
    1. Product -> basic information about available products
    2. ShopProduct -> shop-specific information, used for per-shop product personalitzation
    3. ShopStock -> figure out how many physical stocks available
    4. OrderDetail -> figure out how many of the physical stocks have been used up
    5. SupplierStock -> figure out how many suppliers available

    TODO:
    1. This should depend on shopifiedVariantsView, so that we don't compute stocks from two different places
  */
  createShopifiedProductsView () {
    log.info(TAG, 'createShopifiedProductsView()')
    return super.getSequelize().query(`
CREATE VIEW shopifiedProductsView AS
(SELECT products.id, products.name as name, products.description as description,
        products.warranty as warranty, products.price as defaultPrice,
        subCategories.id as subCategoryId,
        subCategories.name AS subCategoryName,
        categories.id AS categoryId,
        categories.name AS categoryName,
        shops.id as shopId,
        IFNULL(stockTable.stockQuantity, 0) - IFNULL(orderTable.quantity, 0) as stockQuantity,
        IFNULL(supplierTable.supplierCount, 0) as supplierCount,
        IFNULL(shopProducts.createdAt, products.createdAt) as createdAt,
        IFNULL(shopProducts.updatedAt, products.updatedAt) as updatedAt,
        IFNULL(shopProducts.price, products.price) as shopPrice,
        IFNULL(shopProducts.preOrderAllowed,${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderAllowed ? 'TRUE' : 'FALSE'}) as preOrderAllowed,
        IFNULL(shopProducts.preOrderDuration, ${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderDuration}) as preOrderDuration,
        IFNULL(shopProducts.disabled, ${AppConfig.DEFAULT_SHOP_PRODUCT_BEHAVIOR.disabled}) as disabled
FROM (SELECT * FROM products WHERE deletedAt IS NULL) AS products

CROSS JOIN shops

INNER JOIN subCategories ON subCategories.id = products.subCategoryId AND subCategories.deletedAt IS NULL
INNER JOIN categories ON categories.id = subCategories.categoryId AND categories.deletedAt IS NULL

LEFT OUTER JOIN
  (SELECT variants.productId AS productId, SUM(shopStocks.quantity) stockQuantity, shopStocks.shopId as shopId
   FROM variants INNER JOIN shopStocks ON variants.id = shopStocks.variantId
   WHERE variants.deletedAt IS NULL AND shopStocks.deletedAt IS NULL
   GROUP BY shopStocks.shopId, variants.productId) AS stockTable
ON products.id = stockTable.productId AND shops.id = stockTable.shopId

LEFT OUTER JOIN
  (SELECT inStockOrdersView.shopId AS shopId,
          inStockOrdersView.productId,
          inStockOrdersView.quantity AS quantity
    FROM inStockOrdersView
    GROUP BY inStockOrdersView.shopId, inStockOrdersView.productId
  ) AS orderTable ON orderTable.shopId = shops.id AND orderTable.productId = products.id

LEFT OUTER JOIN
  (SELECT variants.productId AS productId, COUNT(*) AS supplierCount FROM variants
   INNER JOIN supplierStocks ON variants.id = supplierStocks.variantId
   WHERE supplierStocks.deletedAt IS NULL AND variants.deletedAt IS NULL
   GROUP BY variants.productId) as supplierTable
ON products.id = supplierTable.productId

LEFT OUTER JOIN shopProducts ON products.id = shopProducts.productId AND shopProducts.deletedAt IS NULL)
    `)
  }

  // TODO: Sounds like supplierStocksTable is mistaken? Should double check it
  createShopifiedVariantsView () {
    log.info(TAG, 'createShopifiedVariantsView()')
    return super.getSequelize().query(`
CREATE VIEW shopifiedVariantsView AS
(SELECT variants.id as id, variants.productId as productId, variants.name as name,
        variants.createdAt as createdAt, variants.updatedAt as updatedAt,
        shops.id as shopId,
        IFNULL(shopStocksTable.stockQuantity, 0) - IFNULL(orderTable.quantity, 0) as stockQuantity,
        IFNULL(supplierStocksTable.supplierCount, 0) as supplierCount
FROM (SELECT * FROM variants WHERE variants.deletedAt IS NULL) AS variants

CROSS JOIN shops

LEFT OUTER JOIN
  (SELECT shopStocks.variantId as variantId, shopStocks.shopId as shopId, SUM(shopStocks.quantity) as stockQuantity
    FROM shopStocks
    WHERE shopStocks.deletedAt IS NULL
    GROUP BY shopStocks.variantId, shopStocks.shopId) as shopStocksTable
ON variants.id = shopStocksTable.variantId AND shops.id = shopStocksTable.shopId

LEFT OUTER JOIN
  (SELECT inStockOrdersView.shopId AS shopId, inStockOrdersView.quantity, inStockOrdersView.variantId
    FROM inStockOrdersView
    GROUP BY inStockOrdersView.shopId, inStockOrdersView.variantId
  ) AS orderTable ON orderTable.shopId = shops.id AND orderTable.variantId = variants.id

LEFT OUTER JOIN
  (SELECT supplierStocks.variantId as variantId, COUNT(*) as supplierCount
   FROM supplierStocks
   WHERE supplierStocks.deletedAt IS NULL
   GROUP BY supplierStocks.variantId) as supplierStocksTable
ON variants.id = supplierStocksTable.variantId
);
    `)
  }

  createInStockProductsView () {
    log.info(TAG, 'createInStockProductsView()')
    return super.getSequelize().query(`
CREATE VIEW inStockProductsView AS
(SELECT spView.id as id,
        spView.subCategoryId as subCategoryId, spView.subCategoryName as subCategoryName,
        spView.categoryId as categoryId, spView.categoryName as categoryName,
        spView.shopId as shopId,
        spView.name as name, spView.description as description, spView.createdAt as createdAt,
        spView.updatedAt as updatedAt, spView.warranty as warranty,
        IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.stockQuantity as stockQuantity
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
SELECT spView.id as id, spView.shopId as shopId, spView.name as name,
       spView.subCategoryId as subCategoryId, spView.subCategoryName as subCategoryName,
       spView.categoryId as categoryId, spView.categoryName as categoryName,
       spView.description as description, spView.createdAt as createdAt, spView.updatedAt as updatedAt,
       spView.warranty as warranty, IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.preOrderDuration as preOrderDurati\
on
FROM shopifiedProductsView as spView WHERE disabled = FALSE AND preOrderAllowed = TRUE AND supplierCount > 0 AND stockQuantity = 0
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
SELECT orders.id as id, orders.fullName as fullName, orders.phoneNumber as phoneNumber,
       orders.notes as notes, orders.status as status, orders.createdAt as createdAt,
       orders.updatedAt as updatedAt, SUM(orderDetails.quantity) as quantity,
       SUM(orderDetails.price * orderDetails.quantity) as price, orders.shopId as shopId
FROM (SELECT * FROM orders WHERE orders.deletedAt IS NULL) AS orders
LEFT OUTER JOIN orderDetails on orderDetails.orderId = orders.id AND orderDetails.deletedAt IS NULL
LEFT OUTER JOIN variants ON variants.id = orderDetails.variantId AND variants.deletedAt IS NULL
GROUP BY orders.id
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
FROM (SELECT * FROM orderDetails WHERE orderDetails.deletedAt IS NULL) AS orderDetails
INNER JOIN variants ON orderDetails.variantId = variants.id AND variants.deletedAt IS NULL
INNER JOIN products ON variants.productId = products.id AND products.deletedAt IS NULL
# Although orders is not used, it's needed so we don't count orders that are already deleted
INNER JOIN orders ON orders.id = orderDetails.orderId AND orders.deletedAt IS NULL
INNER JOIN shopifiedProductsView on variants.productId = shopifiedProductsView.id AND shopifiedProductsView.shopId = orders.shopId
);`)
  }

  createShopifiedPromotionsViews () {
    return super.getSequelize().query(`
CREATE VIEW shopifiedPromotionsView AS
(
SELECT promotions.id AS id, promotions.createdAt AS createdAt,
       promotions.updatedAt AS updatedAt, promotions.shopId AS shopId,
       promotions.name AS name,
       promotions.productId AS productId, promotions.imageFilename AS imageFilename,
       shopifiedProductsView.name AS productName,
       shopifiedProductsView.shopPrice AS productPrice
FROM (SELECT * FROM promotions WHERE deletedAT IS NULL) AS promotions
INNER JOIN shopifiedProductsView ON promotions.productId = shopifiedProductsView.id AND promotions.shopId = shopifiedProductsView.shopId
);`)
  }

  destroyViews () {
    log.info(TAG, 'destroyViews()')

    const views = ['inStockOrdersView', 'shopifiedProductsView', 'shopifiedVariantsView',
      'inStockProductsView', 'inStockVariantsView', 'poProductsView', 'poVariantsView',
      'ordersView', 'orderDetailsView', 'shopifiedPromotionsView']

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
      this.createInStockOrdersView,
      this.createShopifiedProductsView,
      this.createShopifiedVariantsView,
      this.createInStockProductsView,
      this.createInStockVariantsView,
      this.createPOProductsView,
      this.createPOVariantsView,
      this.createOrderView,
      this.createOrderDetailsView,
      this.createShopifiedPromotionsViews
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
