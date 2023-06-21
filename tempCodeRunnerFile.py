
                SELECT
  CASE
    WHEN strftime('%m', od.orderDate) = '01' THEN 'January'
    WHEN strftime('%m', od.orderDate) = '02' THEN 'February'
    WHEN strftime('%m', od.orderDate) = '03' THEN 'March'
    WHEN strftime('%m', od.orderDate) = '04' THEN 'April'
    WHEN strftime('%m', od.orderDate) = '05' THEN 'May'
    WHEN strftime('%m', od.orderDate) = '06' THEN 'June'
    WHEN strftime('%m', od.orderDate) = '07' THEN 'July'
    WHEN strftime('%m', od.orderDate) = '08' THEN 'August'
    WHEN strftime('%m', od.orderDate) = '09' THEN 'September'
    WHEN strftime('%m', od.orderDate) = '10' THEN 'October'
    WHEN strftime('%m', od.orderDate) = '11' THEN 'November'
    WHEN strftime('%m', od.orderDate) = '12' THEN 'December'
  END AS month,
  SUM(p.price) AS totalSales
FROM orders AS o
JOIN orderDetails AS od ON o.orderId = od.orderId
JOIN products AS p ON od.productId = p.productId
WHERE od.orderStatus = 'Order Placed'
  AND p.sellerId = ?
GROUP BY month
ORDER BY strftime('%m', od.orderDate);