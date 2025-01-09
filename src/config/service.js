import AccountsService from "../services/AccountsService.js";
import dotenv from "dotenv";
dotenv.config()

export const accountsService = new AccountsService(process.env.MONGO_URI, process.env.ACCOUNT_DB);