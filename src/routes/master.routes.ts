import { Router } from "express";
import { AcePerkController } from "../controllers/master/acePerk.controller";
import { AceCertificationController } from "../controllers/master/aceCertification.controller";
import { AceCategoryTypeController } from "../controllers/master/aceCategoryType.controller";
import { AceEventTypesController } from "../controllers/master/aceEventTypes.controller";
import { AceAccommodationController } from "../controllers/master/aceAccommodation.controller";
import { OrgCategoryController } from "../controllers/master/orgCategory.controller";

const router = Router();

// Perks
router.post("/perks", AcePerkController.create);
router.get("/perks", AcePerkController.getAll);
router.get("/perks/:id", AcePerkController.getOne);
router.put("/perks/:id", AcePerkController.update);
router.delete("/perks/:id", AcePerkController.delete);

// Certifications
router.post("/certifications", AceCertificationController.create);
router.get("/certifications", AceCertificationController.getAll);
router.put("/certifications/:id", AceCertificationController.update);
router.delete("/certifications/:id", AceCertificationController.delete);

// Category Types
router.post("/categories", AceCategoryTypeController.create);
router.get("/categories", AceCategoryTypeController.getAll);

// Event Types
router.post("/event-types", AceEventTypesController.create);
router.get("/event-types/:categoryId", AceEventTypesController.getByCategory);
router.get("/event-types", AceEventTypesController.getAll);

// Accommodation
router.post("/accommodations", AceAccommodationController.create);
router.get("/accommodations", AceAccommodationController.getAll);

// Org Category
router.post("/org-categories", OrgCategoryController.create);
router.get("/org-categories", OrgCategoryController.getAll);

export default router;
