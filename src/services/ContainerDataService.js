import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { getError } from '../errors/errors.js';

export default class ContainerDataService {
  #db;

  constructor(connectionString) {
    this.#db = new PostgresConnection(connectionString);
  }

  async getAllContainers() {
    const query = 'SELECT * FROM container_data';
    const result = await this.#db.query(query);
    return result.rows;
  }

  async getContainerById(id) {
    const query = 'SELECT * FROM container_data WHERE id = $1';
    const result = await this.#db.query(query, [id]);
    if (result.rows.length === 0) {
      throw getError(404,`Container with id ${id} not found`);
    }
    return result.rows[0];
  }
}
