import jwt from "jsonwebtoken";
import config from "config";
import { getError } from "../errors/errors.js";

export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        req.user = verifyToken(token);
    }
    next();
}
export function auth(skipRoutes = []) {
    return (req, res, next) => {
        const skipRoute = skipRoutes.find(
            (route) => route.path === req.path && route.method === req.method
        );
        if (!skipRoute) {
            if (!req.user) {
                throw getError(401, "");
            }
        }

        next();
    };
}
function verifyToken(token) {
    try {
        return jwt.verify(token, config.get("jwt.secret"));
    } catch (error) {
        throw getError(401, "Invalid or expired token");
    }
}