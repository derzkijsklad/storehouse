import pkg from "pg";
import logger from "../../utils/logger.js";
const { Pool } = pkg;

export default class PostgresConnection {
  #pool;

  constructor(connectionString) {
    this.#pool = new Pool({ connectionString,connectionTimeoutMillis: 5000,
      ssl: {
      rejectUnauthorized: false, 
    },
   });
  }

  async query(text, params) {
    const client = await this.#pool.connect();
    logger.debug('Client acquired from pool');
    try {
      const result = await client.query(text, params);
      logger.debug('Query executed successfully');
      return result;
    }finally {
      client.release();
      logger.debug('Client released back to pool');
    }
  }

  async closeConnection() {
    await this.#pool.end();
    logger.info('Connection pool closed successfully');
  }
}
