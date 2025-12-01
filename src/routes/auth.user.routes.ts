import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);

router.get("/org/verify", AuthController.verifyOrg);

module.exports = router;
