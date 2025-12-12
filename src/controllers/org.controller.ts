import { Request, Response, NextFunction } from "express";
import { OrgService } from "../services/org.service";
import { ORG_MESSAGES } from "../constants/org.message";
import { EVENT_MESSAGES } from "../constants/event.message";

export class OrgController {
  static async getAllOrgs(req: Request, res: Response) {
    try {
      const data = await OrgService.getAllOrgs();

      res.json({
        status: true,
        data,
        message: ORG_MESSAGES.ORGS_FETCHED,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ status: false, message: ORG_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async getOrgById(req: Request, res: Response) {
    try {
      const identity = req.params.orgId;

      const data = await OrgService.getOrgById(identity);

      if (!data) {
        return res.status(404).json({
          status: false,
          message: ORG_MESSAGES.ORG_NOT_FOUND,
        });
      }

      res.json({
        status: true,
        data,
        message: ORG_MESSAGES.ORG_FETCHED,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async updateOrg(req: Request, res: Response) {
    try {
      const identity = req.params.orgId;

      const updatedData = req.body;

      const result = await OrgService.updateOrg(identity, updatedData);

      res.json({
        status: true,
        data: result,
        message: ORG_MESSAGES.ORG_UPDATED,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  static async deleteOrg(req: Request, res: Response) {
    try {
      const identity = req.params.orgId;

      const result = await OrgService.deleteOrg(identity);

      res.json({
        status: true,
        message: ORG_MESSAGES.ORG_DELETED,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

   static async getOrgEvents(req: Request, res: Response) {
      try {
        const identity = String(req.params.orgId);
        const events = await OrgService.getEventsByOrganization(identity);
  
        res.json({
          status: true,
          data: events,
          message: EVENT_MESSAGES.EVENTS_FETCHED,
        });
      } catch (err) {
        res
          .status(500)
          .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
      }
    }
}

