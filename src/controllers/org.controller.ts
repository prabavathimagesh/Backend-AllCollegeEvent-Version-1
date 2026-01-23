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
      console.log(err)
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
      const data = await OrgService.getOrgById(identity as string);

      // Organization not found
      if (!data) {
        return res.status(200).json({
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
      const result = await OrgService.updateOrg(identity as string, updatedData);

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
      const result = await OrgService.deleteOrg(identity as string);

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
      const identity = String(req.params.orgId);

      const result = await OrgService.getEventsByOrganization(identity);

      return res.status(200).json({
        status: true,
        count: result.count, // total events
        data: result.events,
        message: EVENT_MESSAGES.EVENTS_FETCHED,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
      });
    }
  }


  static async followOrg(req: Request, res: Response) {
    try {
      const { orgIdentity } = req.body;

      if (!orgIdentity) {
        return res.status(400).json({
          status: false,
          message: "orgIdentity is required",
        });
      }

      // from JWT middleware
      const user = req.user as any;

      let followerType: "USER" | "ORG";
      let followerId: string;

      if (user.type === "user") {
        followerType = "USER";
        followerId = user.identity;
      } else {
        followerType = "ORG";
        followerId = user.identity;
      }

      const data = await OrgService.toggleFollow(
        followerType,
        followerId,
        orgIdentity
      );

      return res.status(200).json({
        status: true,
        message: data.followed
          ? "Followed successfully"
          : "Unfollowed successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async getFollowersAndFollowing(req: Request, res: Response) {
    try {
      const user = req.user as any;
      console.log(user)

      // Only org can access
      if (user.type !== "org") {
        return res.status(403).json({
          status: false,
          message: "Only organizations can access this API",
        });
      }

      const orgIdentity = user.identity;

      const data = await OrgService.getFollowersAndFollowing(orgIdentity);

      return res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
