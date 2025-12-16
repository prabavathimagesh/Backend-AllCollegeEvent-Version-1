import { Router } from "express";
import adminAuth from "../../middlewares/adminAuth";
import { AdminUserController } from "../../controllers/admin/admin.user.controller";
import { validate } from "../../utils/validate";
import { userValidation } from "../../validations/user.validation";

// Initialize router
const router = Router();

/**
 * ADMIN USER ROUTES
 * Handles CRUD operations for users (Admin access)
 */

// Get all users
router.get(
  "/users",
  AdminUserController.listUsers
);

// Get single user by ID
router.get(
  "/users/:userId",
  validate(userValidation.getSingle),
  AdminUserController.getUser
);

// Create a new user
router.post(
  "/user",
  AdminUserController.createUser
);

// Update user details
router.put(
  "/user/:userId",
  validate(userValidation.update),
  AdminUserController.updateUser
);

// Delete a user
router.delete(
  "/user/:userId",
  validate(userValidation.deleteUser),
  AdminUserController.deleteUser
);

// Export router
export default router;
