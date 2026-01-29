import { Router } from "express";
import { AcePerkController } from "../controllers/master/acePerk.controller";
import { AceCertificationController } from "../controllers/master/aceCertification.controller";
import { AceCategoryTypeController } from "../controllers/master/aceCategoryType.controller";
import { AceEventTypesController } from "../controllers/master/aceEventTypes.controller";
import { AceAccommodationController } from "../controllers/master/aceAccommodation.controller";
import { OrgCategoryController } from "../controllers/master/orgCategory.controller";
import DepartmentController from "../controllers/master/department.controller";
import upload from "../middlewares/fileUpload";

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
router.get("/categories/:id", AceCategoryTypeController.getOne);
router.put("/categories/:id", AceCategoryTypeController.update);
router.delete("/categories/:id", AceCategoryTypeController.delete);

// Event Types
router.post(
  "/event-types",
  upload.single("image"), // single file field name = image
  AceEventTypesController.create
);
router.get("/event-types", AceEventTypesController.getAll);
router.get("/event-types/category/:categoryId", AceEventTypesController.getByCategory);
router.get("/event-types/:id", AceEventTypesController.getOne);
router.put(
  "/event-types/:id",
  upload.single("image"), // multer middleware
  AceEventTypesController.update
);
router.delete("/event-types/:id", AceEventTypesController.delete);

// Accommodation
router.post("/accommodations", AceAccommodationController.create);
router.get("/accommodations", AceAccommodationController.getAll);
router.get("/accommodations/:id", AceAccommodationController.getById);
router.put("/accommodations/:id", AceAccommodationController.update);
router.delete("/accommodations/:id", AceAccommodationController.delete);

// Org Category
router.post("/org-categories", OrgCategoryController.create);
router.get("/org-categories", OrgCategoryController.getAll);
router.get("/org-categories/:id", OrgCategoryController.getById);
router.put("/org-categories/:id", OrgCategoryController.update);
router.delete("/org-categories/:id", OrgCategoryController.delete);

// Departments
router.post("/departments", DepartmentController.createDepartment);
router.get("/departments", DepartmentController.getDepartments);
router.get("/departments/:id", DepartmentController.getDepartmentById);
router.put("/departments/:id", DepartmentController.updateDepartment);
router.delete("/departments/:id", DepartmentController.deleteDepartment);

// Eligible Departments
router.post("/eligible-departments", DepartmentController.createEligibleDepartment);
router.get("/eligible-departments", DepartmentController.getEligibleDepartments);
router.get("/eligible-departments/:id", DepartmentController.getEligibleDepartmentById);
router.put("/eligible-departments/:id", DepartmentController.updateEligibleDepartment);
router.delete("/eligible-departments/:id", DepartmentController.deleteEligibleDepartment);


export default router;

