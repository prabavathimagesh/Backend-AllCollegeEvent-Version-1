import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../utils/validate";
import { authValidation } from "../validations/auth.validation";
import upload from "../middlewares/fileUpload";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @route POST /api/v1/auth/signup
 * @desc  User signup (self registration)
 */
router.post("/signup", validate(authValidation.signup), AuthController.signup);

/**
 * @route POST /api/v1/auth/login
 * @desc  User login
 */
router.post("/login", validate(authValidation.login), AuthController.login);

/**
 * @route POST /api/v1/auth/logout
 * @desc  User logout
 */
router.post("/logout", AuthController.logout);

/* ----------------------- ORG VERIFICATION ----------------------- */

/**
 * @route GET /api/v1/auth/org/verify
 * @desc  Verify organization through email verification link
 */
router.get(
  "/org/verify",
  validate(authValidation.verifyOrg),
  AuthController.verifyOrg
);

/* ----------------------- PASSWORD RESET FLOW ----------------------- */

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc  Send OTP to email for password reset
 */
router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  AuthController.forgotPassword
);

/**
 * @route POST /api/v1/auth/verify-otp
 * @desc  Verify OTP for password reset process
 */
router.post(
  "/verify-otp",
  validate(authValidation.verifyOtp),
  AuthController.verifyOtp
);

/**
 * @route POST /api/v1/auth/resend-otp
 * @desc  Resend OTP to email
 */
router.post(
  "/resend-otp",
  validate(authValidation.resendOtp),
  AuthController.resendOtp
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc  Reset password using verified OTP
 */
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  AuthController.resetPassword
);

/* ----------------------- GOOGLE OAUTH LOGIN ----------------------- */

/**
 * @route POST /api/v1/auth/google-login
 * @desc  Login with Google OAuth (ID token verification)
 */
router.post(
  "/google-login",
  validate(authValidation.googleLogin),
  AuthController.googleLoginController
);

/**
 * Update Profile User or Org
 */
router.post(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  AuthController.updateProfile
);

export default router;
