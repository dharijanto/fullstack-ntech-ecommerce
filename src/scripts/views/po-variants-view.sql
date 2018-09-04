SELECT * FROM
(
SELECT svView.id as id, svView.shopId as shopId, svView.productId as productId,
       svView.name as name, svView.supplierCount as supplierCount
FROM shopifiedVariantsView as svView WHERE supplierCount > 0
) as t

;
