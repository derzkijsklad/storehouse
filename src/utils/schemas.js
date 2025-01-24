import Joi from "joi"
import { PATHS } from "../config/paths.js";

export const schemaParams = Joi.object({
    id: Joi.number().integer().positive()
})

const schemaLogin = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(8).required(),
});
const schemaUpdatePassword = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).required(),
});
const schemaChangeEmail = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(8).required(),
    newEmail: Joi.string().email().required(),
});
const schemaGetOrders = Joi.object({
    id: Joi.number().integer().optional(),
    is_closed: Joi.string().valid('true', 'false').optional(),
    date: Joi.string()
        .optional()
});

const schemaCreateOrder = Joi.object({
    spot_id: Joi.number().integer().required(),
    value: Joi.number().required(),
});
const schemaManageUserAddUpdate = Joi.object({
    username: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'manager').required(),
});
const schemaManageUserDelete = Joi.object({
    username: Joi.string().min(4).required(),
});


const schemas = {
    [PATHS.AUTH_LOGIN]: {
        POST: schemaLogin,
    },
    [PATHS.AUTH_PASSWORD]: {
        PUT: schemaUpdatePassword,
    },
    [PATHS.AUTH_EMAIL]: {
        PATCH: schemaChangeEmail,
    },
    [PATHS.ORDERS]: {
        GET: schemaGetOrders,
        POST: schemaCreateOrder
    },
    [PATHS.MANAGE_USER]: {
        POST: schemaManageUserAddUpdate,
        PUT: schemaManageUserAddUpdate,
        DELETE: schemaManageUserDelete,
    }
};

export default schemas;