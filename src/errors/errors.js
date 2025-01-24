import logger, { formatLogDetails } from "../utils/logger.js";

export function getError(code, text) {
    return { code, text }
}
export function errorHandler(error, req, res, next) {
    const details = formatLogDetails(req, error);
    logger.error(`Error: ${error.text} | Details: ${JSON.stringify(details)}`);
    const status = (typeof error.code === 'number' && error.code >= 400 && error.code < 600)
        ? error.code
        : 500;
    const text = error.text ?? " Unknown server " + error;
    res.status(status)
        .json({ text });

}