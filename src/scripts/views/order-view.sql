SELECT * FROM
(
SELECT orders.id as id, orders.status as status,
       SUM(orderDetails.quantity) as quantity, SUM(orderDetails.price) as price
FROM orders
INNER JOIN orderDetails on  orderDetails.orderId = orders.id
GROUP BY orderDetails.orderId
) as t;
