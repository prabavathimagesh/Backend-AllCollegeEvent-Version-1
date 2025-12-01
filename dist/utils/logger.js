"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const fs_1 = __importDefault(require("fs"));
// Create logs folder if missing
const logDir = "logs";
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
const transport = new winston_1.default.transports.DailyRotateFile({
    dirname: logDir,
    filename: "app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
});
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf((log) => {
        return `[${log.timestamp}] [${log.level.toUpperCase()}] → ${log.message}`;
    })),
    transports: [
        new winston_1.default.transports.Console(),
        transport
    ],
});
exports.default = logger;
