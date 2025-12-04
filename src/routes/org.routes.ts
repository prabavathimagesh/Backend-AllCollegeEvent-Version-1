import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import upload from "../middlewares/fileUpload";

const router = Router();

// Events
router.post("/eve/create", upload.single("image") ,OrgController.createEvent);
router.get("/eve/", OrgController.getAllEvents);
router.get("/eve/:id", OrgController.getEventById);
router.put("/eve/:id", upload.single("image"), OrgController.updateEvent);
router.delete("/eve/:id", OrgController.deleteEvent);

// Org
router.get("/", OrgController.getAllOrgs);
router.get("/:identity", OrgController.getOrgById);
router.put("/:identity", OrgController.updateOrg);
router.delete("/:identity", OrgController.deleteOrg);

module.exports = router;