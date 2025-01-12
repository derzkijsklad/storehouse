 import Joi from "joi"
export const schemaParams = Joi.object({
    id:Joi.number().integer().positive()
 })

 const schemaLogin = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(8).required(),
});

const schemas = {
    '/api/auth/login': {
        POST: schemaLogin,
    }
};

export default schemas;