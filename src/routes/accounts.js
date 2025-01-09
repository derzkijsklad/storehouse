import express from 'express';
import { accountsService } from '../config/service.js';
import expressAsyncHandler from 'express-async-handler';
export const accounts_route = express.Router();

accounts_route.post('/login', expressAsyncHandler(async (req, res) => {
    const result = await accountsService.login(req.body);
    res.status(200).json(result);
}))
