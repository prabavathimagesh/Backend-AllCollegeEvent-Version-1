import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, type, ...rest } = req.body;

      const user = await AuthService.signup(name, email, password, type, rest);

      res.status(201).json({
        success: true,
        message: `${type} created successfully`,
        user,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, type } = req.body;

      const data = await AuthService.login(email, password, type);
      res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyOrg(req: Request, res: Response) {
    try {
      const { token } = req.query;

      const result = await AuthService.verifyOrg(token as string);

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
}
