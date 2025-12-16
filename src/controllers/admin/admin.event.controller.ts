import { Request, Response } from "express";
import AdminEventService from "../../services/admin/admin.event.service";

export class AdminEventController {
  static async getAllEvents(req: Request, res: Response) {
    try {
      //fetch all events across all organizations
      const events = await AdminEventService.getAllEvents();
      res.json({ status: true, data: events, message: "All events fetched" });
    } catch (err: any) {
      //error fetching all events
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getEventsByOrg(req: Request, res: Response) {
    try {
      //extract organization id from params
      const { orgId } = req.params;

      //fetch all events for this organization
      const events = await AdminEventService.getEventsByOrg(orgId);

      res.json({ status: true, data: events, message: "Org events fetched" });
    } catch (err: any) {
      //error during fetch
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      //extract organization id and event id
      const { orgId, eventId } = req.params;

      //fetch specific event
      const event = await AdminEventService.getEventById(orgId, eventId);

      if (!event) {
        return res
          .status(404)
          .json({ status: false, message: "Event not found" });
      }

      res.json({ status: true, data: event, message: "Event fetched" });
    } catch (err: any) {
      //error retrieving event
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      //extract organization ID from params
      const { orgId } = req.params;

      //extract event data from request body
      const data = req.body;

      //handle image upload
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      //creating event
      const event = await AdminEventService.createEvent(orgId, {
        ...data,
        image,
      });

      res.json({ status: true, data: event, message: "Event created" });
    } catch (err: any) {
      //error while creating event
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      //extract IDs
      const { orgId, eventId } = req.params;

      //manage image upload
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;

      //prepare update payload
      const payload = { ...req.body, ...(image && { bannerImage: image }) };

      //update event
      const event = await AdminEventService.updateEvent(
        orgId,
        eventId,
        payload
      );

      res.json({ status: true, data: event, message: "Event updated" });
    } catch (err: any) {
      //update failed
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      //extract event identifiers
      const { orgId, eventId } = req.params;

      //delete event
      const deleted = await AdminEventService.deleteEvent(orgId, eventId);

      res.json({ status: true, data: deleted, message: "Event deleted" });
    } catch (err: any) {
      //failure deleting event
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async updateEventStatus(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { status } = req.body; // new status from frontend

      const updated = await AdminEventService.updateEventStatus(
        eventId,
        status
      );

      return res.status(200).json({
        status: true,
        data: updated,
        message: "Event status updated successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  }
}
