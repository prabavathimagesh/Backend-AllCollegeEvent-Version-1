import { Request, Response } from "express";
import AdminUserService from "../../services/admin/admin.user.service";

export class AdminUserController {
  static async listUsers(req: Request, res: Response) {
    try {
      // parsing pagination values (page & limit)
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      // fetching paginated list of users
      const result = await  AdminUserService.listUsers(page, limit);

      // returning list of users
      return res.status(200).json({ status: true, data:result, message:"User list fetched" });
    } catch (err: any) {
      // server error during user listing
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      // extracting user id from request params
      const { userId } = req.params;

      // fetching user by id
      const user = await  AdminUserService.getUserById(userId);

      // checking if user exists
      if (!user)
        return res
          .status(404)
          .json({ status: false, message: "User not found" });

      // returning user data
      return res.status(200).json({ status: true, data: user, message:"User data fetched" });
    } catch (err: any) {
      // internal error fetching specific user
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      // extracting new user data from request body
      const payload = req.body;

      // creating new user using service layer
      const user = await  AdminUserService.createUser(payload);

      // returning creation success response
      return res
        .status(201)
        .json({ status: true, data: user, message: "User created" });
    } catch (err: any) {
      // validation error or bad payload
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      // extracting user id from request params
      const { userId } = req.params;

      // new data to update user
      const payload = req.body;

      // updating user in service layer
      const user = await  AdminUserService.updateUser(userId, payload);

      // returning update success message
      return res
        .status(200)
        .json({ status: true, data: user, message: "User updated" });
    } catch (err: any) {
      // invalid update request
      return res.status(400).json({ status: false, message: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      // extracting user id to delete
      const { userId } = req.params;

      // deleting user through service
      const user = await  AdminUserService.deleteUser(userId);

      // returning delete success message
      return res
        .status(200)
        .json({ status: true, data: user, message: "User deleted" });
    } catch (err: any) {
      // error during delete operation
      return res.status(400).json({ status: false, message: err.message });
    }
  }
}
