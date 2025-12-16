import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AUTH_MESSAGES } from "../constants/auth.message";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, type, ...rest } = req.body;

      const user = await AuthService.signup(name, email, password, type, rest);

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

  static async login(req: Request, res: Response) {
    try {
      const { email, password, type } = req.body;

      const data = await AuthService.login(email, password, type);

      return res.status(200).json({
        status: true,
        ...data,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
        AUTH_MESSAGES.ACCOUNT_DELETED,
        AUTH_MESSAGES.ACCOUNT_INACTIVE,
        AUTH_MESSAGES.ORG_NOT_FOUND,
        AUTH_MESSAGES.ORG_DELETED,
        AUTH_MESSAGES.ORG_NOT_VERIFIED,
        AUTH_MESSAGES.INVALID_PASSWORD,
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

  static async verifyOrg(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.TOKEN_MISSING,
        });
      }

      const result = await AuthService.verifyOrg(token as string);

      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.TOKEN_MISSING,
        AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN,
      ];

      // Known errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // Unknown errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      const result = await AuthService.forgotPassword(email);

      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_SENT,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.EMAIL_NOT_FOUND,
      ];

      // ✅ Known / safe errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // ❌ Unknown errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      const result = await AuthService.resendOtp(email);

      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_RESENT,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
      ];

      // ✅ Known / business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // ❌ Unknown errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const result = await AuthService.verifyOtp(email, otp);

      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.OTP_VERIFIED,
      });
    } catch (err: any) {
      const safeErrors = [AUTH_MESSAGES.INVALID_OTP, AUTH_MESSAGES.OTP_EXPIRED];

      // ✅ Known / business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // ❌ Unknown errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // reuse existing message
      if (!email) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.EMAIL_REQUIRED,
        });
      }

      if (!password) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.PASSWORD_REQUIRED,
        });
      }

      const result = await AuthService.resetPassword(email, password);

      return res.status(200).json({
        status: true,
        data: result,
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.EMAIL_REQUIRED,
        AUTH_MESSAGES.PASSWORD_REQUIRED,
        AUTH_MESSAGES.EMAIL_NOT_FOUND,
      ];

      // ✅ business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // ❌ system errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async googleLoginController(req: Request, res: Response) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        return res.status(200).json({
          status: false,
          message: AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
        });
      }

      const { user, token } = await AuthService.googleLogin(googleToken);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true in production with HTTPS
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({
        status: true,
        data: user,
        token,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
      });
    } catch (err: any) {
      const safeErrors = [
        AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
        AUTH_MESSAGES.GOOGLE_LOGIN_FAILED,
        AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
      ];

      // ✅ Known / business errors → 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // ❌ Unknown errors → 500
      return res.status(500).json({
        status: false,
        message: AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }
}
