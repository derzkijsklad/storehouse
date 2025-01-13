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

    async createOrder({ container_id, product_name, quantity }) {
        await this.validateContainerId(container_id);
        const query = `
          INSERT INTO orders (container_id, product_name, quantity, order_status, created_at)
          VALUES ($1, $2, $3, 'open', NOW())
          RETURNING *;
        `;
        const params = [container_id, product_name, quantity];
        const result = await this.#db.query(query, params);
        return result.rows[0];
    }
    async validateContainerId(container_id) {
        try {
            const query = `SELECT 1 FROM containers_data WHERE id = ${container_id}`;
            await this.#db.query(query);
        } catch (error) {
            throw getError(400, `Invalid container_id: ${container_id}`);
        }
    }
    async closeOrder({ id }) {
        if (!id) {
            throw getError(400, 'Missing order ID');
        }
            const checkQuery = 'SELECT order_status FROM orders WHERE id = $1';
            const checkResult = await this.#db.query(checkQuery, [id]);
            if (checkResult.rows.length === 0) {
                throw getError(404, 'Order not found');
            }
    
            if (checkResult.rows[0].order_status === 'closed') {
                throw getError(400, 'Order is already closed');
            }
            const query = `
              UPDATE orders
              SET order_status = 'closed', closed_at = NOW()
              WHERE id = $1 AND order_status = 'open'
              RETURNING *;
            `;
            
            const result = await this.#db.query(query,[ id]);
            return result.rows[0];
        
    }    
}