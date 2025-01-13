import express from 'express';
import asyncHandler from 'express-async-handler';
import { routeService } from '../config/service.js';
import { validateParams } from '../middlewares/validationMiddleware.js';
import { schemaParams } from '../utils/schemas.js';



export const orders_routes = express.Router();

orders_routes.get('/orders',
    asyncHandler(async (req, res) => {
        const orders = await routeService.getOrders(req.body);
        res.status(200).json(orders);
    })
);
orders_routes.post('/orders',
    asyncHandler(async (req, res) => {
        const order = await routeService.createOrder(req.body);
        res.status(200).json(order);
    })
);
orders_routes.put('/orders',validateParams(schemaParams),
    asyncHandler(async (req, res) => {
        const order = await routeService.closeOrder(req.query);
        res.status(200).json(order);
    })
);
