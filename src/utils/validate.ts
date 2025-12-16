import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { VALIDATION_MESSAGES } from "../constants/validation.message";

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
          return res.status(200).json({
            status: false,
            message: VALIDATION_MESSAGES.VALIDATION_ERROR,
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
          return res.status(200).json({
            status: false,
            message: VALIDATION_MESSAGES.INVALID_PARAMS,
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
          return res.status(200).json({
            status: false,
            message: VALIDATION_MESSAGES.INVALID_QUERY,
            errors: error.details.map((e) => e.message),
          });
        }
      }

      // all validations passed
      next();
    } catch (err) {
      // only real server error → 500
      return res.status(500).json({
        status: false,
        message: VALIDATION_MESSAGES.INTERNAL_VALIDATION_ERROR,
      });
    }
  };
