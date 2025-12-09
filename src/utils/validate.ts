import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate =
  (schema: {
    body?: ObjectSchema;
    params?: ObjectSchema;
    query?: ObjectSchema;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // validate request body
      if (schema.body) {
        const { error } = schema.body.validate(req.body, { abortEarly: false });
        if (error) {
          return res.status(400).json({
            status: false,
            message: "Validation error",
            errors: error.details.map((e) => e.message),
          });
        }
      }

      // validate request params
      if (schema.params) {
        const { error } = schema.params.validate(req.params, {
          abortEarly: false,
        });
        if (error) {
          return res.status(400).json({
            status: false,
            message: "Invalid URL parameters",
            errors: error.details.map((e) => e.message),
          });
        }
      }

      // validate request query
      if (schema.query) {
        const { error } = schema.query.validate(req.query, {
          abortEarly: false,
        });
        if (error) {
          return res.status(400).json({
            status: false,
            message: "Invalid query parameters",
            errors: error.details.map((e) => e.message),
          });
        }
      }

      // if everything passed → go to controller
      next();
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Internal validation error",
      });
    }
  };
