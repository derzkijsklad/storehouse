import express from 'express';
import { containersService } from '../config/service.js';
import asyncHandler from 'express-async-handler';


 export const container_routes = express.Router();


 container_routes.get('/containers', asyncHandler( async (req, res, next) => {
      const { id } = req.query;
      let containers;
      if (id) {
        containers = await containersService.getContainerById(id);
      } else {
        containers = await containersService.getAllContainers();
      }
      res.status(200).json(containers);
  }));