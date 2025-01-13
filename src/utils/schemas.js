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

const schemas = {
    '/api/auth/login': {
        POST: schemaLogin,
    },
    '/api/auth/password': {
        PUT: schemaUpdatePassword,
    },
};

export default schemas;