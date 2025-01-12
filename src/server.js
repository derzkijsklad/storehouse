import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./errors/errors.js";
import { accounts_route } from "./routes/accounts.js";
import { container_routes } from "./routes/containerRoutes.js";
import cors from 'cors';
import corsMiddleware from "./middlewares/corsMiddleware.js";


dotenv.config();
const app = express();
const port = process.env.PORT|| 5000;
const server = app.listen(port);
server.on("listening", () => console.log(`listening on port ${server.address().port}`));
app.use(express.json());
app.use(corsMiddleware);
app.options('*', corsMiddleware);\

app.use('/api/auth', accounts_route);
app.use('/api', container_routes);


app.use(errorHandler)
