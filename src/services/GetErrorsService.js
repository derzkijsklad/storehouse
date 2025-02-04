import { MongoClient } from "mongodb";
import { formatMessage } from "../utils/constants.js";

export default class GetErrorsService {
    #client;
    #collection;

    constructor(connectionString, dbName, collectionName) {
        this.#client = new MongoClient(connectionString);
        this.#collection = this.#client.db(dbName).collection(collectionName);
    }

    async getAllErrors() {
        try {
            await this.#client.connect();
            const errors = await this.#collection
                .find({}, { projection: { _id: 0,id: 1, message: 1 } })
                .sort({ timestamp: -1 })
                .toArray();
             return errors.map(error => ({
              id: error.id,
              message: formatMessage(error.message)
          }));
        } catch (error) {
            console.error("Error fetching logs from MongoDB:", error);
            return [];
        } finally {
            await this.#client.close();
        }
    }
}
