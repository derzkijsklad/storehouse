import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';


export default class OrdersService {
    #db;

    constructor(connectionString) {
        this.#db = new PostgresConnection(connectionString);
    }
    async getOrders({ order_status, container_id, product_name }) {
        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        if (order_status) {
            query += ` AND order_status =  $${paramIndex++}`;
            params.push(order_status);
        }

        if (container_id) {
            query += ` AND container_id =  $${paramIndex++}`;
            params.push(container_id);
        }

        if (product_name) {
            query += ` AND product_name =  $${paramIndex++}`;
            params.push(product_name);
        }
        const result = await this.#db.query(query, params);
        if (result.rows.length === 0) {
            throw getError(404, 'No orders found');
        }
        return result.rows;

    }

}