import { Request, Response } from "express";
import AdminUserService from "../../services/admin/admin.user.service";
import { ADMIN_USER_MESSAGES } from "../../constants/admin.user.message";

export class AdminUserController {

  static async listUsers(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await AdminUserService.listUsers(page, limit);

      return res.status(200).json({
        status: true,
        data: result,
        message: ADMIN_USER_MESSAGES.USER_LIST_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_USER_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await AdminUserService.getUserById(userId as string);

      // SAFE business error
      if (!user) {
        return res.status(200).json({
          status: false,
          message: ADMIN_USER_MESSAGES.USER_NOT_FOUND,
        });
      }

      return res.status(200).json({
        status: true,
        data: user,
        message: ADMIN_USER_MESSAGES.USER_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_USER_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const payload = req.body;
      const user = await AdminUserService.createUser(payload);

      return res.status(201).json({
        status: true,
        data: user,
        message: ADMIN_USER_MESSAGES.USER_CREATED,
      });
    } catch (err: any) {

      // SAFE business errors
      const safeErrors = [
        ADMIN_USER_MESSAGES.EMAIL_ALREADY_IN_USE,
        ADMIN_USER_MESSAGES.INVALID_ROLE_NAME,
        ADMIN_USER_MESSAGES.PASSWORD_REQUIRED,
      ];

      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors
      return res.status(500).json({
        status: false,
        message: ADMIN_USER_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const payload = req.body;

      const user = await AdminUserService.updateUser(userId as string, payload);

      return res.status(200).json({
        status: true,
        data: user,
        message: ADMIN_USER_MESSAGES.USER_UPDATED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_USER_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await AdminUserService.deleteUser(userId as string);

      return res.status(200).json({
        status: true,
        data: user,
        message: ADMIN_USER_MESSAGES.USER_DELETED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_USER_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }
}
