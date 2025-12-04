import { Request, Response } from "express";
import UserService from "../services/user.service";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const identity = req.params.id;
      const user = await UserService.getUserById(identity);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const identity = req.params.id;
      const body = req.body;

      const updated = await UserService.updateUser(identity, body);

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const identity = req.params.id;

      const deletedUser = await UserService.deleteUser(identity);

      res.json({ success: true, data: deletedUser });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

