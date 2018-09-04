SELECT * FROM

(
SELECT variants.id as id, variants.productId as productId,
       shopStocks.shopId as shopId, SUM(shopStocks.quantity) as stockQuantity,
       COUNT(supplierStocks.id) as supplierCount

FROM variants

LEFT OUTER JOIN shopStocks ON variants.id = shopStocks.variantId

LEFT OUTER JOIN supplierStocks ON variants.id = supplierStocks.variantId

GROUP BY shopStocks.shopId, variants.id

) as t WHERE shopId = 3

\G
