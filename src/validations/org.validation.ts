import Joi from "joi";

export const orgValidation = {
  create: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),

      type: Joi.string().min(3).required(),

      org_name: Joi.string().required(),
      org_cat: Joi.string().required(),

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
      org_name: Joi.string(),
      org_cat: Joi.string(),
      country: Joi.string(),
      password: Joi.string(),
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

  getSingle: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
    }),
  },

  deleteOrg: {
    params: Joi.object({
      orgId: Joi.string().uuid().required(),
    }),
  },
};
