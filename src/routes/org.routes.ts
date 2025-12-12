import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import upload from "../middlewares/fileUpload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../utils/validate";
import { orgValidation } from "../validations/org.validation";
import { eventValidation } from "../validations/event.validation";

const router = Router();

/**
 * @route GET /api/v1/organizations
 * @desc  Get list of all organizations
 */
router.get("/organizations", OrgController.getAllOrgs);

/**
 * @route GET /api/v1/organizations/:orgId
 * @desc  Get details of a single organization by ID
 */
router.get("/organizations/:orgId", validate(orgValidation.getSingle),OrgController.getOrgById);

/**
 * @route PUT /api/v1/organizations/:orgId
 * @desc  Update organization details
 */
router.put("/organizations/:orgId", validate(orgValidation.update) ,OrgController.updateOrg);

/**
 * @route DELETE /api/v1/organizations/:orgId
 * @desc  Delete an organization (soft delete or hard delete based on logic)
 */
router.delete("/organizations/:orgId", validate(orgValidation.deleteOrg),OrgController.deleteOrg);

router.get(
  "/organization/:orgId/events",
  validate(eventValidation.getAll),
  OrgController.getOrgEvents
);
export default router;
