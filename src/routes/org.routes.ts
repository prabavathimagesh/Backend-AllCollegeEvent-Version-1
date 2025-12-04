import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import upload from "../middlewares/fileUpload";

const router = Router();
 
// Events & Org
router.post("/eve/create", upload.single("image"), OrgController.createEvent);
router.get("/eve", OrgController.getAllEvents);

router.get("/", OrgController.getAllOrgs);
router.get("/:id", OrgController.getOrgById);
router.put("/:id", OrgController.updateOrg);
router.delete("/:id", OrgController.deleteOrg);

router.get("/:id/eve", OrgController.getOrgEvents);
router.get("/:orgId/eve/:eventId", OrgController.getEventById);
router.put(
  "/:orgId/eve/:eventId",
  upload.single("image"),
  OrgController.updateEvent
);
router.delete("/:orgId/eve/:eventId", OrgController.deleteEvent);

export default router;
