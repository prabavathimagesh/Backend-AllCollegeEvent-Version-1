import winston from "winston";
import "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

// Create logs folder if missing
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((log) => {
      return `[${log.timestamp}] [${log.level.toUpperCase()}] → ${log.message}`;
    })
  ),

  transports: [
    new winston.transports.Console(),
    transport
  ],
});

export default logger;
