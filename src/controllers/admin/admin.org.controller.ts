import { Request, Response } from "express";
import AdminOrgService from "../../services/admin/admin.org.service";
import { ADMIN_ORG_MESSAGES } from "../../constants/admin.org.message";

export class AdminOrgController {

  static async listOrg(req: Request, res: Response) {
    try {
      const data = await AdminOrgService.getAllOrgs();

      return res.status(200).json({
        status: true,
        data,
        message: ADMIN_ORG_MESSAGES.ORGS_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_ORG_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async getOrg(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = await AdminOrgService.getOrgById(orgId as string);

      // SAFE business error
      if (!data) {
        return res.status(200).json({
          status: false,
          message: ADMIN_ORG_MESSAGES.ORG_NOT_FOUND,
        });
      }

      return res.status(200).json({
        status: true,
        data,
        message: ADMIN_ORG_MESSAGES.ORG_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_ORG_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async createOrg(req: Request, res: Response) {
    try {
      const payload = req.body;
      const result = await AdminOrgService.createOrg(payload);

      return res.status(201).json({
        status: true,
        data: result,
        message: ADMIN_ORG_MESSAGES.ORG_CREATED,
      });
    } catch (err: any) {

      // SAFE business errors
      const safeErrors = [
        ADMIN_ORG_MESSAGES.ORG_ALREADY_EXISTS,
      ];

      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors
      return res.status(500).json({
        status: false,
        message: ADMIN_ORG_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async updateOrg(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const payload = req.body;

      const result = await AdminOrgService.updateOrg(orgId as string, payload);

      return res.status(200).json({
        status: true,
        data: result,
        message: ADMIN_ORG_MESSAGES.ORG_UPDATED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_ORG_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async deleteOrg(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const result = await AdminOrgService.deleteOrg(orgId as string);

      return res.status(200).json({
        status: true,
        data: result,
        message: ADMIN_ORG_MESSAGES.ORG_DELETED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_ORG_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }
}
