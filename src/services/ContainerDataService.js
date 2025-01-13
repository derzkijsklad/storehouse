import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';
import { PRODUCT_DATA_QUERIES } from '../utils/queries.js';

export default class ContainerDataService {
  #db;

  constructor(connectionString) {
    this.#db = new PostgresConnection(connectionString);
  }

  async getAllContainers() {
    const query = PRODUCT_DATA_QUERIES.GET_ALL_CONTAINERS;
    const result = await this.#db.query(query);
    return result.rows;
  }

  async getContainerById(id) {
    const query = PRODUCT_DATA_QUERIES.GET_CONTAINER_BY_ID;
    const result = await this.#db.query(query, [id]);
    if (result.rows.length === 0) {
      throw getError(404,`Container with id ${id} not found`);
    }
    return result.rows[0];
  }
}
