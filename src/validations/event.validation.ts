import Joi from "joi";
import { EventMode } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

/**
 * Event-related request validations
 * Used with validate() middleware
 */
export const eventValidation = {
  /**
   * CREATE EVENT
   * - Organization creates a new event
   * - orgId comes from route params
   */
  create: {
    params: Joi.object({
      // Organization UUID
      orgId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      // Event basic details
      event_title: Joi.string().required(),
      description: Joi.string().optional(),

      // Date & time of event
      event_date: Joi.string().required(),
      event_time: Joi.string().required(),

      // Online / Offline
      mode: Joi.string().required(),

      // Optional banner image
      image: Joi.string().optional(),

      // Venue or location
      venue: Joi.string().required(),
    }),
  },

  /**
   * UPDATE EVENT
   * - Organization updates an existing event
   */
  update: {
    params: Joi.object({
      // Organization UUID
      orgId: Joi.string().uuid().required(),

      // Event UUID
      eventId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      // Event details
      event_title: Joi.string().required(),
      description: Joi.string().optional(),

      // Date & time
      event_date: Joi.string().required(),
      event_time: Joi.string().required(),

      // Online / Offline
      mode: Joi.string().required(),

      // Optional banner image
      image: Joi.string().optional(),

      // Venue or location
      venue: Joi.string().required(),
    }),
  },

  /**
   * GET SINGLE EVENT (ORG VIEW)
   * - Fetch one event by org & event ID
   */
  getSingle: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
      eventId: Joi.string().uuid().required(),
    }),
  },

  /**
   * GET ALL EVENTS (ORG VIEW)
   * - Fetch all events created by an organization
   */
  getAll: {
    params: Joi.object({
      slug: Joi.string().required(),
    }),
  },

  getAll1: {
    params: Joi.object({
      orgId: Joi.string().required(),
    }),
  },

  /**
   * DELETE EVENT
   * - Organization deletes an event
   */
  deleteEvent: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
      eventId: Joi.string().uuid().required(),
    }),
  },

  /**
   * GET SINGLE EVENT (PUBLIC VIEW)
   * - Public users fetch an approved event
   */
  getSinglePublicEvent: {
    params: Joi.object({
      slug: Joi.string().required(),
    }),
  },
};

export const validateEventFilter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  // Validate eventTypes
  if (body.eventTypes) {
    if (!Array.isArray(body.eventTypes)) {
      return res.status(400).json({
        success: false,
        message: "eventTypes must be an array",
      });
    }

    const validEventTypes = ["trending", "featured"];
    const invalidTypes = body.eventTypes.filter(
      (t: string) => !validEventTypes.includes(t),
    );

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid eventTypes: ${invalidTypes.join(", ")}`,
      });
    }
  }

  // Validate modes
  if (body.modes) {
    if (!Array.isArray(body.modes)) {
      return res.status(400).json({
        success: false,
        message: "modes must be an array",
      });
    }

    const validModes = Object.values(EventMode);
    const invalidModes = body.modes.filter(
      (m: string) => !validModes.includes(m as EventMode),
    );

    if (invalidModes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid modes: ${invalidModes.join(", ")}`,
      });
    }
  }

  // Validate sortBy
  if (body.sortBy) {
    const validSortOptions = [
      "viewCount",
      "titleAsc",
      "titleDesc",
      "recentlyAdded",
    ];
    if (!validSortOptions.includes(body.sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sortBy. Must be one of: ${validSortOptions.join(", ")}`,
      });
    }
  }

  // Validate date range
  if (body.dateRange) {
    if (typeof body.dateRange !== "object") {
      return res.status(400).json({
        success: false,
        message: "dateRange must be an object",
      });
    }

    const { startDate, endDate } = body.dateRange;

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before endDate",
      });
    }
  }

  // Validate price range
  if (body.priceRange) {
    if (typeof body.priceRange !== "object") {
      return res.status(400).json({
        success: false,
        message: "priceRange must be an object",
      });
    }

    const { min, max } = body.priceRange;

    if (min !== undefined && min < 0) {
      return res.status(400).json({
        success: false,
        message: "priceRange.min cannot be negative",
      });
    }

    if (max !== undefined && max < 0) {
      return res.status(400).json({
        success: false,
        message: "priceRange.max cannot be negative",
      });
    }

    if (min !== undefined && max !== undefined && min > max) {
      return res.status(400).json({
        success: false,
        message: "priceRange.min must be less than priceRange.max",
      });
    }
  }

  // Validate pagination
  if (body.page !== undefined) {
    const page = parseInt(body.page);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "page must be a positive number",
      });
    }
  }

  if (body.limit !== undefined) {
    const limit = parseInt(body.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "limit must be between 1 and 100",
      });
    }
  }

  next();
};
