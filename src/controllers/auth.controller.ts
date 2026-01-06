import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AUTH_MESSAGES } from "../constants/auth.message";
import { uploadToS3 } from "../utils/s3Upload";

/**
 * Auth Controller
 * Handles authentication & authorization related APIs
 */
export class AuthController {
  /**
   * Signup user or organization
   */
  static async signup(req: Request, res: Response) {
    try {
      // Extract signup details from request body
      const {
        name,
        email,
        password,
        type,
        platform = "web",
        ...rest
      } = req.body;

      // Call signup service (6 args)
      const user = await AuthService.signup(
        name,
        email,
        password,
        type,
        platform,
        rest
      );

      return res.status(200).json({
        status: true,
        message:
          type === "user"
            ? AUTH_MESSAGES.USER_CREATED_SUCCESS
            : AUTH_MESSAGES.ORG_CREATED_SUCCESS,
        data: user,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.ROLE_NOT_FOUND,
        AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED,
        AUTH_MESSAGES.INVALID_TYPE,
        AUTH_MESSAGES.EMAIL_ALREADY_USER,
        AUTH_MESSAGES.EMAIL_ALREADY_ORG,
        AUTH_MESSAGES.PUBLIC_EMAIL_MSG,
      ];

      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Login user or organization
   */
  static async login(req: Request, res: Response) {
    try {
      // Extract login credentials
      const { email, password, type } = req.body;

      // Call login service
      const data = await AuthService.login(email, password, type);

      // Success response
      return res.status(200).json({
        status: true,
        ...data,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
        AUTH_MESSAGES.ACCOUNT_DELETED,
        AUTH_MESSAGES.ACCOUNT_INACTIVE,
        AUTH_MESSAGES.ORG_NOT_FOUND,
        AUTH_MESSAGES.ORG_DELETED,
        AUTH_MESSAGES.ORG_NOT_VERIFIED,
        AUTH_MESSAGES.INVALID_PASSWORD,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Verify organization account using email token
   */
  static async verifyOrg(req: Request, res: Response) {
    try {
      // Extract token from query params
      const { token } = req.query;

      // Token missing
      if (!token) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.TOKEN_MISSING,
        });
      }

      // Verify organization
      const result = await AuthService.verifyAccount(token as string);

      // Success response
      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.TOKEN_MISSING,
        AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN,
        AUTH_MESSAGES.ORG_ALREADY_VERIFIED,
        AUTH_MESSAGES.USER_ALREADY_VERIFIED,
        AUTH_MESSAGES.ACCOUNT_NOT_FOUND_BY_TOKEN,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Forgot password - send OTP
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      // Extract email
      const { email } = req.body;

      // Email required
      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      // Trigger forgot password flow
      const result = await AuthService.forgotPassword(email);

      // Success response
      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_SENT,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.EMAIL_NOT_FOUND,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Resend OTP
   */
  static async resendOtp(req: Request, res: Response) {
    try {
      // Extract email
      const { email } = req.body;

      // Email required
      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      // Resend OTP
      const result = await AuthService.resendOtp(email);

      // Success response
      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_RESENT,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      // Extract email & OTP
      const { email, otp } = req.body;

      // Verify OTP
      const result = await AuthService.verifyOtp(email, otp);

      // Success response
      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_VERIFIED,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [AUTH_MESSAGES.INVALID_OTP, AUTH_MESSAGES.OTP_EXPIRED];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      // Extract email & password
      const { email, password } = req.body;

      // Email required
      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      // Password required
      if (!password) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.PASSWORD_REQUIRED,
        });
      }

      // Reset password
      const result = await AuthService.resetPassword(email, password);

      // Success response
      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.PASSWORD_REQUIRED,
        AUTH_MESSAGES.EMAIL_NOT_FOUND,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Google OAuth login
   */
  static async googleLoginController(req: Request, res: Response) {
    try {
      // Extract Google token
      const { googleToken } = req.body;

      // Token missing
      if (!googleToken) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
        });
      }

      // Perform Google login
      const { user, token } = await AuthService.googleLogin(googleToken);

      // Set auth cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true in production with HTTPS
        sameSite: "lax",
        path: "/",
      });

      // Success response
      return res.status(200).json({
        status: true,
        data: user,
        token,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
      });
    } catch (err: any) {
      // Known / business errors
      const safeErrors = [
        AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
        AUTH_MESSAGES.GOOGLE_LOGIN_FAILED,
        AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
      ];

      // Business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Profile Update
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const { type, identity } = req.body;

      if (!type || !identity) {
        return res.status(200).json({
          success: false,
          message: AUTH_MESSAGES.TYPE_AND_ID_REQUIRED,
        });
      }

      /* ---------- S3 IMAGE UPLOAD ---------- */
      let profileImage: string | undefined;

      if (req.file) {
        const uploaded = await uploadToS3(req.file, "profiles");
        profileImage = uploaded.url;
      }

      /* ---------- PARSE SOCIAL LINKS ---------- */
      let socialLinks;
      if (req.body.socialLinks) {
        try {
          socialLinks = JSON.parse(req.body.socialLinks);
        } catch {
          throw new Error(AUTH_MESSAGES.IVALID_SOCIAL_LINK_FORMAT);
        }
      }

      const payload = {
        type,
        identity,
        name: req.body.name,
        organizationName: req.body.organizationName,
        profileImage,
        socialLinks,
      };

      const data = await AuthService.updateProfile(payload);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      const message = err.message || AUTH_MESSAGES.SOMETHING_WENT_WRONG;

      const safeErrors = [
        // Controller-level
        AUTH_MESSAGES.TYPE_AND_ID_REQUIRED,
        AUTH_MESSAGES.IVALID_SOCIAL_LINK_FORMAT,

        // Service-level
        AUTH_MESSAGES.INVALID_PROFILE_TYPE,
      ];

      /* ---------- SAFE ERRORS (EXPECTED) ---------- */
      if (safeErrors.includes(message)) {
        return res.status(200).json({
          success: false,
          message,
        });
      }

      /* ---------- UNEXPECTED / SYSTEM ERRORS ---------- */
      return res.status(500).json({
        success: false,
        message,
      });
    }
  }
}
