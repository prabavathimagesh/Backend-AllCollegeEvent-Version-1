import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import adminAuth from "../middlewares/adminAuth";

const router = Router();

// Auth
router.post("/auth/login", AdminController.login);

// admin user CRUD
router.get("/users", AdminController.listUsers);
router.get("/users/:userID", AdminController.getUser);
router.post("/user", AdminController.createUser);
router.put("/user/:userID", AdminController.updateUser);
router.delete("/user/:userID", AdminController.deleteUser);

export default router;
