import express from 'express';
import asyncHandler from 'express-async-handler';
import { routerService } from '../config/service.js';



export const orders_routes = express.Router();

orders_routes.get('/orders',
  asyncHandler(async (req, res) => {
    const orders = await routerService.getOrders(req.body);
    res.status(200).json(orders);
  })
);
