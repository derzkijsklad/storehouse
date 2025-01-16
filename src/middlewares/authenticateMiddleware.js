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
export const authenticateRequest = (req) => {
    const header = req.header("Authorization");
    if (!header?.startsWith("Basic ")) {
        throw getError(401, "Authorization header missing or invalid");
    }

    const [username, password] = Buffer.from(header.substring(6), "base64").toString("ascii").split(":");
    if (username !== process.env.OWNER_USERNAME || password !== process.env.OWNER_PASSWORD) {
        throw getError(401, "Unauthorized: Invalid credentials");
    }
};