"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const fs_1 = __importDefault(require("fs"));
// Define logs directory name
const logDir = "logs";
// Create logs folder if it does not exist
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
// Configure daily rotating file transport
const transport = new winston_1.default.transports.DailyRotateFile({
    dirname: logDir, // Logs directory
    filename: "app-%DATE%.log", // Log file name pattern
    datePattern: "YYYY-MM-DD", // Rotate logs daily
    zippedArchive: true, // Compress old logs
    maxSize: "10m", // Max file size before rotation
    maxFiles: "14d", // Keep logs for 14 days
});
// Create Winston logger instance
const logger = winston_1.default.createLogger({
    level: "info", // Default log level
    // Log format configuration
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf((log) => {
        // Custom log output format
        return `[${log.timestamp}] [${log.level.toUpperCase()}] → ${log.message}`;
    })),
    // Log transports
    transports: [
        new winston_1.default.transports.Console(), // Output logs to console
        transport, // Output logs to rotating file
    ],
});
// Export logger for global use
exports.default = logger;
