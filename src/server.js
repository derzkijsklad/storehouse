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

const skipRoutes = [
    { path: "/api/auth/login", method: "POST"},
    { path: "/api/auth/manageUser", method: "POST"},
    { path: "/api/auth/manageUser", method: "PUT"},
    { path: "/api/auth/manageUser", method: "DELETE"}
];


dotenv.config();
const app = express();
const port = process.env.PORT|| 5000;
const server = app.listen(port);
server.on("listening", () => console.log(`listening on port ${server.address().port}`));
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(express.json());
app.use(authenticate);
app.use(auth(skipRoutes));
app.use(validateBody(schemas));
app.use(valid);


app.use('/api/auth', accounts_route);
app.use('/api', orders_routes);
app.use('/api', container_routes);
app.use('/api', errorsRoutes);


app.use(errorHandler)
