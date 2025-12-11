import { Router } from "express";
import adminAuth from "../../middlewares/adminAuth";
import AdminAuthController from "../../controllers/admin/admin.auth.controller";

const router = Router();

// Auth
router.post("/auth/login", AdminAuthController.login);


export default router;
