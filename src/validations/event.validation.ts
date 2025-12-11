import Joi from "joi";

export const eventValidation = {
  create: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      event_title: Joi.string().required(),
      description: Joi.string().optional(),
      event_date: Joi.string().required(),
      event_time: Joi.string().required(),
      mode: Joi.string().required(),

      image: Joi.string().optional(),
      venue: Joi.string().required(),
    }),
  },

  update: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
      eventId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      event_title: Joi.string().required(),
      description: Joi.string().optional(),
      event_date: Joi.string().required(),
      event_time: Joi.string().required(),
      mode: Joi.string().required(),

      image: Joi.string().optional(),
      venue: Joi.string().required(),
    }),
  },

  getSingle: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
      eventId: Joi.string().uuid().required(),
    }),
  },

  getAll: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
    }),
  },

  deleteEvent: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
      eventId: Joi.string().uuid().required(),
    }),
  },

  getSinglePublicEvent: {
    params: Joi.object({
      eventId: Joi.string().uuid().required(),
    }),
  },
};
