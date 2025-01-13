import AccountsService from "../services/AccountsService.js";
import dotenv from "dotenv";
import ContainerDataService from "../services/ContainerDataService.js";
import config from 'config'
import OrdersService from "../services/OrdersService.js";

dotenv.config()

export const accountsService = new AccountsService(process.env.MONGO_URI , config.get('ACCOUNT_DB'));

export const containersService = new ContainerDataService(process.env.POSTGRES_URI || config.get('POSTGRES_URI'));
export const routeService = new OrdersService(process.env.POSTGRES_URI || config.get('POSTGRES_URI'));