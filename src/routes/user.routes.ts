import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../utils/validate";
import { userValidation } from "../validations/user.validation";

const router = Router();

/**
 * @route GET /api/v1/users
 * @desc  Get all users
 */
router.get("/users", authMiddleware, UserController.getAllUsers);

/**
 * @route GET /api/v1/users/:userId
 * @desc  Get a single user by ID
 */
router.get(
  "/users/:userId",
  authMiddleware,
  validate(userValidation.getSingle),
  UserController.getUserById
);

/**
 * @route PUT /api/v1/user/:userId
 * @desc  Update user details
 */
router.put(
  "/user/:userId",
  authMiddleware,
  validate(userValidation.update),
  UserController.updateUser
);

/**
 * @route DELETE /api/v1/user/:userId
 * @desc  Delete a user (soft delete or hard delete based on logic)
 */
router.delete(
  "/user/:userId",
  authMiddleware,
  validate(userValidation.deleteUser),
  UserController.deleteUser
);

export default router;
