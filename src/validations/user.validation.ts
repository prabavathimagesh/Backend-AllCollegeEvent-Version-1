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
      name: Joi.string().min(3).optional(),
      password: Joi.string().min(6).optional(),
      email:Joi.string().optional(),
      phone: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      profileImage: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      isDeleted: Joi.boolean().optional(),
    })
      // ✅ require at least ONE field to update
      .min(1),
  },
  getSingle: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  },

  deleteUser: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  },
};
