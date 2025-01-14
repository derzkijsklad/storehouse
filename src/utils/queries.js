export const ORDER_QUERIES = {
    GET_ORDERS: 'SELECT * FROM orders WHERE 1=1',
    CHECK_OPEN_ORDER: `
        SELECT * FROM orders 
        WHERE container_id = $1 
        AND product_name = $2 
        AND order_status = 'open'`,
    CREATE_ORDER: `
        INSERT INTO orders (container_id, product_name, quantity, order_status, created_at)
        VALUES ($1, $2, $3, 'open', NOW())
        RETURNING *`,
    CHECK_ORDER_STATUS: 'SELECT order_status FROM orders WHERE id = $1',
    CLOSE_ORDER: `
        UPDATE orders
        SET order_status = 'closed', closed_at = NOW()
        WHERE id = $1 AND order_status = 'open'
        RETURNING *`
};
export const PRODUCT_DATA_QUERIES = {
    GET_ALL_CONTAINERS: 'SELECT * FROM container_data',
    GET_CONTAINER_BY_ID: 'SELECT * FROM container_data WHERE id = $1',
};
export const ERROR_QUERIES = {
    GET_ALL_ERRORS: 'SELECT * FROM errors ORDER BY created_at DESC'
  };
