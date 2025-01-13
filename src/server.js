import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./errors/errors.js";
import { accounts_route } from "./routes/accounts.js";
import { container_routes } from "./routes/containerRoutes.js";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import { valid, validateBody } from "./middlewares/validationMiddleware.js";
import schemas from "./utils/schemas.js";
import { orders_routes } from "./routes/ordersRoutes.js";


dotenv.config();
const app = express();
const port = process.env.PORT|| 5000;
const server = app.listen(port);
server.on("listening", () => console.log(`listening on port ${server.address().port}`));
app.use(express.json());
app.use(validateBody(schemas));
app.use(valid);
app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use('/api/auth', accounts_route);
app.use('/api', orders_routes);
app.use('/api', container_routes);


app.use(errorHandler)
