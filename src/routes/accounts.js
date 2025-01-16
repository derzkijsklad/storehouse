import express from 'express';
import { accountsService } from '../config/service.js';
import expressAsyncHandler from 'express-async-handler';
import { authenticateRequest } from '../middlewares/authenticateMiddleware.js';
export const accounts_route = express.Router();

accounts_route.post('/login', expressAsyncHandler(async (req, res) => {
  const result = await accountsService.login(req.body);
  res.status(200).json(result);
}))
accounts_route.put('/password', expressAsyncHandler(async (req, res) => {
  const result = await accountsService.updatePassword(req.body);
  res.status(200).json(result);
}));
accounts_route.patch('/email', expressAsyncHandler(async (req, res) => {
  const result = await accountsService.changeEmail(req.body);
  res.status(200).json(result);
})
);
accounts_route.post('/manageUser', expressAsyncHandler(async (req, res) => {
  authenticateRequest(req);
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    throw getError(400, "Missing required fields: username, email, password, role");
  }

  await accountsService.addUser({ username, email, password, role });
  res.status(204).send(); 
}));

accounts_route.put('/manageUser', expressAsyncHandler(async (req, res) => {
  authenticateRequest(req);

  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
      throw getError(400, "Missing required fields: username, email, password, role");
  }

  await accountsService.updateUser({ username, email, password, role });
  res.status(204).send();
}));

accounts_route.delete('/manageUser', expressAsyncHandler(async (req, res) => {
  authenticateRequest(req);

  const { username } = req.body;
  if (!username) {
      throw getError(400, "Missing required field: username");
  }

  await accountsService.deleteUser(username);
  res.status(204).send();
}));