import Joi from "joi";

export const userValidation = {
  create: {
    body: Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      profileImage: Joi.string().optional(),
    }),
  },

  update: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      name: Joi.string().min(3),
      email: Joi.string().email(),
      password: Joi.string().min(6),
      phone: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      profileImage: Joi.string(),
      isActive: Joi.boolean(),
    }),
  },
};
