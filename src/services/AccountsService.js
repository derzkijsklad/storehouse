import MongoConnection from "../databases/mongo/MongoConnection.js";
import { getError } from "../errors/errors.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config'


export default class AccountsService {
    #accounts
    #connection
    constructor(connection_str, db_name) {
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection(process.env.ACCOUNT_COLLECTION);
    }
    async getAccount(username) {
        const account = await this.#accounts.findOne({ _id: username });
        if (!account) {
            throw getError(404, `account ${username} not found`);
        }
        return account;
    }
    async login ({username, password}) {
        const account = await this.getAccount(username);
        if (!await bcrypt.compare(password, account.hashPassword)) {
            throw getError(400, "incorrect username/password");
        }
        const token = getJWT(username, account.role );
        return {token};

    }
    
}
function getJWT(username, role) {
    return jwt.sign({role}, config.get("jwt.secret"), {
       subject:username,
       expiresIn:config.get("jwt.expiresIn")
    })}