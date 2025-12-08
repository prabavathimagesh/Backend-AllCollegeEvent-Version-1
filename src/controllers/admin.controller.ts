import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import AdminService from "../services/admin.service";

export default class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AdminService.login(email, password);
      return res
        .status(200)
        .json({ status: true, data: result, message: "Logged in" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await AdminService.listUsers(page, limit);
      return res.status(200).json({ status: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const user = await AdminService.getUserById(userID);
      if (!user)
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      return res.status(200).json({ status: true, data: user });
    } catch (err: any) {
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const payload = req.body;
      const user = await AdminService.createUser(payload);
      return res
        .status(201)
        .json({ status: true, data: user, message: "User created" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const payload = req.body;
      const user = await AdminService.updateUser(userID, payload);
      return res
        .status(200)
        .json({ status: true, data: user, message: "User updated" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const user = await AdminService.deleteUser(userID);
      return res
        .status(200)
        .json({ status: true, data: user, message: "User deleted" });
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  }
}
