import Joi from "joi";

export const orgValidation = {
  create: {
    body: Joi.object({
      domainEmail: Joi.string().email().required(),
      password: Joi.string().min(6).required(),

      organizationName: Joi.string().required(),
      organizationCategory: Joi.string().required(),

      country: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),

      profileImage: Joi.string().optional(),
      whatsapp: Joi.string().optional(),
      instagram: Joi.string().optional(),
      linkedIn: Joi.string().optional(),
      logoUrl: Joi.string().optional(),
      website: Joi.string().optional(),
    }),
  },

  update: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      organizationName: Joi.string(),
      organizationCategory: Joi.string(),
      country: Joi.string(),
      state: Joi.string(),
      city: Joi.string(),
      profileImage: Joi.string(),
      whatsapp: Joi.string(),
      instagram: Joi.string(),
      linkedIn: Joi.string(),
      logoUrl: Joi.string(),
      website: Joi.string(),
      isActive: Joi.boolean(),
    }),
  },
};
