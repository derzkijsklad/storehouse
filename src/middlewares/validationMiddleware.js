import { getError } from '../errors/errors.js';

export function validateBody(schemas) {
    return (req, res, next) => {
        if (req._body) {
            const schema = schemas[req.path]?.[req.method];
            if (schema) {
                req.validated = true;
                const { error } = schema.validate(req.body, { abortEarly: false });
                if (error) {
                    req.error_message = error.details.map((detail) => detail?.message.replace(/\"/g, '')).join(', ');
                }
            }
        }
        next();
    };
}

export function valid(req, res, next) {
    if (req._body) {
        if (!req.validated) {
            throw getError(500, `For ${req.method} request with body, no validation schema provided`);
        }
        if (req.error_message) {
            throw getError(400, req.error_message);
        }
    }
    next();
}

export function validateParams(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            throw getError(400, error.details[0].message.replace(/\"/g, ''));
        }
        next();
    };
}
