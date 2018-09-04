SELECT * FROM
(
SELECT spView.id as id, spView.shopId as shopId, spView.name as name, spView.description as description,
       spView.warranty as warranty, IFNULL(spView.shopPrice, spView.defaultPrice) as price, spView.preOrderDuration as preOrderDuration
FROM shopifiedProductsView as spView WHERE disabled = FALSE AND preOrderAllowed = TRUE AND supplierCount > 0
) as t

\G
