import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      //   extracting signup data from request body
      const { name, email, password, type, ...rest } = req.body;

      //   calling signup service to create user or org
      const user = await AuthService.signup(name, email, password, type, rest);

      //   returning success response when signup completes
      return res.status(200).json({
        status: true,
        message: `${type} created successfully`,
        data: user,
      });
    } catch (err: any) {
      //   list of error messages that should return 200 instead of 500
      const safeErrors = [
        "Role not found in database",
        "Email already registered",
        "Invalid type",
      ];

      //   returning handled errors with 200 response
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      //   unexpected error → internal server error
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      //   extracting login credentials from request body
      const { email, password, type } = req.body;

      //   calling login service to validate user/org
      const data = await AuthService.login(email, password, type);

      //   returning success login response
      return res
        .status(200)
        .json({ status: true, ...data, message: "login successfully" });
    } catch (err: any) {
      //   list of safe login errors for 200 response
      const safeErrors = [
        "Account not found",
        "Your account is deleted. Contact support.",
        "Your account is inactive. Contact admin.",
        "Organization account not found",
        "Organization account deleted. Contact support.",
        "Your organization is not verified yet. Please contact admin.",
        "Invalid password",
      ];

      //   known login error → return 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      //   unknown server error
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  }

  static async verifyOrg(req: Request, res: Response) {
    try {
      //   extract token from email verification link
      const { token } = req.query;

      //   verifying org account using token
      const result = await AuthService.verifyOrg(token as string);

      //   return verification success
      return res
        .status(200)
        .json({ status: true, data: result, message: "verified" });
    } catch (err: any) {
      //   error during verification
      return res.status(400).json({
        status: false,
        message: err.message,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      //   get email from request body for password reset
      const { email } = req.body;

      //   trigger forgot password service to send otp
      const result = await AuthService.forgotPassword(email);

      //   return otp sent response
      return res
        .status(200)
        .json({ data: result, status: true, message: "otp send to email" });
    } catch (err: any) {
      //   error during otp sending
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      //   extract email to resend otp
      const { email } = req.body;

      //   triggering resendOtp service
      const result = await AuthService.resendOtp(email);

      //   return resend success message
      return res.status(200).json({
        data: result,
        status: true,
        message: "otp resend successfully",
      });
    } catch (err: any) {
      //   error during resend otp
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      //   extract email and otp for verification
      const { email, otp } = req.body;

      //   verifying otp using service
      const result = await AuthService.verifyOtp(email, otp);

      //   return otp verified response
      return res
        .status(200)
        .json({ data: result, status: true, message: "otp verified" });
    } catch (err: any) {
      //   otp verification error
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      //   extracting email and new password
      const { email, password } = req.body;

      //   calling service to update new password
      const result = await AuthService.resetPassword(email, password);

      //   return reset success response
      return res.status(200).json({
        data: result,
        status: true,
        message: "Password reset successfully",
      });
    } catch (err: any) {
      //   error resetting password
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async googleLoginController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      //   extract google token from request body
      const { googleToken } = req.body;

      //   validate if google token is received
      if (!googleToken) {
        return res.status(400).json({
          success: false,
          message: "Google token missing",
        });
      }

      //   calling google login service for authentication
      const { user, token } = await AuthService.googleLogin(googleToken);

      //   storing token in cookie for session
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      //   return login success
      return res.status(200).json({
        status: true,
        data: user,
        token,
        message: "Login Successfully",
      });
    } catch (err: any) {
      //   unexpected google login error
      console.error("Google Login Error:", err);
      return res.status(500).json({
        status: false,
        message: err.message || "Google login failed",
      });
    }
  }
}
