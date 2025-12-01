import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const appLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log request
  logger.info(`Incoming → ${req.method} ${req.originalUrl}`);

  // Log errors from controller automatically
  const oldJson = res.json;

  res.json = function (body: any) {
    if (body && body.success === false) {
      logger.error(
        `Error → ${req.method} ${req.originalUrl} | Message: ${body.message}`
      );
    }
    return oldJson.call(this, body);
  };

  next();
};
