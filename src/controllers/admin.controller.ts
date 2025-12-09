import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import AdminService from "../services/admin.service";

export default class AdminController {
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

  static async listUsers(req: Request, res: Response) {
    try {
      // parsing pagination values (page & limit)
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      // fetching paginated list of users
      const result = await AdminService.listUsers(page, limit);

      // returning list of users
      return res.status(200).json({ status: true, ...result });
    } catch (err: any) {
      // server error during user listing
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      // extracting user id from request params
      const { userID } = req.params;

      // fetching user by id
      const user = await AdminService.getUserById(userID);

      // checking if user exists
      if (!user)
        return res
          .status(404)
          .json({ status: false, message: "User not found" });

      // returning user data
      return res.status(200).json({ status: true, data: user });
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
      const user = await AdminService.createUser(payload);

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
      const { userID } = req.params;

      // new data to update user
      const payload = req.body;

      // updating user in service layer
      const user = await AdminService.updateUser(userID, payload);

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
      const { userID } = req.params;

      // deleting user through service
      const user = await AdminService.deleteUser(userID);

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
