import AccountsService from "../services/AccountsService.js";
import dotenv from "dotenv";
import ContainerDataService from "../services/ContainerDataService.js";
dotenv.config()
import config from 'config'

export const accountsService = new AccountsService(process.env.MONGO_URI, config.get('ACCOUNT_DB'));

export const containersService = new ContainerDataService(process.env.POSTGRES_URI);