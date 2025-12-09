import Joi from "joi";

console.log("entered");

export const authValidation = {
  signup: {
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .when("type", { is: "user", then: Joi.required() }),

      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),

      type: Joi.string().valid("user", "org").required(),

      // org fields
      org_name: Joi.string().when("type", { is: "org", then: Joi.required() }),
      org_cat: Joi.string().when("type", { is: "org", then: Joi.required() }),
      country: Joi.string().when("type", { is: "org", then: Joi.required() }),
      state: Joi.string().when("type", { is: "org", then: Joi.required() }),
      city: Joi.string().when("type", { is: "org", then: Joi.required() }),

      pImg: Joi.string().optional(),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      type: Joi.string().valid("user", "org").required(),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  resendOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  verifyOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required(),
    }),
  },

  resetPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  },

  verifyOrg: {
    query: Joi.object({
      token: Joi.string().required(),
    }),
  },

  googleLogin: {
    body: Joi.object({
      googleToken: Joi.string().required(),
    }),
  },
};
