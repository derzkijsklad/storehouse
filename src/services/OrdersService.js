import { containersService } from '../config/service.js';
import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';
import { ORDER_QUERIES } from '../utils/queries.js';


export default class OrdersService {
    #db;

    constructor(connectionString) {
        this.#db = new PostgresConnection(connectionString);
    }

    async getOrders({ order_status, container_id, product_name }) {
        let query = ORDER_QUERIES.GET_ORDERS;
        const params = [];
        let paramIndex = 1;
        if (order_status) {
            query += ` AND order_status = $${paramIndex++}`;
            params.push(order_status);
        }
        if (container_id) {
            query += ` AND container_id = $${paramIndex++}`;
            params.push(container_id);
        }
        if (product_name) {
            query += ` AND product_name = $${paramIndex++}`;
            params.push(product_name);
        }
        const result = await this.#db.query(query, params);
        if (result.rows.length === 0) {
            throw getError(404, 'No orders found');
        }
        return result.rows;
    }

    async checkExistingOpenOrder(container_id, product_name) {
        const params = [container_id, product_name];
        const result = await this.#db.query(ORDER_QUERIES.CHECK_OPEN_ORDER, params);
        if (result.rows.length > 0) {
            throw getError( 400,`An open order for product ${product_name} in container ${container_id} already exists`
            );
        }
    }

    async createOrder({ container_id, product_name, quantity }) {
        if (!container_id) {
            throw getError(400, 'Missing required fields');
        }
        await containersService.getContainerById(container_id);
        await this.checkExistingOpenOrder(container_id, product_name);
        const params = [container_id, product_name, quantity];
        const result = await this.#db.query(ORDER_QUERIES.CREATE_ORDER, params);
        return result.rows[0];
    }

    async closeOrder({ id }) {
        if (!id) {
            throw getError(400, 'Missing order ID');
        }
        const checkResult = await this.#db.query(ORDER_QUERIES.CHECK_ORDER_STATUS, [id]);
        if (checkResult.rows.length === 0) {
            throw getError(404, 'Order not found');
        }
        if (checkResult.rows[0].order_status === 'closed') {
            throw getError(400, 'Order is already closed');
        }
        const result = await this.#db.query(ORDER_QUERIES.CLOSE_ORDER, [id]);
        return result.rows[0];
    }
}
