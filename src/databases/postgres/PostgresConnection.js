import pkg from "pg";
const { Pool } = pkg;

export default class PostgresConnection {
  #pool;

  constructor(connectionString) {
    this.#pool = new Pool({ connectionString,connectionTimeoutMillis: 5000 });
  }

  async query(text, params) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    }finally {
      client.release();
    }
  }

  async closeConnection() {
    await this.#pool.end();
  }
}
