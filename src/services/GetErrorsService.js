
import PostgresConnection from '../databases/postgres/PostgresConnection.js';
import { ERROR_QUERIES } from '../utils/queries.js';

export default class GetErrorsService {
  #db;

  constructor(connectionString) {
    this.#db = new PostgresConnection(connectionString);
  }

  async getAllErrors() {
    const query = ERROR_QUERIES.GET_ALL_ERRORS;
    const result = await this.#db.query(query);
    return result.rows;
  }
}
