import Joi from "joi"

const productNames = ['Widget A', 'Gadget B', 'Tool C', 'Device D', 'Accessory E'];

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
    order_status: Joi.string().valid('open', 'closed').optional(),
    container_id: Joi.number().optional(),
    product_name: Joi.string().valid(...productNames).optional(),
});
const schemaCreateOrder = Joi.object({
    container_id: Joi.number().integer().required(),
    product_name: Joi.string().valid(...productNames).required(),
    quantity: Joi.number().integer().min(1).required()
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
        POST: schemaCreateOrder
    },
    '/api/auth/manageUser': {
        POST: schemaManageUserAddUpdate,
        PUT: schemaManageUserAddUpdate,
        DELETE: schemaManageUserDelete,
    }
};

export default schemas;