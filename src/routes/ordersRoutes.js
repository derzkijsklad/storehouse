import express from 'express';
import asyncHandler from 'express-async-handler';

import { validateParams } from '../middlewares/validationMiddleware.js';
import { schemaParams } from '../utils/schemas.js';
import { ordersService } from '../config/service.js';




export const orders_routes = express.Router();

orders_routes.get('/orders',
    asyncHandler(async (req, res) => {
        const orders = await ordersService.getOrders(req.body);
        res.status(200).json(orders);
    })
);
orders_routes.post('/orders',
    asyncHandler(async (req, res) => {
        const order = await ordersService.createOrder(req.body);
        res.status(200).json(order);
    })
);
orders_routes.put('/orders',validateParams(schemaParams),
    asyncHandler(async (req, res) => {
        const order = await ordersService.closeOrder(req.query);
        res.status(200).json(order);
    })
);
