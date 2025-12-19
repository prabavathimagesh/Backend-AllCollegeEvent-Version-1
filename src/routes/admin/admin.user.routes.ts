import { Router } from "express";
import adminAuth from "../../middlewares/adminAuth";
import { AdminUserController } from "../../controllers/admin/admin.user.controller";
import { validate } from "../../utils/validate";
import { userValidation } from "../../validations/user.validation";
import { authMiddleware } from "../../middlewares/authMiddleware";

// Initialize router
const router = Router();

/**
 * ADMIN USER ROUTES
 * Handles CRUD operations for users (Admin access)
 */

// Get all users
router.get("/users", authMiddleware, AdminUserController.listUsers);

// Get single user by ID
router.get(
  "/users/:userId",
  authMiddleware,
  validate(userValidation.getSingle),
  AdminUserController.getUser
);

// Create a new user
router.post("/user", authMiddleware, AdminUserController.createUser);

// Update user details
router.put(
  "/user/:userId",
  authMiddleware,
  validate(userValidation.update),
  AdminUserController.updateUser
);

// Delete a user
router.delete(
  "/user/:userId",
  authMiddleware,
  validate(userValidation.deleteUser),
  AdminUserController.deleteUser
);

// Export router
export default router;
