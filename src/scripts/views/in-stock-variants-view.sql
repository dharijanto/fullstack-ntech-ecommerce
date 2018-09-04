SELECT * FROM
(
SELECT svView.id as id, svView.shopId as shopId, svView.productId as productId,
       svView.name as name, svView.stockQuantity as stockQuantity
FROM shopifiedVariantsView as svView WHERE stockQuantity > 0
) as t

;
