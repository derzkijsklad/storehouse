import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./errors/errors.js";
import { accounts_route } from "./routes/accounts.js";
import { container_routes } from "./routes/containerRoutes.js";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import { valid, validateBody } from "./middlewares/validationMiddleware.js";
import schemas from "./utils/schemas.js";
import { orders_routes } from "./routes/ordersRoutes.js";
import { errorsRoutes } from "./routes/errorsRoutes.js";
import { auth, authenticate } from "./middlewares/authenticateMiddleware.js";
import logger from "./utils/logger.js";
import { ROUTES, skipRoutes } from "./config/paths.js";
import config from "config";



dotenv.config();
const app = express();
const port = process.env.PORT|| 5000;
const server = app.listen(port);
logger.info(`Server starting up on port ${port}`);
server.on("listening", () => console.log(`listening on port ${server.address().port}`));

if (config.get("useCors")) {
    app.use(corsMiddleware);
    app.options('*', corsMiddleware);
}

app.use(express.json());
app.use(authenticate);
app.use(auth(skipRoutes));
app.use(validateBody(schemas));
app.use(valid);


app.use(ROUTES.AUTH, accounts_route);
app.use(ROUTES.ORDERS, orders_routes);
app.use(ROUTES.CONTAINERS, container_routes);
app.use(ROUTES.ERRORS, errorsRoutes);


app.use(errorHandler)
