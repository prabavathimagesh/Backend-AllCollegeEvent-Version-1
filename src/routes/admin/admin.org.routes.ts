import { Router } from "express";
import { AdminOrgController } from "../../controllers/admin/admin.org.controller";
import upload from "../../middlewares/fileUpload";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validate } from "../../utils/validate";
import { orgValidation } from "../../validations/org.validation";

const router = Router();

/**
 * @route GET /api/v1/organizations
 * @desc  Get list of all organizations
 */
router.get("/organizations", AdminOrgController.listOrg);

/**
 * @route GET /api/v1/organizations/:orgId
 * @desc  Get details of a single organization by ID
 */
router.get("/organizations/:orgId", validate(orgValidation.getSingle),AdminOrgController.getOrg);

/**
 * @route GET /api/v1/organizations/:orgId
 * @desc  Get details of a single organization by ID
 */
router.post("/organization", validate(orgValidation.getSingle),AdminOrgController.createOrg);

/**
 * @route PUT /api/v1/organizations/:orgId
 * @desc  Update organization details
 */
router.put("/organizations/:orgId", validate(orgValidation.update) ,AdminOrgController.updateOrg);

/**
 * @route DELETE /api/v1/organizations/:orgId
 * @desc  Delete an organization (soft delete or hard delete based on logic)
 */
router.delete("/organizations/:orgId", validate(orgValidation.deleteOrg),AdminOrgController.deleteOrg);

export default router;
