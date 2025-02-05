import { MongoClient } from "mongodb";
import zlib from "zlib";
import { promisify } from "util";
import { Buffer } from "buffer";

const gunzipAsync = promisify(zlib.gunzip);
const { MONGO_URI, DB_NAME, COLLECTION_NAME } = process.env;

export const lambdaHandler = async (event) => {
    try {
        const decompressed = await gunzipAsync(Buffer.from(event.awslogs.data, "base64"));
        const logs = JSON.parse(decompressed.toString("utf8")).logEvents || [];
        const errorLogs = logs.filter(log => log.message.includes("[error]"));
        const client = new MongoClient(MONGO_URI);
        await client.db(DB_NAME).collection(COLLECTION_NAME).insertMany(errorLogs);
        console.log("Logs saved to MongoDB");
        await client.close();
    } catch (error) {
        console.error("Error:", error);
    }
};
