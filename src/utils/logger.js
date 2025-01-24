import fs from "fs";
import path from "path";
import config from "config";

const logDir = path.resolve("logs");
const logFilePath = path.join(logDir, "app.log");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

const logLevels = { finest: 1, debug: 2, info: 5, warn: 4, error: 3 };
const defaultLogLevel = config.get("logLevel") || "info";
const currentLogLevel = logLevels[defaultLogLevel.toLowerCase()] || logLevels.info;

const logMessage = (level, message) => {
  if (logLevels[level] >= currentLogLevel) {
    const timestamp = new Date().toLocaleString();
    const formattedMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;
    fs.appendFileSync(logFilePath, formattedMessage);
  }
};

export default {
  finest: (message) => logMessage("finest", message),
  debug: (message) => logMessage("debug", message),
  info: (message) => logMessage("info", message),
  warn: (message) => logMessage("warn", message),
  error: (message) => logMessage("error", message),
};

export function formatLogDetails(req, error) {
    return {
        stack: error?.stack,
        path: req.path,
        method: req.method,
        ip: req.ip, 
        body: req.body ,
        params: req.params,
        query: req.query,
    };
}