SELECT * FROM
(
SELECT spView.id as id, spView.shopId as shopId, spView.name as name, spView.description as description,
       spView.warranty as warranty, spView.shopPrice as price, spView.stockQuantity as stockQuantity
FROM shopifiedProductsView as spView WHERE disabled = FALSE and stockQuantity > 0
) as t

;
