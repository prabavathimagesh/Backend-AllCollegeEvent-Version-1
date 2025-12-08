import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, type, ...rest } = req.body;

      const user = await AuthService.signup(name, email, password, type, rest);

      res.status(201).json({
        status: true,
        message: `${type} created successfully`,
        data: user,
      });
    } catch (err: any) {
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, type } = req.body;

      const data = await AuthService.login(email, password, type);
      res.status(200).json({ status: true, ...data });
    } catch (err: any) {
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async verifyOrg(req: Request, res: Response) {
    try {
      const { token } = req.query;

      const result = await AuthService.verifyOrg(token as string);

      return res
        .status(200)
        .json({ status: true, data: result, message: "verified" });
    } catch (err: any) {
      return res.status(400).json({
        status: false,
        message: err.message,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);

      return res
        .status(200)
        .json({ data: result, status: true, message: "email received" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await AuthService.resendOtp(email);

      return res.status(200).json({ data: result, status: true, message: "" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const result = await AuthService.verifyOtp(email, otp);

      return res
        .status(200)
        .json({ data: result, status: true, message: "otp verified" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.resetPassword(email, password);

      return res.status(200).json({
        data: result,
        status: true,
        message: "Password reset successfully",
      });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async googleLoginController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        return res.status(400).json({
          success: false,
          message: "Google token missing",
        });
      }

      const { user, token } = await AuthService.googleLogin(googleToken);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({
        status: true,
        data: user,
        token,
        message: "Login Successfully",
      });
    } catch (err: any) {
      console.error("Google Login Error:", err);
      return res.status(500).json({
        status: false,
        message: err.message || "Google login failed",
      });
    }
  }
}
