import Joi from "joi";

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
