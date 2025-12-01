"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const appLogger = (req, res, next) => {
    // Log request
    logger_1.default.info(`Incoming → ${req.method} ${req.originalUrl}`);
    // Log errors from controller automatically
    const oldJson = res.json;
    res.json = function (body) {
        if (body && body.success === false) {
            logger_1.default.error(`Error → ${req.method} ${req.originalUrl} | Message: ${body.message}`);
        }
        return oldJson.call(this, body);
    };
    next();
};
exports.appLogger = appLogger;
