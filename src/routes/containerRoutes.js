import express from 'express';
import { containersService } from '../config/service.js';
import asyncHandler from 'express-async-handler';
import { validateParams } from '../middlewares/validationMiddleware.js';
import { schemaParams } from '../utils/schemas.js';


 export const container_routes = express.Router();


 container_routes.get('/containers', validateParams(schemaParams), asyncHandler( async (req, res, next) => {
      const { id } = req.query;
      let containers;
      if (id) {
        containers = await containersService.getContainerById(id);
      } else {
        containers = await containersService.getAllContainers();
      }
      res.status(200).json(containers);
  }));