 import Joi from "joi"
export const schemaParams = Joi.object({
    id:Joi.number().integer().positive()
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
 const schemaGetOrders =Joi.object({
    order_status: Joi.string().valid('open', 'closed').optional(),
    container_id: Joi.number().optional(),
    product_name: Joi.string().optional(),
});

const schemas = {
    '/api/auth/login': {
        POST: schemaLogin,
    },
    '/api/auth/password': {
        PUT: schemaUpdatePassword,
    },
    '/api/auth/email': {
        PATCH: schemaChangeEmail,
    },
    '/api/orders': {
        GET: schemaGetOrders,
    },
};

export default schemas;