import { Request, Response, NextFunction } from "express";
import { OrgService } from "../services/org.service";
import { ORG_MESSAGES } from "../constants/org.message";
import { EVENT_MESSAGES } from "../constants/event.message";

/**
 * Organization Controller
 * Handles organization-related API requests
 */
export class OrgController {
  /**
   * Get all organizations
   */
  static async getAllOrgs(req: Request, res: Response) {
    try {
      // Fetch all organizations
      const data = await OrgService.getAllOrgs();

      // Success response
      res.json({
        status: true,
        data,
        message: ORG_MESSAGES.ORGS_FETCHED,
      });
    } catch (err: any) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: ORG_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Get single organization by ID
   */
  static async getOrgById(req: Request, res: Response) {
    try {
      // Extract organization ID from params
      const identity = req.params.orgId;

      // Fetch organization details
      const data = await OrgService.getOrgById(identity);

      // Organization not found
      if (!data) {
        return res.status(404).json({
          status: false,
          message: ORG_MESSAGES.ORG_NOT_FOUND,
        });
      }

      // Success response
      res.json({
        status: true,
        data,
        message: ORG_MESSAGES.ORG_FETCHED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Update organization details
   */
  static async updateOrg(req: Request, res: Response) {
    try {
      // Extract organization ID
      const identity = req.params.orgId;

      // Updated organization data
      const updatedData = req.body;

      // Update organization
      const result = await OrgService.updateOrg(identity, updatedData);

      // Success response
      res.json({
        status: true,
        data: result,
        message: ORG_MESSAGES.ORG_UPDATED,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Delete an organization
   */
  static async deleteOrg(req: Request, res: Response) {
    try {
      // Extract organization ID
      const identity = req.params.orgId;

      // Delete organization
      const result = await OrgService.deleteOrg(identity);

      // Success response
      res.json({
        status: true,
        message: ORG_MESSAGES.ORG_DELETED,
        data: result,
      });
    } catch (err: any) {
      // Internal server error
      res.status(500).json({
        status: false,
        message: ORG_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Get all events created by an organization
   */
  static async getOrgEvents(req: Request, res: Response) {
    try {
      // Extract organization ID
      const identity = String(req.params.orgId);

      // Fetch events for organization
      const events = await OrgService.getEventsByOrganization(identity);

      // Success response
      res.json({
        status: true,
        data: events,
        message: EVENT_MESSAGES.EVENTS_FETCHED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }
}
