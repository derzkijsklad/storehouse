import AccountsService from "../services/AccountsService.js";
import dotenv from "dotenv";
import ContainerDataService from "../services/ContainerDataService.js";
dotenv.config()

export const accountsService = new AccountsService(process.env.MONGO_URI, process.env.ACCOUNT_DB);

export const containersService = new ContainerDataService(process.env.POSTGRES_URI);