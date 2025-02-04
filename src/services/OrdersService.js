
import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';
import { isValidDate } from '../utils/constants.js';
import logger from '../utils/logger.js';
import { ORDER_QUERIES } from '../utils/queries.js';


export default class OrdersService {
    #db;

    constructor(connectionString) {
        logger.info('Initializing OrdersService');
        this.#db = new PostgresConnection(connectionString);
        logger.debug('PostgreSQL connection established');
    }

    async getOrders({ id, is_closed, date }) {
        logger.info(`Fetching orders with filters - id: ${id}, is_closed: ${is_closed}, date: ${date}`);
        let query = ORDER_QUERIES.GET_ORDERS;
        const params = [];
        let paramIndex = 1;
    
        if (id) {
            logger.debug(`Adding id filter: ${id}`);
            query += ` AND id = $${paramIndex++}`;
            params.push(id);
        }
    
        if (typeof is_closed !== 'undefined') {
            logger.debug(`Adding is_closed filter: ${is_closed}`);
            query += ` AND is_closed = $${paramIndex++}`;
            params.push(is_closed === 'true');
        }
    
        if (date) {
            logger.debug(`Validating date parameter: ${date}`);
            if (!isValidDate(date)) {
                logger.warn(`Invalid date format received: ${date}`);
                throw getError(400, `Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
            }
            query += ` AND DATE(timestamp) = $${paramIndex++}`;
            params.push(date);
        }
    
        logger.debug(`Executing query with parameters: ${JSON.stringify(params)}`);
        const result = await this.#db.query(query, params);
    
        if (result.rows.length === 0) {
            logger.warn('No orders found matching the criteria');
            throw getError(404, 'No orders found');
        }
    
        logger.info(`Successfully retrieved ${result.rows.length} orders`);
        return result.rows;
    }
    
    async checkExistingOpenOrder(spot_id) {
        logger.debug(`Checking for existing open order at spot_id: ${spot_id}`);
        const result = await this.#db.query(ORDER_QUERIES.CHECK_OPEN_ORDER, [spot_id]);
        if (result.rows.length > 0) {
            logger.warn(`Found existing open order for spot_id: ${spot_id}`);
            throw getError(400, `An open order for spot_id ${spot_id} already exists`);
        }
        logger.debug(`No existing open order found for spot_id: ${spot_id}`);
    }

    async createOrder({ spot_id, value }) {
        logger.info(`Attempting to create new order - spot_id: ${spot_id}, value: ${value}`);
        await this.checkExistingOpenOrder(spot_id);
        
        const params = [spot_id, value, false];
        logger.debug(`Creating order with parameters: ${JSON.stringify(params)}`);
        
        const result = await this.#db.query(ORDER_QUERIES.CREATE_ORDER, params);
        logger.info(`Successfully created order for spot_id: ${spot_id}`);
        return result.rows[0];
    }

    async closeOrder({ id }) {
        logger.info(`Attempting to close order with id: ${id}`);
        const result = await this.#db.query(ORDER_QUERIES.CLOSE_ORDER, [id]);
        
        if (result.rows.length === 0) {
            logger.warn(`Failed to close order - order ${id} not found or already closed`);
            throw getError(404, 'Order not found or already closed');
        }
        
        logger.info(`Successfully closed order with id: ${id}`);
        return result.rows[0];
    }
}
