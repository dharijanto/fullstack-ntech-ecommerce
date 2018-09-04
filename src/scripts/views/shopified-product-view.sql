SELECT * FROM

(
SELECT products.id, products.name as name, products.warranty as warranty, products.price as defaultPrice,
       stockTable.shopId as shopId, stockTable.stockQuantity as stockQuantity,
       supplierTable.supplierCount as supplierCount,
       shopProducts.price as shopPrice, shopProducts.preOrderAllowed as preOrderAllowed, shopProducts.preOrderDuration as preOrderDuration, shopProducts.disabled as disabled
FROM products

LEFT OUTER JOIN
     (SELECT shopStocks.shopId AS shopId, productid AS productId, SUM(shopStocks.quantity) stockQuantity
      FROM variants INNER JOIN shopStocks ON variants.id = shopStocks.variantId group by shopId, productId) AS stockTable
ON products.id = stockTable.productId

LEFT OUTER JOIN
     (SELECT variants.productId as productId, count(*) as supplierCount from variants INNER JOIN supplierStocks ON variants.id = supplierStocks.variantId group by variants.productId) as supplierTable
ON products.id = supplierTable.productId

LEFT OUTER JOIN shopProducts ON products.id = shopProducts.productId

) as t WHERE shopId = 3

\G
