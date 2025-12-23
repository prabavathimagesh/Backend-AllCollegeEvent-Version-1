import Joi from "joi";

/**
 * Auth-related request validations
 * Used with validate() middleware
 */
export const authValidation = {
  /**
   * SIGNUP VALIDATION
   * - Supports both user & org signup
   * - Conditional fields based on `type`
   */
  signup: {
    body: Joi.object({
      // User name required only if type = user
      name: Joi.string()
        .min(3)
        .when("type", { is: "user", then: Joi.required() }),

      // Common fields
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),

      // User or Organization
      type: Joi.string().valid("user", "org").required(),
      platform:Joi.string().valid("mobile","web").required(),

      // Organization-only fields
      org_name: Joi.string().when("type", { is: "org", then: Joi.required() }),
      org_cat: Joi.string().when("type", { is: "org", then: Joi.required() }),
      country: Joi.string().when("type", { is: "org", then: Joi.required() }),
      state: Joi.string().when("type", { is: "org", then: Joi.required() }),
      city: Joi.string().when("type", { is: "org", then: Joi.required() }),

      // Optional profile image
      pImg: Joi.string().optional(),
    }),
  },

  /**
   * LOGIN VALIDATION
   */
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      type: Joi.string().valid("user", "org").required(),
    }),
  },

  /**
   * FORGOT PASSWORD
   * - Used to send OTP
   */
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  /**
   * RESEND OTP
   */
  resendOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  /**
   * VERIFY OTP
   * - OTP must be exactly 4 digits
   */
  verifyOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(4).required(),
    }),
  },

  /**
   * RESET PASSWORD
   */
  resetPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  },

  /**
   * VERIFY ORGANIZATION EMAIL
   * - Token comes from email verification link
   */
  verifyOrg: {
    query: Joi.object({
      token: Joi.string().required(),
    }),
  },

  /**
   * GOOGLE LOGIN
   */
  googleLogin: {
    body: Joi.object({
      googleToken: Joi.string().required(),
    }),
  },
};
