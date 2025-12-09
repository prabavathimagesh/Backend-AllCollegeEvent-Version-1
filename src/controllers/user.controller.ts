import { Request, Response } from "express";
import UserService from "../services/user.service";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      // fetching all users from service
      const users = await UserService.getAllUsers();

      // sending response with users list
      res.json({ status: true, data: users, message: "All Users Fetched" });
    } catch (err: any) {
      // internal error during fetching users
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      // extracting user identity from params
      const identity = req.params.userId;

      // fetching user details by identity
      const user = await UserService.getUserById(identity);

      // checking if user exists
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      // successfully returning user details
      res.json({ status: true, data: user, message: "User Data Fetched" });
    } catch (err: any) {
      // internal server error during fetch
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      // extracting user identity for update
      const identity = req.params.userId;

      // capturing updated fields from request body
      const body = req.body;

      // updating user details via service layer
      const updated = await UserService.updateUser(identity, body);

      // sending updated user data in response
      res.json({ status: true, data: updated, message: "User Data Updated" });
    } catch (err: any) {
      // error during update operation
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      // extracting user identity to delete
      const identity = req.params.userId;

      // performing delete (soft delete or hard delete)
      const deletedUser = await UserService.deleteUser(identity);

      // sending success delete response
      res.json({ status: true, data: deletedUser, message: "User deleted" });
    } catch (err: any) {
      // internal error during delete operation
      res.status(500).json({ status: false, message: err.message });
    }
  }
}
