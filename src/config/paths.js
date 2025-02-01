
export const PATHS = {
    AUTH_LOGIN: '/api/auth/login',
    AUTH_PASSWORD: '/api/auth/password',
    AUTH_EMAIL: '/api/auth/email',
    ORDERS: '/api/orders',
    MANAGE_USER: '/api/auth/manageUser',
};
export const skipRoutes = [
    { path: PATHS.AUTH_LOGIN, method: "POST" },
    { path: PATHS.MANAGE_USER, method: "POST" },
    { path: PATHS.MANAGE_USER, method: "PUT" },
    { path: PATHS.MANAGE_USER, method: "DELETE" },
];
export const ROUTES = {
    AUTH: '/api/auth',
    ORDERS: PATHS.ORDERS,
    CONTAINERS: '/api',
    ERRORS: '/api',
};