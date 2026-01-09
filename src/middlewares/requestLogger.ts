import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const appLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming → ${req.method} ${req.originalUrl}`);

  const oldJson = res.json;

  res.json = function (body: any) {
    if (body && body.status === false) {
      logger.error(
        `Error → ${req.method} ${req.originalUrl} | Message: ${body.message}`
      );
    }
    return oldJson.call(this, body);
  };

  next();
};
