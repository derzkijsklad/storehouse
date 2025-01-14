import express from 'express'
import expressAsyncHandler from 'express-async-handler';
import { getErrorsService } from '../config/service.js';



export const errorsRoutes = express.Router();

errorsRoutes.get('/errors',expressAsyncHandler(async (req, res) => {
    const errors = await getErrorsService.getAllErrors();
    res.status(200).json(errors);
}));