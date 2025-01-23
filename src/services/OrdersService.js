import { containersService } from '../config/service.js';
import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';
import { isValidDate } from '../utils/dateUtils.js';
import { ORDER_QUERIES } from '../utils/queries.js';


export default class OrdersService {
    #db;

    constructor(connectionString) {
        this.#db = new PostgresConnection(connectionString);
    }

    async getOrders({ id, is_closed, date }) {
        let query = ORDER_QUERIES.GET_ORDERS;
        const params = [];
        let paramIndex = 1;
    
        if (id) {
            query += ` AND id = $${paramIndex++}`;
            params.push(id);
        }
    
        if (typeof is_closed !== 'undefined') {
            query += ` AND is_closed = $${paramIndex++}`;
            params.push(is_closed === 'true');
        }
    
        if (date) {
            if (!isValidDate(date)) {
                throw getError(400, `Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
            }
            query += ` AND DATE(timestamp) = $${paramIndex++}`;
            params.push(date);
        }
    
        const result = await this.#db.query(query, params);
    
        if (result.rows.length === 0) {
            throw getError(404, 'No orders found');
        }
    
        return result.rows;
    }
    

    async checkExistingOpenOrder(spot_id) {
        const result = await this.#db.query(ORDER_QUERIES.CHECK_OPEN_ORDER, [spot_id]);
        if (result.rows.length > 0) {
            throw getError(400, `An open order for spot_id ${spot_id} already exists`);
        }
    }

    async createOrder({ spot_id, value }) {
        await this.checkExistingOpenOrder(spot_id);
        const params = [spot_id, value,  false];
        const result = await this.#db.query(ORDER_QUERIES.CREATE_ORDER, params);
        return result.rows[0];
    }

    async closeOrder({ id }) {
        const result = await this.#db.query(ORDER_QUERIES.CLOSE_ORDER, [id]);
        if (result.rows.length === 0) {
            throw getError(404, 'Order not found or already closed');
        }
        return result.rows[0];
    }
}
