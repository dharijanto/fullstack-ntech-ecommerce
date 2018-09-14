SELECT * FROM
(
SELECT orderDetails.id as id, orderDetails.quantity as quantity,
       orderDetails.price as price, orderDetails.status as status,
       orderDetails.createdAt as createdAt, orderDetails.updatedAt as updatedAt
       shopProducts.preOrderDuration as preOrderDuration
FROM orderDetails
INNER JOIN variants on orderDetails.variantId = variants.id
INNER JOIN shopProducts on variants.productId = shopProducts.productId
WHERE orderDetails.deletedAt != NULL
) as t;
