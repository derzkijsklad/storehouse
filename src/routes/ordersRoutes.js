import express from 'express'
import asyncHandler from 'express-async-handler'
import { ordersService } from '../config/service.js';
import { validateParams } from '../middlewares/validationMiddleware.js';
import {schemaParams} from '../utils/schemas.js'
import { HTTP_STATUS, sendResponse } from '../utils/constants.js';

export const orders_routes = express.Router();

const getOrders = asyncHandler(async(req,res)=>{
    const orders = await ordersService.getOrders(req.body);
    sendResponse(res,HTTP_STATUS.OK,orders)

})
const createOrder = asyncHandler(async(req,res)=>{
    const order = await ordersService.createOrder(req.body);
    sendResponse(res,HTTP_STATUS.CREATED,order)

})
const closeOrder = asyncHandler(async(req,res)=>{
    const order = await ordersService.closeOrder(req.query);
    sendResponse(res,HTTP_STATUS.OK,order)
})
orders_routes
.get("/", getOrders)
.post("/", createOrder)
.put("/",validateParams(schemaParams) ,closeOrder);