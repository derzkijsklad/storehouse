export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201
};

export const sendResponse = (res, status, data) => res.status(status).json(data);
