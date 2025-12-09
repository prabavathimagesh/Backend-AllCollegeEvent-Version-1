import { Request, Response, NextFunction } from "express";
import { OrgService } from "../services/org.service";

export class OrgController {
  static async getAllOrgs(req: Request, res: Response) {
    try {
      // fetching all organizations from service layer
      const data = await OrgService.getAllOrgs();

      // sending response with list of organizations
      res.json({ status: true, data, message: "All Organizarion" });
    } catch (err: any) {
      // internal server error during fetch
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getOrgById(req: Request, res: Response) {
    try {
      // extracting organization identity from request params
      const identity = req.params.orgId;

      // fetching organization details by identity
      const data = await OrgService.getOrgById(identity);

      // returning not found if org does not exist
      if (!data) {
        return res
          .status(404)
          .json({ status: false, message: "Organization not found" });
      }

      // organization result returned successfully
      res.json({ status: true, data, message: "organization fetched" });
    } catch (err: any) {
      // error while fetching organization
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async updateOrg(req: Request, res: Response) {
    try {
      // extracting org id to update
      const identity = req.params.orgId;

      // data received from client to update organization
      const updatedData = req.body;

      // performing update operation in service layer
      const result = await OrgService.updateOrg(identity, updatedData);

      // returning update confirmation to client
      res.json({ status: true, data: result, message: "organization updated" });
    } catch (err: any) {
      // server error during update operation
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async deleteOrg(req: Request, res: Response) {
    try {
      // extracting organization identity to delete
      const identity = req.params.orgId;

      // calling service to delete organization
      const result = await OrgService.deleteOrg(identity);

      // sending delete success response
      res.json({ status: true, message: "Organization deleted", data: result });
    } catch (err: any) {
      // internal server error during delete
      res.status(500).json({ status: false, message: err.message });
    }
  }
}
