"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const crud_service_1=require("./crud-service"),Promise=require("bluebird"),app_config_1=require("../app-config");let log=require("npmlog");const TAG="SQLViewService";class SQLViewService extends crud_service_1.CRUDService{createSupplierStocksView(){return super.getSequelize().query("\n      CREATE VIEW supplierStocksView AS\n      (SELECT supplierStocks.id id, products.name AS productName, variants.name AS variantName,\n              supplierStocks.price AS supplierPrice, supplierStocks.createdAt AS createdAt,\n              supplierStocks.updatedAt AS updatedAt\n        FROM supplierStocks\n        INNER JOIN variants ON variants.id = supplierStocks.variantId AND variants.deletedAt IS NULL\n        INNER JOIN products ON products.id = variants.productId AND products.deletedAt IS NULL\n        WHERE supplierStocks.deletedAt IS NULL\n      )\n    ")}createShopStocksView(){return super.getSequelize().query("\nCREATE VIEW shopStocksView AS\n(SELECT shopStocksView.shopId, shopStocksView.variantId,\n        shopStocksView.aisle, shopStocksView.quantity - IFNULL(orderDetailsView.quantity, 0) AS quantity\n  FROM (\n  SELECT shopStocks.shopId AS shopId, shopStocks.variantId AS variantId,\n      SUM(shopStocks.quantity) AS quantity, shopStocks.aisle AS aisle\n  FROM shopStocks\n  WHERE deletedAt IS NULL\n  GROUP BY shopStocks.shopId, shopStocks.variantId, shopStocks.aisle\n  ) AS shopStocksView\nLEFT OUTER JOIN\n  (SELECT orders.shopId AS shopId, orderDetails.variantId AS variantId,\n      SUM(orderDetails.quantity) AS quantity, orderDetails.aisle AS aisle\n    FROM orderDetails\n    INNER JOIN orders ON orders.id = orderDetails.orderId\n    WHERE orders.status != 'Cancelled' AND orderDetails.status = 'Ready' AND orderDetails.deletedAt IS NULL AND orders.deletedAt IS NULL\n    GROUP BY orders.shopId, orderDetails.variantId, orderDetails.aisle\n  ) AS orderDetailsView ON orderDetailsView.shopId = shopStocksView.shopId AND\n       orderDetailsView.variantId = shopStocksView.variantId AND orderDetailsView.aisle = shopStocksView.aisle\n)\n    ")}createPOOrdersView(){return super.getSequelize().query("\nCREATE VIEW poOrdersView AS\n(SELECT orders.shopId AS shopId,\n        SUM(IF(orderDetails.status = 'PO', orderDetails.quantity, 0)) AS quantity,\n        variants.productId, variants.id as variantId\nFROM orders\nLEFT OUTER JOIN orderDetails ON orderDetails.orderId = orders.id AND orderDetails.deletedAt IS NULL\nLEFT OUTER JOIN variants ON variants.id = orderDetails.variantId AND variants.deletedAt IS NULL\nWHERE orders.status != 'Cancelled' AND orders.deletedAt IS NULL\nGROUP BY orders.shopId, variants.productId, variants.id)\n")}createInStockOrdersView(){return super.getSequelize().query("\nCREATE VIEW inStockOrdersView AS\n(SELECT orders.shopId AS shopId,\n        # Only the quantity of 'Ready'-stock item is considered when calculating stockQuantity\n        SUM(IF(orderDetails.status = 'Ready', orderDetails.quantity, 0)) AS quantity,\n        variants.productId, variants.id as variantId\nFROM orders\nLEFT OUTER JOIN orderDetails ON orderDetails.orderId = orders.id AND orderDetails.deletedAt IS NULL\nLEFT OUTER JOIN variants ON variants.id = orderDetails.variantId AND variants.deletedAt IS NULL\nWHERE orders.status != 'Cancelled' AND orders.deletedAt IS NULL\nGROUP BY orders.shopId, variants.productId, variants.id)\n")}createShopifiedProductsView(){return log.info(TAG,"createShopifiedProductsView()"),super.getSequelize().query(`\nCREATE VIEW shopifiedProductsView AS\n(SELECT products.id, products.name as name, products.description as description,\n        products.warranty as warranty, products.price as defaultPrice,\n        subCategories.id as subCategoryId,\n        subCategories.name AS subCategoryName,\n        categories.id AS categoryId,\n        categories.name AS categoryName,\n        shops.id as shopId,\n        IFNULL(stockTable.stockQuantity, 0) as stockQuantity,\n        IFNULL(stockTable.allTimeStocks, 0) as allTimeStocks,\n        IFNULL(stockTable.allTimeOrders, 0) as allTimeOrders,\n        IFNULL(stockTable.allTimePOOrders, 0) as allTimePOOrders,\n        IFNULL(supplierTable.supplierCount, 0) as supplierCount,\n        IFNULL(shopProducts.createdAt, products.createdAt) as createdAt,\n        IFNULL(shopProducts.updatedAt, products.updatedAt) as updatedAt,\n        IFNULL(shopProducts.price, products.price) as shopPrice,\n        IFNULL(shopProducts.preOrderAllowed,${app_config_1.default.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderAllowed?"TRUE":"FALSE"}) as preOrderAllowed,\n        IFNULL(shopProducts.preOrderDuration, ${app_config_1.default.DEFAULT_SHOP_PRODUCT_BEHAVIOR.preOrderDuration}) as preOrderDuration,\n        IFNULL(shopProducts.disabled, ${app_config_1.default.DEFAULT_SHOP_PRODUCT_BEHAVIOR.disabled}) as disabled\nFROM (SELECT * FROM products WHERE deletedAt IS NULL) AS products\n\nCROSS JOIN shops\n\nINNER JOIN subCategories ON subCategories.id = products.subCategoryId AND subCategories.deletedAt IS NULL\nINNER JOIN categories ON categories.id = subCategories.categoryId AND categories.deletedAt IS NULL\n\nLEFT OUTER JOIN\n  (SELECT SUM(stockQuantity) AS stockQuantity, SUM(allTimeStocks) AS allTimeStocks,\n          SUM(allTimeOrders) AS allTimeOrders, SUM(allTimePOOrders) AS allTimePOOrders,\n          productId, shopId\n   FROM shopifiedVariantsView\n   GROUP BY productId, shopId\n  ) AS stockTable\nON stockTable.productId = products.id AND stockTable.shopId = shops.id\n\nLEFT OUTER JOIN\n  (SELECT variants.productId AS productId, COUNT(*) AS supplierCount FROM variants\n   INNER JOIN supplierStocks ON variants.id = supplierStocks.variantId\n   WHERE supplierStocks.deletedAt IS NULL AND variants.deletedAt IS NULL\n   GROUP BY variants.productId) as supplierTable\nON products.id = supplierTable.productId\n\nLEFT OUTER JOIN shopProducts ON products.id = shopProducts.productId AND shopProducts.deletedAt IS NULL)\n    `)}createShopifiedVariantsView(){return log.info(TAG,"createShopifiedVariantsView()"),super.getSequelize().query("\nCREATE VIEW shopifiedVariantsView AS\n(SELECT variants.id as id, variants.productId as productId, variants.name as name,\n        variants.createdAt as createdAt, variants.updatedAt as updatedAt,\n        shops.id as shopId,\n        IFNULL(shopStocksTable.stockQuantity, 0) - IFNULL(inStockOrdersView.quantity, 0) as stockQuantity,\n        IFNULL(shopStocksTable.stockQuantity, 0) AS allTimeStocks,\n        IFNULL(inStockOrdersView.quantity, 0) as allTimeOrders,\n        IFNULL(poOrdersView.quantity, 0) as allTimePOOrders,\n        IFNULL(supplierStocksTable.supplierCount, 0) as supplierCount\nFROM (SELECT * FROM variants WHERE variants.deletedAt IS NULL) AS variants\n\nCROSS JOIN shops\n\nLEFT OUTER JOIN\n  (SELECT shopStocks.variantId as variantId, shopStocks.shopId as shopId, SUM(shopStocks.quantity) as stockQuantity\n    FROM shopStocks\n    WHERE shopStocks.deletedAt IS NULL\n    GROUP BY shopStocks.variantId, shopStocks.shopId) as shopStocksTable\nON variants.id = shopStocksTable.variantId AND shops.id = shopStocksTable.shopId\n\nLEFT OUTER JOIN\n  (SELECT inStockOrdersView.shopId AS shopId, SUM(inStockOrdersView.quantity) AS quantity, inStockOrdersView.variantId AS variantId\n    FROM inStockOrdersView\n    GROUP BY inStockOrdersView.shopId, inStockOrdersView.variantId\n  ) AS inStockOrdersView ON inStockOrdersView.shopId = shops.id AND inStockOrdersView.variantId = variants.id\n\nLEFT OUTER JOIN\n  (SELECT poOrdersView.shopId AS shopId, SUM(poOrdersView.quantity) AS quantity, poOrdersView.variantId AS variantId\n    FROM poOrdersView\n    GROUP BY poOrdersView.shopId, poOrdersView.variantId\n  ) AS poOrdersView ON poOrdersView.shopId = shops.id AND poOrdersView.variantId = variants.id\n\nLEFT OUTER JOIN\n  (SELECT supplierStocks.variantId as variantId, COUNT(*) as supplierCount\n   FROM supplierStocks\n   WHERE supplierStocks.deletedAt IS NULL\n   GROUP BY supplierStocks.variantId) as supplierStocksTable\nON variants.id = supplierStocksTable.variantId\n);\n    ")}createInStockProductsView(){return log.info(TAG,"createInStockProductsView()"),super.getSequelize().query("\nCREATE VIEW inStockProductsView AS\n(SELECT spView.id as id,\n        spView.subCategoryId as subCategoryId, spView.subCategoryName as subCategoryName,\n        spView.categoryId as categoryId, spView.categoryName as categoryName,\n        spView.shopId as shopId,\n        spView.name as name, spView.description as description, spView.createdAt as createdAt,\n        spView.updatedAt as updatedAt, spView.warranty as warranty,\n        IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.stockQuantity as stockQuantity\n  FROM shopifiedProductsView as spView WHERE disabled = FALSE and stockQuantity > 0\n);")}createInStockVariantsView(){return log.info(TAG,"createInStockVariantsView()"),super.getSequelize().query("\nCREATE VIEW inStockVariantsView AS\n(\nSELECT svView.id as id, svView.shopId as shopId, svView.productId as productId,\n       svView.name as name, svView.stockQuantity as stockQuantity, svView.createdAt as createdAt, svView.updatedAt as updatedAt\nFROM shopifiedVariantsView as svView WHERE stockQuantity > 0\n);\n")}createPOProductsView(){return log.info(TAG,"createPOProductsView()"),super.getSequelize().query("\nCREATE VIEW poProductsView AS\n(\nSELECT spView.id as id, spView.shopId as shopId, spView.name as name,\n       spView.subCategoryId as subCategoryId, spView.subCategoryName as subCategoryName,\n       spView.categoryId as categoryId, spView.categoryName as categoryName,\n       spView.description as description, spView.createdAt as createdAt, spView.updatedAt as updatedAt,\n       spView.warranty as warranty, IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.preOrderDuration as preOrderDuration\nFROM shopifiedProductsView as spView WHERE disabled = FALSE AND preOrderAllowed = TRUE AND supplierCount > 0 AND stockQuantity = 0\n);\n")}createPOVariantsView(){return log.info(TAG,"createPOVariantsView()"),super.getSequelize().query("\nCREATE VIEW poVariantsView AS\n(\nSELECT svView.id as id, svView.shopId as shopId, svView.productId as productId, svView.createdAt as createdAt, svView.updatedAt as updatedAt,\n        svView.name as name, svView.supplierCount as supplierCount\nFROM shopifiedVariantsView as svView WHERE supplierCount > 0\n);")}createOrderView(){return super.getSequelize().query("\nCREATE VIEW ordersView AS\n(\nSELECT orders.id as id, orders.fullName as fullName, orders.phoneNumber as phoneNumber,\n       orders.notes as notes, orders.status as status, orders.createdAt as createdAt,\n       orders.updatedAt as updatedAt, SUM(orderDetails.quantity) as quantity,\n       SUM(orderDetails.price * orderDetails.quantity) as price, orders.shopId as shopId\nFROM (SELECT * FROM orders WHERE orders.deletedAt IS NULL) AS orders\nLEFT OUTER JOIN orderDetails on orderDetails.orderId = orders.id AND orderDetails.deletedAt IS NULL\nLEFT OUTER JOIN variants ON variants.id = orderDetails.variantId AND variants.deletedAt IS NULL\nGROUP BY orders.id\n);")}createCustomerOrderDetailsView(){return super.getSequelize().query("\nCREATE VIEW customerOrderDetailsView AS\n(\nSELECT orderId, SUM(quantity) AS quantity, price, status,\n       variantName, productName, preOrderDuration\nFROM orderDetailsView\nGROUP BY orderId, productId, variantId, price, status, variantName, productName, preOrderDuration\n)\n")}createOrderDetailsView(){return super.getSequelize().query("\nCREATE VIEW orderDetailsView AS\n(\nSELECT orderDetails.id AS id, orderDetails.orderId AS orderId, orderDetails.quantity AS quantity,\n       orderDetails.price AS price, orderDetails.status AS status,\n       orderDetails.aisle AS aisle,\n       orderDetails.createdAt AS createdAt, orderDetails.updatedAt AS updatedAt,\n       variants.name AS variantName, variants.id AS variantId,\n       products.name AS productName, products.id AS productId,\n       shopifiedProductsView.preOrderDuration AS preOrderDuration\nFROM (SELECT * FROM orderDetails WHERE orderDetails.deletedAt IS NULL) AS orderDetails\nINNER JOIN variants ON orderDetails.variantId = variants.id AND variants.deletedAt IS NULL\nINNER JOIN products ON variants.productId = products.id AND products.deletedAt IS NULL\n# Although orders is not used, it's needed so we don't count orders that are already deleted\nINNER JOIN orders ON orders.id = orderDetails.orderId AND orders.deletedAt IS NULL\nINNER JOIN shopifiedProductsView on variants.productId = shopifiedProductsView.id AND shopifiedProductsView.shopId = orders.shopId\n);")}createShopifiedPromotionsViews(){return super.getSequelize().query("\nCREATE VIEW shopifiedPromotionsView AS\n(\nSELECT promotions.id AS id, promotions.createdAt AS createdAt,\n       promotions.updatedAt AS updatedAt, promotions.shopId AS shopId,\n       promotions.name AS name,\n       promotions.productId AS productId, promotions.imageFilename AS imageFilename,\n       shopifiedProductsView.name AS productName,\n       shopifiedProductsView.shopPrice AS productPrice\nFROM (SELECT * FROM promotions WHERE deletedAT IS NULL) AS promotions\nINNER JOIN shopifiedProductsView ON promotions.productId = shopifiedProductsView.id AND promotions.shopId = shopifiedProductsView.shopId\n);")}destroyViews(){log.info(TAG,"destroyViews()");return["supplierStocksView","shopStocksView","poOrdersView","inStockOrdersView","shopifiedProductsView","shopifiedVariantsView","inStockProductsView","inStockVariantsView","poProductsView","poVariantsView","ordersView","orderDetailsView","customerOrderDetailsView","shopifiedPromotionsView"].reduce((e,r)=>e.then(()=>{}).catch(e=>{log.info(TAG,e)}).finally(()=>super.getSequelize().query(`DROP VIEW ${r};`).catch(()=>{})),Promise.resolve())}populateViews(){const e=[this.createSupplierStocksView,this.createShopStocksView,this.createPOOrdersView,this.createInStockOrdersView,this.createShopifiedVariantsView,this.createShopifiedProductsView,this.createInStockProductsView,this.createInStockVariantsView,this.createPOProductsView,this.createPOVariantsView,this.createOrderView,this.createOrderDetailsView,this.createCustomerOrderDetailsView,this.createShopifiedPromotionsViews];return this.destroyViews().then(r=>e.reduce((e,r)=>e.then(()=>r()),Promise.resolve()))}}exports.default=new SQLViewService;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9zcWwtdmlldy1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbImNydWRfc2VydmljZV8xIiwicmVxdWlyZSIsIlByb21pc2UiLCJhcHBfY29uZmlnXzEiLCJsb2ciLCJUQUciLCJTUUxWaWV3U2VydmljZSIsIkNSVURTZXJ2aWNlIiwiW29iamVjdCBPYmplY3RdIiwic3VwZXIiLCJnZXRTZXF1ZWxpemUiLCJxdWVyeSIsImluZm8iLCJkZWZhdWx0IiwiREVGQVVMVF9TSE9QX1BST0RVQ1RfQkVIQVZJT1IiLCJwcmVPcmRlckFsbG93ZWQiLCJwcmVPcmRlckR1cmF0aW9uIiwiZGlzYWJsZWQiLCJyZWR1Y2UiLCJhY2MiLCJ2aWV3IiwidGhlbiIsImNhdGNoIiwiZXJyIiwiZmluYWxseSIsInJlc29sdmUiLCJwcm9taXNlcyIsInRoaXMiLCJjcmVhdGVTdXBwbGllclN0b2Nrc1ZpZXciLCJjcmVhdGVTaG9wU3RvY2tzVmlldyIsImNyZWF0ZVBPT3JkZXJzVmlldyIsImNyZWF0ZUluU3RvY2tPcmRlcnNWaWV3IiwiY3JlYXRlU2hvcGlmaWVkVmFyaWFudHNWaWV3IiwiY3JlYXRlU2hvcGlmaWVkUHJvZHVjdHNWaWV3IiwiY3JlYXRlSW5TdG9ja1Byb2R1Y3RzVmlldyIsImNyZWF0ZUluU3RvY2tWYXJpYW50c1ZpZXciLCJjcmVhdGVQT1Byb2R1Y3RzVmlldyIsImNyZWF0ZVBPVmFyaWFudHNWaWV3IiwiY3JlYXRlT3JkZXJWaWV3IiwiY3JlYXRlT3JkZXJEZXRhaWxzVmlldyIsImNyZWF0ZUN1c3RvbWVyT3JkZXJEZXRhaWxzVmlldyIsImNyZWF0ZVNob3BpZmllZFByb21vdGlvbnNWaWV3cyIsImRlc3Ryb3lWaWV3cyIsInJlc3VsdCIsInByb21pc2UiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoib0VBQUEsTUFBQUEsZUFBQUMsUUFBQSxrQkFFQUMsUUFBQUQsUUFBQSxZQUVBRSxhQUFBRixRQUFBLGlCQUVBLElBQUlHLElBQU1ILFFBQVEsVUFFbEIsTUFBTUksSUFBTSx1QkFLWkMsdUJBQTZCTixlQUFBTyxZQUMzQkMsMkJBQ0UsT0FBT0MsTUFBTUMsZUFBZUMsTUFBTSxra0JBY3BDSCx1QkFDRSxPQUFPQyxNQUFNQyxlQUFlQyxNQUFNLCtuQ0F3QnBDSCxxQkFDRSxPQUFPQyxNQUFNQyxlQUFlQyxNQUFNLDZoQkFlcENILDBCQUNFLE9BQU9DLE1BQU1DLGVBQWVDLE1BQU0scW9CQXlCcENILDhCQUVFLE9BREFKLElBQUlRLEtBQUtQLElBQUssaUNBQ1BJLE1BQU1DLGVBQWVDLHc5QkFpQmNSLGFBQUFVLFFBQVVDLDhCQUE4QkMsZ0JBQWtCLE9BQVMsK0VBQ2pFWixhQUFBVSxRQUFVQyw4QkFBOEJFLGlGQUNoRGIsYUFBQVUsUUFBVUMsOEJBQThCRywrbkNBNkI5RVQsOEJBRUUsT0FEQUosSUFBSVEsS0FBS1AsSUFBSyxpQ0FDUEksTUFBTUMsZUFBZUMsTUFBTSx3OURBMkNwQ0gsNEJBRUUsT0FEQUosSUFBSVEsS0FBS1AsSUFBSywrQkFDUEksTUFBTUMsZUFBZUMsTUFBTSxtbkJBYXBDSCw0QkFFRSxPQURBSixJQUFJUSxLQUFLUCxJQUFLLCtCQUNQSSxNQUFNQyxlQUFlQyxNQUFNLGlVQVVwQ0gsdUJBRUUsT0FEQUosSUFBSVEsS0FBS1AsSUFBSywwQkFDUEksTUFBTUMsZUFBZUMsTUFBTSxpcEJBY3BDSCx1QkFFRSxPQURBSixJQUFJUSxLQUFLUCxJQUFLLDBCQUNQSSxNQUFNQyxlQUFlQyxNQUFNLDJUQVNwQ0gsa0JBQ0UsT0FBT0MsTUFBTUMsZUFBZUMsTUFBTSwrcEJBaUJwQ0gsaUNBQ0UsT0FBT0MsTUFBTUMsZUFBZUMsTUFBTSw2UkFhcENILHlCQUNFLE9BQU9DLE1BQU1DLGVBQWVDLE1BQU0sK2tDQW1CcENILGlDQUNFLE9BQU9DLE1BQU1DLGVBQWVDLE1BQU0sOG1CQWdCcENILGVBQ0VKLElBQUlRLEtBQUtQLElBQUssa0JBT2QsT0FMZSxxQkFBc0IsaUJBQWtCLGVBQWdCLG9CQUNyRSx3QkFBeUIsd0JBQ3pCLHNCQUF1QixzQkFBdUIsaUJBQWtCLGlCQUNoRSxhQUFjLG1CQUFvQiwyQkFBNEIsMkJBRW5EYSxPQUFPLENBQUNDLEVBQUtDLElBQ2pCRCxFQUFJRSxLQUFLLFFBRWJDLE1BQU1DLElBQ1BuQixJQUFJUSxLQUFLUCxJQUFLa0IsS0FDYkMsUUFBUSxJQUdGZixNQUFNQyxlQUFlQyxtQkFBbUJTLE1BQVNFLE1BQU0sU0FJL0RwQixRQUFRdUIsV0FHYmpCLGdCQUNFLE1BQU1rQixHQUNKQyxLQUFLQyx5QkFDTEQsS0FBS0UscUJBQ0xGLEtBQUtHLG1CQUNMSCxLQUFLSSx3QkFDTEosS0FBS0ssNEJBQ0xMLEtBQUtNLDRCQUNMTixLQUFLTywwQkFDTFAsS0FBS1EsMEJBQ0xSLEtBQUtTLHFCQUNMVCxLQUFLVSxxQkFDTFYsS0FBS1csZ0JBQ0xYLEtBQUtZLHVCQUNMWixLQUFLYSwrQkFDTGIsS0FBS2MsZ0NBRVAsT0FBT2QsS0FBS2UsZUFBZXJCLEtBQUtzQixHQUN2QmpCLEVBQVNSLE9BQU8sQ0FBQ0MsRUFBS3lCLElBQ3BCekIsRUFBSUUsS0FBSyxJQUNQdUIsS0FFUjFDLFFBQVF1QixhQUtqQm9CLFFBQUFoQyxRQUFlLElBQUlQIiwiZmlsZSI6InNlcnZpY2VzL3NxbC12aWV3LXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDUlVEU2VydmljZSB9IGZyb20gJy4vY3J1ZC1zZXJ2aWNlJ1xuaW1wb3J0IHsgTW9kZWwsIEluc3RhbmNlIH0gZnJvbSAnc2VxdWVsaXplJ1xuaW1wb3J0ICogYXMgUHJvbWlzZSBmcm9tICdibHVlYmlyZCdcblxuaW1wb3J0IEFwcENvbmZpZyBmcm9tICcuLi9hcHAtY29uZmlnJ1xuXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ1NRTFZpZXdTZXJ2aWNlJ1xuLypcbiAgVGhpcyBpcyB1c2VkIGJ5IFNob3BNYW5hZ2VtZW50IGluIHRoZSBDTVMuXG4gIFdlIGhhdmUgTG9jYWxTaG9wU2VydmljZSwgdGhpcyBpcyBzcGVjaWZpY2FsbHkgZm9yIHNob3Atc3BlY2lmaWMgY29kZS5cbiovXG5jbGFzcyBTUUxWaWV3U2VydmljZSBleHRlbmRzIENSVURTZXJ2aWNlIHtcbiAgY3JlYXRlU3VwcGxpZXJTdG9ja3NWaWV3ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuICAgICAgQ1JFQVRFIFZJRVcgc3VwcGxpZXJTdG9ja3NWaWV3IEFTXG4gICAgICAoU0VMRUNUIHN1cHBsaWVyU3RvY2tzLmlkIGlkLCBwcm9kdWN0cy5uYW1lIEFTIHByb2R1Y3ROYW1lLCB2YXJpYW50cy5uYW1lIEFTIHZhcmlhbnROYW1lLFxuICAgICAgICAgICAgICBzdXBwbGllclN0b2Nrcy5wcmljZSBBUyBzdXBwbGllclByaWNlLCBzdXBwbGllclN0b2Nrcy5jcmVhdGVkQXQgQVMgY3JlYXRlZEF0LFxuICAgICAgICAgICAgICBzdXBwbGllclN0b2Nrcy51cGRhdGVkQXQgQVMgdXBkYXRlZEF0XG4gICAgICAgIEZST00gc3VwcGxpZXJTdG9ja3NcbiAgICAgICAgSU5ORVIgSk9JTiB2YXJpYW50cyBPTiB2YXJpYW50cy5pZCA9IHN1cHBsaWVyU3RvY2tzLnZhcmlhbnRJZCBBTkQgdmFyaWFudHMuZGVsZXRlZEF0IElTIE5VTExcbiAgICAgICAgSU5ORVIgSk9JTiBwcm9kdWN0cyBPTiBwcm9kdWN0cy5pZCA9IHZhcmlhbnRzLnByb2R1Y3RJZCBBTkQgcHJvZHVjdHMuZGVsZXRlZEF0IElTIE5VTExcbiAgICAgICAgV0hFUkUgc3VwcGxpZXJTdG9ja3MuZGVsZXRlZEF0IElTIE5VTExcbiAgICAgIClcbiAgICBgKVxuICB9XG5cbiAgLy8gVGhpcyBpcyBzaG9wU3RvY2tzIGFnZ3JlZ2F0ZWQgYnkgYWlzbGUgc3VidHJhY3RlZCBieSB0aGUgbnVtYmVyIG9mIG9yZGVyXG4gIGNyZWF0ZVNob3BTdG9ja3NWaWV3ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuQ1JFQVRFIFZJRVcgc2hvcFN0b2Nrc1ZpZXcgQVNcbihTRUxFQ1Qgc2hvcFN0b2Nrc1ZpZXcuc2hvcElkLCBzaG9wU3RvY2tzVmlldy52YXJpYW50SWQsXG4gICAgICAgIHNob3BTdG9ja3NWaWV3LmFpc2xlLCBzaG9wU3RvY2tzVmlldy5xdWFudGl0eSAtIElGTlVMTChvcmRlckRldGFpbHNWaWV3LnF1YW50aXR5LCAwKSBBUyBxdWFudGl0eVxuICBGUk9NIChcbiAgU0VMRUNUIHNob3BTdG9ja3Muc2hvcElkIEFTIHNob3BJZCwgc2hvcFN0b2Nrcy52YXJpYW50SWQgQVMgdmFyaWFudElkLFxuICAgICAgU1VNKHNob3BTdG9ja3MucXVhbnRpdHkpIEFTIHF1YW50aXR5LCBzaG9wU3RvY2tzLmFpc2xlIEFTIGFpc2xlXG4gIEZST00gc2hvcFN0b2Nrc1xuICBXSEVSRSBkZWxldGVkQXQgSVMgTlVMTFxuICBHUk9VUCBCWSBzaG9wU3RvY2tzLnNob3BJZCwgc2hvcFN0b2Nrcy52YXJpYW50SWQsIHNob3BTdG9ja3MuYWlzbGVcbiAgKSBBUyBzaG9wU3RvY2tzVmlld1xuTEVGVCBPVVRFUiBKT0lOXG4gIChTRUxFQ1Qgb3JkZXJzLnNob3BJZCBBUyBzaG9wSWQsIG9yZGVyRGV0YWlscy52YXJpYW50SWQgQVMgdmFyaWFudElkLFxuICAgICAgU1VNKG9yZGVyRGV0YWlscy5xdWFudGl0eSkgQVMgcXVhbnRpdHksIG9yZGVyRGV0YWlscy5haXNsZSBBUyBhaXNsZVxuICAgIEZST00gb3JkZXJEZXRhaWxzXG4gICAgSU5ORVIgSk9JTiBvcmRlcnMgT04gb3JkZXJzLmlkID0gb3JkZXJEZXRhaWxzLm9yZGVySWRcbiAgICBXSEVSRSBvcmRlcnMuc3RhdHVzICE9ICdDYW5jZWxsZWQnIEFORCBvcmRlckRldGFpbHMuc3RhdHVzID0gJ1JlYWR5JyBBTkQgb3JkZXJEZXRhaWxzLmRlbGV0ZWRBdCBJUyBOVUxMIEFORCBvcmRlcnMuZGVsZXRlZEF0IElTIE5VTExcbiAgICBHUk9VUCBCWSBvcmRlcnMuc2hvcElkLCBvcmRlckRldGFpbHMudmFyaWFudElkLCBvcmRlckRldGFpbHMuYWlzbGVcbiAgKSBBUyBvcmRlckRldGFpbHNWaWV3IE9OIG9yZGVyRGV0YWlsc1ZpZXcuc2hvcElkID0gc2hvcFN0b2Nrc1ZpZXcuc2hvcElkIEFORFxuICAgICAgIG9yZGVyRGV0YWlsc1ZpZXcudmFyaWFudElkID0gc2hvcFN0b2Nrc1ZpZXcudmFyaWFudElkIEFORCBvcmRlckRldGFpbHNWaWV3LmFpc2xlID0gc2hvcFN0b2Nrc1ZpZXcuYWlzbGVcbilcbiAgICBgKVxuICB9XG5cbiAgY3JlYXRlUE9PcmRlcnNWaWV3ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuQ1JFQVRFIFZJRVcgcG9PcmRlcnNWaWV3IEFTXG4oU0VMRUNUIG9yZGVycy5zaG9wSWQgQVMgc2hvcElkLFxuICAgICAgICBTVU0oSUYob3JkZXJEZXRhaWxzLnN0YXR1cyA9ICdQTycsIG9yZGVyRGV0YWlscy5xdWFudGl0eSwgMCkpIEFTIHF1YW50aXR5LFxuICAgICAgICB2YXJpYW50cy5wcm9kdWN0SWQsIHZhcmlhbnRzLmlkIGFzIHZhcmlhbnRJZFxuRlJPTSBvcmRlcnNcbkxFRlQgT1VURVIgSk9JTiBvcmRlckRldGFpbHMgT04gb3JkZXJEZXRhaWxzLm9yZGVySWQgPSBvcmRlcnMuaWQgQU5EIG9yZGVyRGV0YWlscy5kZWxldGVkQXQgSVMgTlVMTFxuTEVGVCBPVVRFUiBKT0lOIHZhcmlhbnRzIE9OIHZhcmlhbnRzLmlkID0gb3JkZXJEZXRhaWxzLnZhcmlhbnRJZCBBTkQgdmFyaWFudHMuZGVsZXRlZEF0IElTIE5VTExcbldIRVJFIG9yZGVycy5zdGF0dXMgIT0gJ0NhbmNlbGxlZCcgQU5EIG9yZGVycy5kZWxldGVkQXQgSVMgTlVMTFxuR1JPVVAgQlkgb3JkZXJzLnNob3BJZCwgdmFyaWFudHMucHJvZHVjdElkLCB2YXJpYW50cy5pZClcbmApXG4gIH1cbiAgLy8gR2V0IHF1YW50aXR5IG9mIG9yZGVycyB0aGF0IGFyZSBpblN0b2NrIChpLmUuIG5vdCBQTylcbiAgLy8gVGhpcyBpcyB1c2VkIHRvIGNvbXB1dGUgdGhlIG51bWJlciBvZiByZW1haW5pbmcgc3RvY2tzXG4gIC8vIChpLmUuIHN0b2NrcyBsZWZ0IGZvciB2YXJpYW50IFggPSBhbGwgc2hvcCBzdG9ja3MgLSBhbGwgaW4tc3RvY2sgb3JkZXJzKVxuICBjcmVhdGVJblN0b2NrT3JkZXJzVmlldyAoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFNlcXVlbGl6ZSgpLnF1ZXJ5KGBcbkNSRUFURSBWSUVXIGluU3RvY2tPcmRlcnNWaWV3IEFTXG4oU0VMRUNUIG9yZGVycy5zaG9wSWQgQVMgc2hvcElkLFxuICAgICAgICAjIE9ubHkgdGhlIHF1YW50aXR5IG9mICdSZWFkeSctc3RvY2sgaXRlbSBpcyBjb25zaWRlcmVkIHdoZW4gY2FsY3VsYXRpbmcgc3RvY2tRdWFudGl0eVxuICAgICAgICBTVU0oSUYob3JkZXJEZXRhaWxzLnN0YXR1cyA9ICdSZWFkeScsIG9yZGVyRGV0YWlscy5xdWFudGl0eSwgMCkpIEFTIHF1YW50aXR5LFxuICAgICAgICB2YXJpYW50cy5wcm9kdWN0SWQsIHZhcmlhbnRzLmlkIGFzIHZhcmlhbnRJZFxuRlJPTSBvcmRlcnNcbkxFRlQgT1VURVIgSk9JTiBvcmRlckRldGFpbHMgT04gb3JkZXJEZXRhaWxzLm9yZGVySWQgPSBvcmRlcnMuaWQgQU5EIG9yZGVyRGV0YWlscy5kZWxldGVkQXQgSVMgTlVMTFxuTEVGVCBPVVRFUiBKT0lOIHZhcmlhbnRzIE9OIHZhcmlhbnRzLmlkID0gb3JkZXJEZXRhaWxzLnZhcmlhbnRJZCBBTkQgdmFyaWFudHMuZGVsZXRlZEF0IElTIE5VTExcbldIRVJFIG9yZGVycy5zdGF0dXMgIT0gJ0NhbmNlbGxlZCcgQU5EIG9yZGVycy5kZWxldGVkQXQgSVMgTlVMTFxuR1JPVVAgQlkgb3JkZXJzLnNob3BJZCwgdmFyaWFudHMucHJvZHVjdElkLCB2YXJpYW50cy5pZClcbmApXG4gIH1cbiAgLypcbiAgICBUaGlzIHZpZXcgY29tYmluZXM6XG4gICAgMS4gUHJvZHVjdCAtPiBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBhdmFpbGFibGUgcHJvZHVjdHNcbiAgICAyLiBTaG9wUHJvZHVjdCAtPiBzaG9wLXNwZWNpZmljIGluZm9ybWF0aW9uLCB1c2VkIGZvciBwZXItc2hvcCBwcm9kdWN0IHBlcnNvbmFsaXR6YXRpb25cbiAgICAzLiBTaG9wU3RvY2sgLT4gZmlndXJlIG91dCBob3cgbWFueSBwaHlzaWNhbCBzdG9ja3MgYXZhaWxhYmxlXG4gICAgNC4gT3JkZXJEZXRhaWwgLT4gZmlndXJlIG91dCBob3cgbWFueSBvZiB0aGUgcGh5c2ljYWwgc3RvY2tzIGhhdmUgYmVlbiB1c2VkIHVwXG4gICAgNS4gU3VwcGxpZXJTdG9jayAtPiBmaWd1cmUgb3V0IGhvdyBtYW55IHN1cHBsaWVycyBhdmFpbGFibGVcblxuICAgIFRPRE86XG4gICAgMS4gVGhpcyBzaG91bGQgZGVwZW5kIG9uIHNob3BpZmllZFZhcmlhbnRzVmlldywgc28gdGhhdCB3ZSBkb24ndCBjb21wdXRlIHN0b2NrcyBmcm9tIHR3byBkaWZmZXJlbnQgcGxhY2VzXG4gICovXG5cbiAgY3JlYXRlU2hvcGlmaWVkUHJvZHVjdHNWaWV3ICgpIHtcbiAgICBsb2cuaW5mbyhUQUcsICdjcmVhdGVTaG9waWZpZWRQcm9kdWN0c1ZpZXcoKScpXG4gICAgcmV0dXJuIHN1cGVyLmdldFNlcXVlbGl6ZSgpLnF1ZXJ5KGBcbkNSRUFURSBWSUVXIHNob3BpZmllZFByb2R1Y3RzVmlldyBBU1xuKFNFTEVDVCBwcm9kdWN0cy5pZCwgcHJvZHVjdHMubmFtZSBhcyBuYW1lLCBwcm9kdWN0cy5kZXNjcmlwdGlvbiBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgcHJvZHVjdHMud2FycmFudHkgYXMgd2FycmFudHksIHByb2R1Y3RzLnByaWNlIGFzIGRlZmF1bHRQcmljZSxcbiAgICAgICAgc3ViQ2F0ZWdvcmllcy5pZCBhcyBzdWJDYXRlZ29yeUlkLFxuICAgICAgICBzdWJDYXRlZ29yaWVzLm5hbWUgQVMgc3ViQ2F0ZWdvcnlOYW1lLFxuICAgICAgICBjYXRlZ29yaWVzLmlkIEFTIGNhdGVnb3J5SWQsXG4gICAgICAgIGNhdGVnb3JpZXMubmFtZSBBUyBjYXRlZ29yeU5hbWUsXG4gICAgICAgIHNob3BzLmlkIGFzIHNob3BJZCxcbiAgICAgICAgSUZOVUxMKHN0b2NrVGFibGUuc3RvY2tRdWFudGl0eSwgMCkgYXMgc3RvY2tRdWFudGl0eSxcbiAgICAgICAgSUZOVUxMKHN0b2NrVGFibGUuYWxsVGltZVN0b2NrcywgMCkgYXMgYWxsVGltZVN0b2NrcyxcbiAgICAgICAgSUZOVUxMKHN0b2NrVGFibGUuYWxsVGltZU9yZGVycywgMCkgYXMgYWxsVGltZU9yZGVycyxcbiAgICAgICAgSUZOVUxMKHN0b2NrVGFibGUuYWxsVGltZVBPT3JkZXJzLCAwKSBhcyBhbGxUaW1lUE9PcmRlcnMsXG4gICAgICAgIElGTlVMTChzdXBwbGllclRhYmxlLnN1cHBsaWVyQ291bnQsIDApIGFzIHN1cHBsaWVyQ291bnQsXG4gICAgICAgIElGTlVMTChzaG9wUHJvZHVjdHMuY3JlYXRlZEF0LCBwcm9kdWN0cy5jcmVhdGVkQXQpIGFzIGNyZWF0ZWRBdCxcbiAgICAgICAgSUZOVUxMKHNob3BQcm9kdWN0cy51cGRhdGVkQXQsIHByb2R1Y3RzLnVwZGF0ZWRBdCkgYXMgdXBkYXRlZEF0LFxuICAgICAgICBJRk5VTEwoc2hvcFByb2R1Y3RzLnByaWNlLCBwcm9kdWN0cy5wcmljZSkgYXMgc2hvcFByaWNlLFxuICAgICAgICBJRk5VTEwoc2hvcFByb2R1Y3RzLnByZU9yZGVyQWxsb3dlZCwke0FwcENvbmZpZy5ERUZBVUxUX1NIT1BfUFJPRFVDVF9CRUhBVklPUi5wcmVPcmRlckFsbG93ZWQgPyAnVFJVRScgOiAnRkFMU0UnfSkgYXMgcHJlT3JkZXJBbGxvd2VkLFxuICAgICAgICBJRk5VTEwoc2hvcFByb2R1Y3RzLnByZU9yZGVyRHVyYXRpb24sICR7QXBwQ29uZmlnLkRFRkFVTFRfU0hPUF9QUk9EVUNUX0JFSEFWSU9SLnByZU9yZGVyRHVyYXRpb259KSBhcyBwcmVPcmRlckR1cmF0aW9uLFxuICAgICAgICBJRk5VTEwoc2hvcFByb2R1Y3RzLmRpc2FibGVkLCAke0FwcENvbmZpZy5ERUZBVUxUX1NIT1BfUFJPRFVDVF9CRUhBVklPUi5kaXNhYmxlZH0pIGFzIGRpc2FibGVkXG5GUk9NIChTRUxFQ1QgKiBGUk9NIHByb2R1Y3RzIFdIRVJFIGRlbGV0ZWRBdCBJUyBOVUxMKSBBUyBwcm9kdWN0c1xuXG5DUk9TUyBKT0lOIHNob3BzXG5cbklOTkVSIEpPSU4gc3ViQ2F0ZWdvcmllcyBPTiBzdWJDYXRlZ29yaWVzLmlkID0gcHJvZHVjdHMuc3ViQ2F0ZWdvcnlJZCBBTkQgc3ViQ2F0ZWdvcmllcy5kZWxldGVkQXQgSVMgTlVMTFxuSU5ORVIgSk9JTiBjYXRlZ29yaWVzIE9OIGNhdGVnb3JpZXMuaWQgPSBzdWJDYXRlZ29yaWVzLmNhdGVnb3J5SWQgQU5EIGNhdGVnb3JpZXMuZGVsZXRlZEF0IElTIE5VTExcblxuTEVGVCBPVVRFUiBKT0lOXG4gIChTRUxFQ1QgU1VNKHN0b2NrUXVhbnRpdHkpIEFTIHN0b2NrUXVhbnRpdHksIFNVTShhbGxUaW1lU3RvY2tzKSBBUyBhbGxUaW1lU3RvY2tzLFxuICAgICAgICAgIFNVTShhbGxUaW1lT3JkZXJzKSBBUyBhbGxUaW1lT3JkZXJzLCBTVU0oYWxsVGltZVBPT3JkZXJzKSBBUyBhbGxUaW1lUE9PcmRlcnMsXG4gICAgICAgICAgcHJvZHVjdElkLCBzaG9wSWRcbiAgIEZST00gc2hvcGlmaWVkVmFyaWFudHNWaWV3XG4gICBHUk9VUCBCWSBwcm9kdWN0SWQsIHNob3BJZFxuICApIEFTIHN0b2NrVGFibGVcbk9OIHN0b2NrVGFibGUucHJvZHVjdElkID0gcHJvZHVjdHMuaWQgQU5EIHN0b2NrVGFibGUuc2hvcElkID0gc2hvcHMuaWRcblxuTEVGVCBPVVRFUiBKT0lOXG4gIChTRUxFQ1QgdmFyaWFudHMucHJvZHVjdElkIEFTIHByb2R1Y3RJZCwgQ09VTlQoKikgQVMgc3VwcGxpZXJDb3VudCBGUk9NIHZhcmlhbnRzXG4gICBJTk5FUiBKT0lOIHN1cHBsaWVyU3RvY2tzIE9OIHZhcmlhbnRzLmlkID0gc3VwcGxpZXJTdG9ja3MudmFyaWFudElkXG4gICBXSEVSRSBzdXBwbGllclN0b2Nrcy5kZWxldGVkQXQgSVMgTlVMTCBBTkQgdmFyaWFudHMuZGVsZXRlZEF0IElTIE5VTExcbiAgIEdST1VQIEJZIHZhcmlhbnRzLnByb2R1Y3RJZCkgYXMgc3VwcGxpZXJUYWJsZVxuT04gcHJvZHVjdHMuaWQgPSBzdXBwbGllclRhYmxlLnByb2R1Y3RJZFxuXG5MRUZUIE9VVEVSIEpPSU4gc2hvcFByb2R1Y3RzIE9OIHByb2R1Y3RzLmlkID0gc2hvcFByb2R1Y3RzLnByb2R1Y3RJZCBBTkQgc2hvcFByb2R1Y3RzLmRlbGV0ZWRBdCBJUyBOVUxMKVxuICAgIGApXG4gIH1cblxuICAvLyBUT0RPOiBTb3VuZHMgbGlrZSBzdXBwbGllclN0b2Nrc1RhYmxlIGlzIG1pc3Rha2VuPyBTaG91bGQgZG91YmxlIGNoZWNrIGl0XG4gIGNyZWF0ZVNob3BpZmllZFZhcmlhbnRzVmlldyAoKSB7XG4gICAgbG9nLmluZm8oVEFHLCAnY3JlYXRlU2hvcGlmaWVkVmFyaWFudHNWaWV3KCknKVxuICAgIHJldHVybiBzdXBlci5nZXRTZXF1ZWxpemUoKS5xdWVyeShgXG5DUkVBVEUgVklFVyBzaG9waWZpZWRWYXJpYW50c1ZpZXcgQVNcbihTRUxFQ1QgdmFyaWFudHMuaWQgYXMgaWQsIHZhcmlhbnRzLnByb2R1Y3RJZCBhcyBwcm9kdWN0SWQsIHZhcmlhbnRzLm5hbWUgYXMgbmFtZSxcbiAgICAgICAgdmFyaWFudHMuY3JlYXRlZEF0IGFzIGNyZWF0ZWRBdCwgdmFyaWFudHMudXBkYXRlZEF0IGFzIHVwZGF0ZWRBdCxcbiAgICAgICAgc2hvcHMuaWQgYXMgc2hvcElkLFxuICAgICAgICBJRk5VTEwoc2hvcFN0b2Nrc1RhYmxlLnN0b2NrUXVhbnRpdHksIDApIC0gSUZOVUxMKGluU3RvY2tPcmRlcnNWaWV3LnF1YW50aXR5LCAwKSBhcyBzdG9ja1F1YW50aXR5LFxuICAgICAgICBJRk5VTEwoc2hvcFN0b2Nrc1RhYmxlLnN0b2NrUXVhbnRpdHksIDApIEFTIGFsbFRpbWVTdG9ja3MsXG4gICAgICAgIElGTlVMTChpblN0b2NrT3JkZXJzVmlldy5xdWFudGl0eSwgMCkgYXMgYWxsVGltZU9yZGVycyxcbiAgICAgICAgSUZOVUxMKHBvT3JkZXJzVmlldy5xdWFudGl0eSwgMCkgYXMgYWxsVGltZVBPT3JkZXJzLFxuICAgICAgICBJRk5VTEwoc3VwcGxpZXJTdG9ja3NUYWJsZS5zdXBwbGllckNvdW50LCAwKSBhcyBzdXBwbGllckNvdW50XG5GUk9NIChTRUxFQ1QgKiBGUk9NIHZhcmlhbnRzIFdIRVJFIHZhcmlhbnRzLmRlbGV0ZWRBdCBJUyBOVUxMKSBBUyB2YXJpYW50c1xuXG5DUk9TUyBKT0lOIHNob3BzXG5cbkxFRlQgT1VURVIgSk9JTlxuICAoU0VMRUNUIHNob3BTdG9ja3MudmFyaWFudElkIGFzIHZhcmlhbnRJZCwgc2hvcFN0b2Nrcy5zaG9wSWQgYXMgc2hvcElkLCBTVU0oc2hvcFN0b2Nrcy5xdWFudGl0eSkgYXMgc3RvY2tRdWFudGl0eVxuICAgIEZST00gc2hvcFN0b2Nrc1xuICAgIFdIRVJFIHNob3BTdG9ja3MuZGVsZXRlZEF0IElTIE5VTExcbiAgICBHUk9VUCBCWSBzaG9wU3RvY2tzLnZhcmlhbnRJZCwgc2hvcFN0b2Nrcy5zaG9wSWQpIGFzIHNob3BTdG9ja3NUYWJsZVxuT04gdmFyaWFudHMuaWQgPSBzaG9wU3RvY2tzVGFibGUudmFyaWFudElkIEFORCBzaG9wcy5pZCA9IHNob3BTdG9ja3NUYWJsZS5zaG9wSWRcblxuTEVGVCBPVVRFUiBKT0lOXG4gIChTRUxFQ1QgaW5TdG9ja09yZGVyc1ZpZXcuc2hvcElkIEFTIHNob3BJZCwgU1VNKGluU3RvY2tPcmRlcnNWaWV3LnF1YW50aXR5KSBBUyBxdWFudGl0eSwgaW5TdG9ja09yZGVyc1ZpZXcudmFyaWFudElkIEFTIHZhcmlhbnRJZFxuICAgIEZST00gaW5TdG9ja09yZGVyc1ZpZXdcbiAgICBHUk9VUCBCWSBpblN0b2NrT3JkZXJzVmlldy5zaG9wSWQsIGluU3RvY2tPcmRlcnNWaWV3LnZhcmlhbnRJZFxuICApIEFTIGluU3RvY2tPcmRlcnNWaWV3IE9OIGluU3RvY2tPcmRlcnNWaWV3LnNob3BJZCA9IHNob3BzLmlkIEFORCBpblN0b2NrT3JkZXJzVmlldy52YXJpYW50SWQgPSB2YXJpYW50cy5pZFxuXG5MRUZUIE9VVEVSIEpPSU5cbiAgKFNFTEVDVCBwb09yZGVyc1ZpZXcuc2hvcElkIEFTIHNob3BJZCwgU1VNKHBvT3JkZXJzVmlldy5xdWFudGl0eSkgQVMgcXVhbnRpdHksIHBvT3JkZXJzVmlldy52YXJpYW50SWQgQVMgdmFyaWFudElkXG4gICAgRlJPTSBwb09yZGVyc1ZpZXdcbiAgICBHUk9VUCBCWSBwb09yZGVyc1ZpZXcuc2hvcElkLCBwb09yZGVyc1ZpZXcudmFyaWFudElkXG4gICkgQVMgcG9PcmRlcnNWaWV3IE9OIHBvT3JkZXJzVmlldy5zaG9wSWQgPSBzaG9wcy5pZCBBTkQgcG9PcmRlcnNWaWV3LnZhcmlhbnRJZCA9IHZhcmlhbnRzLmlkXG5cbkxFRlQgT1VURVIgSk9JTlxuICAoU0VMRUNUIHN1cHBsaWVyU3RvY2tzLnZhcmlhbnRJZCBhcyB2YXJpYW50SWQsIENPVU5UKCopIGFzIHN1cHBsaWVyQ291bnRcbiAgIEZST00gc3VwcGxpZXJTdG9ja3NcbiAgIFdIRVJFIHN1cHBsaWVyU3RvY2tzLmRlbGV0ZWRBdCBJUyBOVUxMXG4gICBHUk9VUCBCWSBzdXBwbGllclN0b2Nrcy52YXJpYW50SWQpIGFzIHN1cHBsaWVyU3RvY2tzVGFibGVcbk9OIHZhcmlhbnRzLmlkID0gc3VwcGxpZXJTdG9ja3NUYWJsZS52YXJpYW50SWRcbik7XG4gICAgYClcbiAgfVxuXG4gIGNyZWF0ZUluU3RvY2tQcm9kdWN0c1ZpZXcgKCkge1xuICAgIGxvZy5pbmZvKFRBRywgJ2NyZWF0ZUluU3RvY2tQcm9kdWN0c1ZpZXcoKScpXG4gICAgcmV0dXJuIHN1cGVyLmdldFNlcXVlbGl6ZSgpLnF1ZXJ5KGBcbkNSRUFURSBWSUVXIGluU3RvY2tQcm9kdWN0c1ZpZXcgQVNcbihTRUxFQ1Qgc3BWaWV3LmlkIGFzIGlkLFxuICAgICAgICBzcFZpZXcuc3ViQ2F0ZWdvcnlJZCBhcyBzdWJDYXRlZ29yeUlkLCBzcFZpZXcuc3ViQ2F0ZWdvcnlOYW1lIGFzIHN1YkNhdGVnb3J5TmFtZSxcbiAgICAgICAgc3BWaWV3LmNhdGVnb3J5SWQgYXMgY2F0ZWdvcnlJZCwgc3BWaWV3LmNhdGVnb3J5TmFtZSBhcyBjYXRlZ29yeU5hbWUsXG4gICAgICAgIHNwVmlldy5zaG9wSWQgYXMgc2hvcElkLFxuICAgICAgICBzcFZpZXcubmFtZSBhcyBuYW1lLCBzcFZpZXcuZGVzY3JpcHRpb24gYXMgZGVzY3JpcHRpb24sIHNwVmlldy5jcmVhdGVkQXQgYXMgY3JlYXRlZEF0LFxuICAgICAgICBzcFZpZXcudXBkYXRlZEF0IGFzIHVwZGF0ZWRBdCwgc3BWaWV3LndhcnJhbnR5IGFzIHdhcnJhbnR5LFxuICAgICAgICBJRk5VTEwoc3BWaWV3LnNob3BQcmljZSwgc3BWaWV3LmRlZmF1bHRQcmljZSkgYXMgcHJpY2UsIHNwVmlldy5zdG9ja1F1YW50aXR5IGFzIHN0b2NrUXVhbnRpdHlcbiAgRlJPTSBzaG9waWZpZWRQcm9kdWN0c1ZpZXcgYXMgc3BWaWV3IFdIRVJFIGRpc2FibGVkID0gRkFMU0UgYW5kIHN0b2NrUXVhbnRpdHkgPiAwXG4pO2ApXG4gIH1cblxuICBjcmVhdGVJblN0b2NrVmFyaWFudHNWaWV3ICgpIHtcbiAgICBsb2cuaW5mbyhUQUcsICdjcmVhdGVJblN0b2NrVmFyaWFudHNWaWV3KCknKVxuICAgIHJldHVybiBzdXBlci5nZXRTZXF1ZWxpemUoKS5xdWVyeShgXG5DUkVBVEUgVklFVyBpblN0b2NrVmFyaWFudHNWaWV3IEFTXG4oXG5TRUxFQ1Qgc3ZWaWV3LmlkIGFzIGlkLCBzdlZpZXcuc2hvcElkIGFzIHNob3BJZCwgc3ZWaWV3LnByb2R1Y3RJZCBhcyBwcm9kdWN0SWQsXG4gICAgICAgc3ZWaWV3Lm5hbWUgYXMgbmFtZSwgc3ZWaWV3LnN0b2NrUXVhbnRpdHkgYXMgc3RvY2tRdWFudGl0eSwgc3ZWaWV3LmNyZWF0ZWRBdCBhcyBjcmVhdGVkQXQsIHN2Vmlldy51cGRhdGVkQXQgYXMgdXBkYXRlZEF0XG5GUk9NIHNob3BpZmllZFZhcmlhbnRzVmlldyBhcyBzdlZpZXcgV0hFUkUgc3RvY2tRdWFudGl0eSA+IDBcbik7XG5gKVxuICB9XG5cbiAgY3JlYXRlUE9Qcm9kdWN0c1ZpZXcgKCkge1xuICAgIGxvZy5pbmZvKFRBRywgJ2NyZWF0ZVBPUHJvZHVjdHNWaWV3KCknKVxuICAgIHJldHVybiBzdXBlci5nZXRTZXF1ZWxpemUoKS5xdWVyeShgXG5DUkVBVEUgVklFVyBwb1Byb2R1Y3RzVmlldyBBU1xuKFxuU0VMRUNUIHNwVmlldy5pZCBhcyBpZCwgc3BWaWV3LnNob3BJZCBhcyBzaG9wSWQsIHNwVmlldy5uYW1lIGFzIG5hbWUsXG4gICAgICAgc3BWaWV3LnN1YkNhdGVnb3J5SWQgYXMgc3ViQ2F0ZWdvcnlJZCwgc3BWaWV3LnN1YkNhdGVnb3J5TmFtZSBhcyBzdWJDYXRlZ29yeU5hbWUsXG4gICAgICAgc3BWaWV3LmNhdGVnb3J5SWQgYXMgY2F0ZWdvcnlJZCwgc3BWaWV3LmNhdGVnb3J5TmFtZSBhcyBjYXRlZ29yeU5hbWUsXG4gICAgICAgc3BWaWV3LmRlc2NyaXB0aW9uIGFzIGRlc2NyaXB0aW9uLCBzcFZpZXcuY3JlYXRlZEF0IGFzIGNyZWF0ZWRBdCwgc3BWaWV3LnVwZGF0ZWRBdCBhcyB1cGRhdGVkQXQsXG4gICAgICAgc3BWaWV3LndhcnJhbnR5IGFzIHdhcnJhbnR5LCBJRk5VTEwoc3BWaWV3LnNob3BQcmljZSwgc3BWaWV3LmRlZmF1bHRQcmljZSkgYXMgcHJpY2UsIHNwVmlldy5wcmVPcmRlckR1cmF0aW9uIGFzIHByZU9yZGVyRHVyYXRpXFxcbm9uXG5GUk9NIHNob3BpZmllZFByb2R1Y3RzVmlldyBhcyBzcFZpZXcgV0hFUkUgZGlzYWJsZWQgPSBGQUxTRSBBTkQgcHJlT3JkZXJBbGxvd2VkID0gVFJVRSBBTkQgc3VwcGxpZXJDb3VudCA+IDAgQU5EIHN0b2NrUXVhbnRpdHkgPSAwXG4pO1xuYClcbiAgfVxuXG4gIGNyZWF0ZVBPVmFyaWFudHNWaWV3ICgpIHtcbiAgICBsb2cuaW5mbyhUQUcsICdjcmVhdGVQT1ZhcmlhbnRzVmlldygpJylcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuQ1JFQVRFIFZJRVcgcG9WYXJpYW50c1ZpZXcgQVNcbihcblNFTEVDVCBzdlZpZXcuaWQgYXMgaWQsIHN2Vmlldy5zaG9wSWQgYXMgc2hvcElkLCBzdlZpZXcucHJvZHVjdElkIGFzIHByb2R1Y3RJZCwgc3ZWaWV3LmNyZWF0ZWRBdCBhcyBjcmVhdGVkQXQsIHN2Vmlldy51cGRhdGVkQXQgYXMgdXBkYXRlZEF0LFxuICAgICAgICBzdlZpZXcubmFtZSBhcyBuYW1lLCBzdlZpZXcuc3VwcGxpZXJDb3VudCBhcyBzdXBwbGllckNvdW50XG5GUk9NIHNob3BpZmllZFZhcmlhbnRzVmlldyBhcyBzdlZpZXcgV0hFUkUgc3VwcGxpZXJDb3VudCA+IDBcbik7YClcbiAgfVxuXG4gIGNyZWF0ZU9yZGVyVmlldyAoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldFNlcXVlbGl6ZSgpLnF1ZXJ5KGBcbkNSRUFURSBWSUVXIG9yZGVyc1ZpZXcgQVNcbihcblNFTEVDVCBvcmRlcnMuaWQgYXMgaWQsIG9yZGVycy5mdWxsTmFtZSBhcyBmdWxsTmFtZSwgb3JkZXJzLnBob25lTnVtYmVyIGFzIHBob25lTnVtYmVyLFxuICAgICAgIG9yZGVycy5ub3RlcyBhcyBub3Rlcywgb3JkZXJzLnN0YXR1cyBhcyBzdGF0dXMsIG9yZGVycy5jcmVhdGVkQXQgYXMgY3JlYXRlZEF0LFxuICAgICAgIG9yZGVycy51cGRhdGVkQXQgYXMgdXBkYXRlZEF0LCBTVU0ob3JkZXJEZXRhaWxzLnF1YW50aXR5KSBhcyBxdWFudGl0eSxcbiAgICAgICBTVU0ob3JkZXJEZXRhaWxzLnByaWNlICogb3JkZXJEZXRhaWxzLnF1YW50aXR5KSBhcyBwcmljZSwgb3JkZXJzLnNob3BJZCBhcyBzaG9wSWRcbkZST00gKFNFTEVDVCAqIEZST00gb3JkZXJzIFdIRVJFIG9yZGVycy5kZWxldGVkQXQgSVMgTlVMTCkgQVMgb3JkZXJzXG5MRUZUIE9VVEVSIEpPSU4gb3JkZXJEZXRhaWxzIG9uIG9yZGVyRGV0YWlscy5vcmRlcklkID0gb3JkZXJzLmlkIEFORCBvcmRlckRldGFpbHMuZGVsZXRlZEF0IElTIE5VTExcbkxFRlQgT1VURVIgSk9JTiB2YXJpYW50cyBPTiB2YXJpYW50cy5pZCA9IG9yZGVyRGV0YWlscy52YXJpYW50SWQgQU5EIHZhcmlhbnRzLmRlbGV0ZWRBdCBJUyBOVUxMXG5HUk9VUCBCWSBvcmRlcnMuaWRcbik7YClcbiAgfVxuXG4gIC8vIFRoaXMgaXMgb3JkZXIgZGV0YWlscyBwcmVwYXJlZCBmb3IgY3VzdG9tZXJzXG4gIC8vIEZvciBleGFtcGxlLCBjdXN0b21lciBkb2Vzbid0IG5lZWQgdG8ga25vdyBhYm91dCBhaXNsZSBpbmZvcm1hdGlvbiwgaW5zdGVhZFxuICAvLyB3ZSBncm91cCB0aGVtIHRvZ2V0aGVyLlxuICBjcmVhdGVDdXN0b21lck9yZGVyRGV0YWlsc1ZpZXcgKCkge1xuICAgIHJldHVybiBzdXBlci5nZXRTZXF1ZWxpemUoKS5xdWVyeShgXG5DUkVBVEUgVklFVyBjdXN0b21lck9yZGVyRGV0YWlsc1ZpZXcgQVNcbihcblNFTEVDVCBvcmRlcklkLCBTVU0ocXVhbnRpdHkpIEFTIHF1YW50aXR5LCBwcmljZSwgc3RhdHVzLFxuICAgICAgIHZhcmlhbnROYW1lLCBwcm9kdWN0TmFtZSwgcHJlT3JkZXJEdXJhdGlvblxuRlJPTSBvcmRlckRldGFpbHNWaWV3XG5HUk9VUCBCWSBvcmRlcklkLCBwcm9kdWN0SWQsIHZhcmlhbnRJZCwgcHJpY2UsIHN0YXR1cywgdmFyaWFudE5hbWUsIHByb2R1Y3ROYW1lLCBwcmVPcmRlckR1cmF0aW9uXG4pXG5gKVxuICB9XG5cbiAgLy8gVGhlIHJhdyBvcmRlciBkZXRhaWxzLCBidXQgYXBwZW5kZWQgd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIG1ha2UgaXRcbiAgLy8gbW9yZSB1bmRlcnN0YW5kYWJsZVxuICBjcmVhdGVPcmRlckRldGFpbHNWaWV3ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuQ1JFQVRFIFZJRVcgb3JkZXJEZXRhaWxzVmlldyBBU1xuKFxuU0VMRUNUIG9yZGVyRGV0YWlscy5pZCBBUyBpZCwgb3JkZXJEZXRhaWxzLm9yZGVySWQgQVMgb3JkZXJJZCwgb3JkZXJEZXRhaWxzLnF1YW50aXR5IEFTIHF1YW50aXR5LFxuICAgICAgIG9yZGVyRGV0YWlscy5wcmljZSBBUyBwcmljZSwgb3JkZXJEZXRhaWxzLnN0YXR1cyBBUyBzdGF0dXMsXG4gICAgICAgb3JkZXJEZXRhaWxzLmFpc2xlIEFTIGFpc2xlLFxuICAgICAgIG9yZGVyRGV0YWlscy5jcmVhdGVkQXQgQVMgY3JlYXRlZEF0LCBvcmRlckRldGFpbHMudXBkYXRlZEF0IEFTIHVwZGF0ZWRBdCxcbiAgICAgICB2YXJpYW50cy5uYW1lIEFTIHZhcmlhbnROYW1lLCB2YXJpYW50cy5pZCBBUyB2YXJpYW50SWQsXG4gICAgICAgcHJvZHVjdHMubmFtZSBBUyBwcm9kdWN0TmFtZSwgcHJvZHVjdHMuaWQgQVMgcHJvZHVjdElkLFxuICAgICAgIHNob3BpZmllZFByb2R1Y3RzVmlldy5wcmVPcmRlckR1cmF0aW9uIEFTIHByZU9yZGVyRHVyYXRpb25cbkZST00gKFNFTEVDVCAqIEZST00gb3JkZXJEZXRhaWxzIFdIRVJFIG9yZGVyRGV0YWlscy5kZWxldGVkQXQgSVMgTlVMTCkgQVMgb3JkZXJEZXRhaWxzXG5JTk5FUiBKT0lOIHZhcmlhbnRzIE9OIG9yZGVyRGV0YWlscy52YXJpYW50SWQgPSB2YXJpYW50cy5pZCBBTkQgdmFyaWFudHMuZGVsZXRlZEF0IElTIE5VTExcbklOTkVSIEpPSU4gcHJvZHVjdHMgT04gdmFyaWFudHMucHJvZHVjdElkID0gcHJvZHVjdHMuaWQgQU5EIHByb2R1Y3RzLmRlbGV0ZWRBdCBJUyBOVUxMXG4jIEFsdGhvdWdoIG9yZGVycyBpcyBub3QgdXNlZCwgaXQncyBuZWVkZWQgc28gd2UgZG9uJ3QgY291bnQgb3JkZXJzIHRoYXQgYXJlIGFscmVhZHkgZGVsZXRlZFxuSU5ORVIgSk9JTiBvcmRlcnMgT04gb3JkZXJzLmlkID0gb3JkZXJEZXRhaWxzLm9yZGVySWQgQU5EIG9yZGVycy5kZWxldGVkQXQgSVMgTlVMTFxuSU5ORVIgSk9JTiBzaG9waWZpZWRQcm9kdWN0c1ZpZXcgb24gdmFyaWFudHMucHJvZHVjdElkID0gc2hvcGlmaWVkUHJvZHVjdHNWaWV3LmlkIEFORCBzaG9waWZpZWRQcm9kdWN0c1ZpZXcuc2hvcElkID0gb3JkZXJzLnNob3BJZFxuKTtgKVxuICB9XG5cbiAgY3JlYXRlU2hvcGlmaWVkUHJvbW90aW9uc1ZpZXdzICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYFxuQ1JFQVRFIFZJRVcgc2hvcGlmaWVkUHJvbW90aW9uc1ZpZXcgQVNcbihcblNFTEVDVCBwcm9tb3Rpb25zLmlkIEFTIGlkLCBwcm9tb3Rpb25zLmNyZWF0ZWRBdCBBUyBjcmVhdGVkQXQsXG4gICAgICAgcHJvbW90aW9ucy51cGRhdGVkQXQgQVMgdXBkYXRlZEF0LCBwcm9tb3Rpb25zLnNob3BJZCBBUyBzaG9wSWQsXG4gICAgICAgcHJvbW90aW9ucy5uYW1lIEFTIG5hbWUsXG4gICAgICAgcHJvbW90aW9ucy5wcm9kdWN0SWQgQVMgcHJvZHVjdElkLCBwcm9tb3Rpb25zLmltYWdlRmlsZW5hbWUgQVMgaW1hZ2VGaWxlbmFtZSxcbiAgICAgICBzaG9waWZpZWRQcm9kdWN0c1ZpZXcubmFtZSBBUyBwcm9kdWN0TmFtZSxcbiAgICAgICBzaG9waWZpZWRQcm9kdWN0c1ZpZXcuc2hvcFByaWNlIEFTIHByb2R1Y3RQcmljZVxuRlJPTSAoU0VMRUNUICogRlJPTSBwcm9tb3Rpb25zIFdIRVJFIGRlbGV0ZWRBVCBJUyBOVUxMKSBBUyBwcm9tb3Rpb25zXG5JTk5FUiBKT0lOIHNob3BpZmllZFByb2R1Y3RzVmlldyBPTiBwcm9tb3Rpb25zLnByb2R1Y3RJZCA9IHNob3BpZmllZFByb2R1Y3RzVmlldy5pZCBBTkQgcHJvbW90aW9ucy5zaG9wSWQgPSBzaG9waWZpZWRQcm9kdWN0c1ZpZXcuc2hvcElkXG4pO2ApXG4gIH1cblxuICAvLyBUT0RPOiBPcmRlciBvZiBkZWxldGlvbiBzaG91bGRuJ3QgbmVlZCB0byBiZSBoYXJkLWNvZGVkIGxpa2UgdGhpcy5cbiAgLy8gICAgICAgdGhleSBzaG91bGQgYmUgaW5mZXJyZWQgZnJvbSBwb3B1bGF0ZVZpZXdzXG4gIGRlc3Ryb3lWaWV3cyAoKSB7XG4gICAgbG9nLmluZm8oVEFHLCAnZGVzdHJveVZpZXdzKCknKVxuXG4gICAgY29uc3Qgdmlld3MgPSBbJ3N1cHBsaWVyU3RvY2tzVmlldycsICdzaG9wU3RvY2tzVmlldycsICdwb09yZGVyc1ZpZXcnLCAnaW5TdG9ja09yZGVyc1ZpZXcnLFxuICAgICAgJ3Nob3BpZmllZFByb2R1Y3RzVmlldycsICdzaG9waWZpZWRWYXJpYW50c1ZpZXcnLFxuICAgICAgJ2luU3RvY2tQcm9kdWN0c1ZpZXcnLCAnaW5TdG9ja1ZhcmlhbnRzVmlldycsICdwb1Byb2R1Y3RzVmlldycsICdwb1ZhcmlhbnRzVmlldycsXG4gICAgICAnb3JkZXJzVmlldycsICdvcmRlckRldGFpbHNWaWV3JywgJ2N1c3RvbWVyT3JkZXJEZXRhaWxzVmlldycsICdzaG9waWZpZWRQcm9tb3Rpb25zVmlldyddXG5cbiAgICByZXR1cm4gdmlld3MucmVkdWNlKChhY2MsIHZpZXcpID0+IHtcbiAgICAgIHJldHVybiBhY2MudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVyblxuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgbG9nLmluZm8oVEFHLCBlcnIpXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgLy8gRXZlbiBpZiB0aGVyZSdzIGFuIGVycm9yIChpLmUuIHRoZSB2aWV3IHRvIGJlIGRyb3BwZWQgZG9lc24ndCBleGlzdCwgd2Ugd2FudFxuICAgICAgICAvLyB0byBjb250aW51ZVxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0U2VxdWVsaXplKCkucXVlcnkoYERST1AgVklFVyAke3ZpZXd9O2ApLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSwgUHJvbWlzZS5yZXNvbHZlKCkpXG4gIH1cblxuICBwb3B1bGF0ZVZpZXdzICgpIHtcbiAgICBjb25zdCBwcm9taXNlczogQXJyYXk8KCkgPT4gUHJvbWlzZTxhbnk+PiA9IFtcbiAgICAgIHRoaXMuY3JlYXRlU3VwcGxpZXJTdG9ja3NWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVTaG9wU3RvY2tzVmlldyxcbiAgICAgIHRoaXMuY3JlYXRlUE9PcmRlcnNWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVJblN0b2NrT3JkZXJzVmlldyxcbiAgICAgIHRoaXMuY3JlYXRlU2hvcGlmaWVkVmFyaWFudHNWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVTaG9waWZpZWRQcm9kdWN0c1ZpZXcsXG4gICAgICB0aGlzLmNyZWF0ZUluU3RvY2tQcm9kdWN0c1ZpZXcsXG4gICAgICB0aGlzLmNyZWF0ZUluU3RvY2tWYXJpYW50c1ZpZXcsXG4gICAgICB0aGlzLmNyZWF0ZVBPUHJvZHVjdHNWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVQT1ZhcmlhbnRzVmlldyxcbiAgICAgIHRoaXMuY3JlYXRlT3JkZXJWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVPcmRlckRldGFpbHNWaWV3LFxuICAgICAgdGhpcy5jcmVhdGVDdXN0b21lck9yZGVyRGV0YWlsc1ZpZXcsXG4gICAgICB0aGlzLmNyZWF0ZVNob3BpZmllZFByb21vdGlvbnNWaWV3c1xuICAgIF1cbiAgICByZXR1cm4gdGhpcy5kZXN0cm95Vmlld3MoKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVkdWNlKChhY2MsIHByb21pc2UpID0+IHtcbiAgICAgICAgcmV0dXJuIGFjYy50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcHJvbWlzZSgpXG4gICAgICAgIH0pXG4gICAgICB9LCBQcm9taXNlLnJlc29sdmUoKSlcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBTUUxWaWV3U2VydmljZSgpXG4iXX0=
