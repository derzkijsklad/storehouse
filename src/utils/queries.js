export const ORDER_QUERIES = {
    GET_ORDERS: 'SELECT * FROM orders_data WHERE 1=1',
    CHECK_OPEN_ORDER: `
        SELECT * FROM orders_data 
        WHERE spot_id = $1 
        AND is_closed = false`,
    CREATE_ORDER: `
        INSERT INTO orders_data (spot_id, value, timestamp, is_closed)
        VALUES ($1, $2,NOW(), $3)
        RETURNING  *`,
    CHECK_ORDER_STATUS: 'SELECT order_status FROM orders WHERE id = $1',
    CLOSE_ORDER: `
        UPDATE orders_data
        SET is_closed = true
        WHERE id = $1 AND is_closed = false
        RETURNING *`
};
export const PRODUCT_DATA_QUERIES = {
    GET_ALL_CONTAINERS: 'SELECT * FROM container_data',
    GET_CONTAINER_BY_ID: 'SELECT * FROM container_data WHERE id = $1',
};
export const ERROR_QUERIES = {
    GET_ALL_ERRORS: 'SELECT * FROM errors ORDER BY created_at DESC'
  };
