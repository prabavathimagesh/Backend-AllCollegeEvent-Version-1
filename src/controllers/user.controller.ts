import { Request, Response } from "express";
import UserService from "../services/user.service";
import { USER_MESSAGES } from "../constants/user.message";

/**
 * User Controller
 * Handles user-related API requests
 */
export class UserController {

  /**
   * Get all users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      // Fetch all users from service
      const users = await UserService.getAllUsers();

      // Success response
      res.status(200).json({
        status: true,
        data: users,
        message: USER_MESSAGES.USERS_FETCHED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: USER_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      // Extract user ID from route params
      const identity = req.params.userId;

      // Fetch user details
      const user = await UserService.getUserById(identity as string);

      // Handle user not found
      if (!user) {
        return res.status(200).json({
          status: false,
          message: USER_MESSAGES.USER_NOT_FOUND,
        });
      }

      // Success response
      res.status(200).json({
        status: true,
        data: user,
        message: USER_MESSAGES.USER_FETCHED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: USER_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Update user details
   */
  static async updateUser(req: Request, res: Response) {
    try {
      // Extract user ID and request body
      const identity = req.params.userId;
      const body = req.body;

      // Update user data
      const updated = await UserService.updateUser(identity as string, body);

      // Success response
      res.status(200).json({
        status: true,
        data: updated,
        message: USER_MESSAGES.USER_UPDATED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: USER_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      // Extract user ID
      const identity = req.params.userId;

      // Delete user
      const deletedUser = await UserService.deleteUser(identity as string);

      // Success response
      res.status(200).json({
        status: true,
        data: deletedUser,
        message: USER_MESSAGES.USER_DELETED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: USER_MESSAGES.INTERNAL_ERROR,
      });
    }
  }
}
