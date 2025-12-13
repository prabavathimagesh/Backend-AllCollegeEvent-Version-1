import { Router } from "express";
import adminAuth from "../../middlewares/adminAuth";
import { AdminUserController } from "../../controllers/admin/admin.user.controller";
import { validate } from "../../utils/validate";
import { userValidation } from "../../validations/user.validation";

const router = Router();

// admin user CRUD
router.get("/users", AdminUserController.listUsers);
router.get("/users/:userId",validate(userValidation.getSingle), AdminUserController.getUser);
router.post("/user", AdminUserController.createUser);
router.put("/user/:userId", validate(userValidation.update),AdminUserController.updateUser);
router.delete("/user/:userId", validate(userValidation.deleteUser),AdminUserController.deleteUser);

export default router;
