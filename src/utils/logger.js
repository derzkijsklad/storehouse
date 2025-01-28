import winston from "winston";
import config from "config";

const defaultLogLevel = process.env.LOG_LEVEL || config.get("logLevel") || "info";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({ level: defaultLogLevel }),
  ],
});


export function formatLogDetails(req = {}, error = {}) {
  return {
    stack: error.stack || "No stack",
    path: req.path || "No path",
    method: req.method || "No method",
    ip: req.ip || "No IP",
    body: req.body || "No body",
    params: req.params || "No params",
    query: req.query || "No query",
  };
}

export default logger;