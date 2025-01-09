import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./errors/errors";


dotenv.config();
const app = express();
const port = process.env.PORT|| 5000;
const server = app.listen(port);
server.on("listening", () => console.log(`listening on port ${server.address().port}`));
app.use(express.json());

app.use(errorHandler)
