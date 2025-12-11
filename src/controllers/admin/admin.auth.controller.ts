import { Request, Response, NextFunction } from "express";
import AdminService from "../../services/admin/admin.auth.service";

export default class AdminAuthController {
  static async login(req: Request, res: Response) {
    try {
      // extracting admin login credentials from request body
      const { email, password } = req.body;

      // validating admin credentials using service
      const result = await AdminService.login(email, password);

      // sending login success response
      return res
        .status(200)
        .json({ status: true, data: result, message: "Logged in" });
    } catch (err: any) {
      // invalid credentials or login failure
      return res.status(400).json({ status: false, message: err.message });
    }
  }
}
