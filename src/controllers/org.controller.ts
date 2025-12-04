import { Request, Response, NextFunction } from "express";
import { OrgService } from "../services/org.service";

export class OrgController {
  // Events
  static async createEvent(req: Request, res: Response) {
    try {
      const {
        org_id,
        event_title,
        description,
        event_date,
        event_time,
        mode,
        venue,
      } = req.body;

      const image = req.file ? req.file.filename : null;

      const event = await OrgService.createEventService({
        org_id,
        event_title,
        description,
        event_date,
        event_time,
        mode,
        image,
        venue,
      });

      res.status(200).json({ success: true, event });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await OrgService.getAllEventsService();
      res.status(200).json({ success: true, events });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);

      const event = await OrgService.getEventByIdService(id);

      if (!event)
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });

      res.status(200).json({ success: true, event });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const id = String(req.params.id);

      const { event_title, description, event_date, event_time, mode, venue } =
        req.body;

      const image = req.file ? req.file.filename : undefined;

      const updated = await OrgService.updateEventService(id, {
        event_title,
        description,
        event_date,
        event_time,
        mode,
        image,
        venue,
      });

      res.status(200).json({ success: true, updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const id = String(req.params.id);

      await OrgService.deleteEventService(id);

      res
        .status(200)
        .json({ success: true, message: "Event deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Orgs
  static async getAllOrgs(req: Request, res: Response) {
    try {
      const data = await OrgService.getAllOrgs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getOrgById(req: Request, res: Response) {
    try {
      const identity = req.params.identity;
      const data = await OrgService.getOrgById(identity);

      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Organization not found" });
      }

      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateOrg(req: Request, res: Response) {
    try {
      const identity = req.params.identity;
      const updatedData = req.body;

      const result = await OrgService.updateOrg(identity, updatedData);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteOrg(req: Request, res: Response) {
    try {
      const identity = req.params.identity;

      const result = await OrgService.deleteOrg(identity);
      res.json({ success: true, message: "Organization deleted", result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
