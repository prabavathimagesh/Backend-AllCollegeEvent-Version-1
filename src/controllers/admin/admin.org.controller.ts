import { Request, Response } from "express";
import AdminOrgService from "../../services/admin/admin.org.service";

export class AdminOrgController {

  static async listOrg(req: Request, res: Response) {
    try {
      //fetch all organizations for admin dashboard
      const data = await AdminOrgService.getAllOrgs();
      res.json({ status: true, data, message: "Organizations fetched" });
    } catch (err: any) {
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getOrg(req: Request, res: Response) {
    try {
      //extracting organization id from URL
      const { orgId } = req.params;

      //get single organization details
      const data = await AdminOrgService.getOrgById(orgId);

      if (!data) {
        return res.status(404).json({ status: false, message: "Organization not found" });
      }

      res.json({ status: true, data,message: "Organization fetched" });
    } catch (err: any) {
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async createOrg(req: Request, res: Response) {
    try {
      //request body contains org details
      const payload = req.body;

      //calling service to create new organization
      const result = await AdminOrgService.createOrg(payload);

      res.status(201).json({ status: true, data: result, message: "Organization created" });
    } catch (err: any) {
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async updateOrg(req: Request, res: Response) {
    try {
      //extracting org id
      const { orgId } = req.params;

      //incoming data to update fields
      const payload = req.body;

      //perform organization update
      const result = await AdminOrgService.updateOrg(orgId, payload);

      res.json({ status: true, data: result, message: "Organization updated" });
    } catch (err: any) {
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async deleteOrg(req: Request, res: Response) {
    try {
      //extract org id to delete
      const { orgId } = req.params;

      //soft delete organization
      const result = await AdminOrgService.deleteOrg(orgId);

      res.json({ status: true, data: result, message: "Organization deleted" });
    } catch (err: any) {
      res.status(400).json({ status: false, message: err.message });
    }
  }
}
