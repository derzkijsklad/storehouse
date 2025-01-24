import MongoConnection from "../databases/mongo/MongoConnection.js";
import { getError } from "../errors/errors.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import logger from "../utils/logger.js";

export default class AccountsService {
    #accounts
    #connection
    constructor(connection_str, db_name) {
        logger.info(`Initializing AccountsService with database: ${db_name}`);
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection(config.get('ACCOUNT_COLLECTION'));
    }

    async getAccount(username) {
        logger.debug(`Attempting to fetch account for username: ${username}`);
        const account = await this.#accounts.findOne({ _id: username });
        if (!account) {
            logger.warn(`Account not found for username: ${username}`);
            throw getError(404, `account not found`);
        }
        logger.debug(`Successfully retrieved account for username: ${username}`);
        return account;
    }

    async login({username, password}) {
        logger.info(`Login attempt for username: ${username}`);
        const account = await this.checkPassword(username, password);
        const token = getJWT(username, account.role);
        logger.info(`Successful login for username: ${username}`);
        return {token};
    }

    async updatePassword({ username, password, newPassword }) {
        logger.info(`Password update attempt for username: ${username}`);
        const account = await this.checkPassword(username, password);
        const hashPassword = await bcrypt.hash(newPassword, config.get("bcrypt.saltRounds"));
        await this.#accounts.updateOne({ _id: username }, { $set: { hashPassword } });
        logger.info(`Password successfully updated for username: ${username}`);
        return { username, role: account.role };
    }

    async changeEmail({username, password, newEmail}) {
        logger.info(`Email change attempt for username: ${username}`);
        const account = await this.checkPassword(username, password);
        await this.#accounts.updateOne({_id: username}, {$set: {email: newEmail}});
        logger.info(`Email successfully updated for username: ${username}`);
        return {username, role: account.role, email: newEmail};
    }
    
    async checkPassword(username, password) {
        logger.debug(`Verifying password for username: ${username}`);
        const account = await this.getAccount(username);
        if (!await bcrypt.compare(password, account.hashPassword)) {
            logger.warn(`Invalid password attempt for username: ${username}`);
            throw getError(400, "incorrect username/password");
        }
        logger.debug(`Password verification successful for username: ${username}`);
        return account;
    }

    async addUser({ username, email, password, role }) {
        logger.info(`Attempting to create new user: ${username}`);
        const existingUser = await this.#accounts.findOne({ _id: username });
        if (existingUser) {
            logger.warn(`User creation failed - username already exists: ${username}`);
            throw getError(400, `User ${username} already exists`);
        }

        const hashPassword = await bcrypt.hash(password, config.get("bcrypt.saltRounds"));
        await this.#accounts.insertOne({ _id: username, email, hashPassword, role });
        logger.info(`Successfully created new user: ${username}`);
    }

    async updateUser({ username, email, password, role }) {
        logger.info(`Attempting to update user: ${username}`);
        const existingUser = await this.#accounts.findOne({ _id: username });
        if (!existingUser) {
            logger.warn(`User update failed - user not found: ${username}`);
            throw getError(404, `User ${username} not found`);
        }

        const hashPassword = await bcrypt.hash(password, config.get("bcrypt.saltRounds"));
        await this.#accounts.updateOne(
            { _id: username },
            { $set: { email, hashPassword, role } }
        );
        logger.info(`Successfully updated user: ${username}`);
    }

    async deleteUser(username) {
        logger.info(`Attempting to delete user: ${username}`);
        const result = await this.#accounts.deleteOne({ _id: username });
        if (result.deletedCount === 0) {
            logger.warn(`User deletion failed - user not found: ${username}`);
            throw getError(404, `User ${username} not found`);
        }
        logger.info(`Successfully deleted user: ${username}`);
    }
}

function getJWT(username, role) {
    logger.debug(`Generating JWT token for username: ${username}`);
    return jwt.sign({role}, config.get("jwt.secret"), {
        subject: username,
        expiresIn: config.get("jwt.expiresIn")
    });
}
