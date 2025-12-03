import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { EventService } from "../services/event.service";

export class EventController {
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

      const org_id1 = Number(org_id);
      
      const image = req.file ? req.file.filename : null;

      const event = await EventService.createEventService({
        org_id1,
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
      const events = await EventService.getAllEventsService();
      res.status(200).json({ success: true, events });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const event = await EventService.getEventByIdService(id);

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
      const id = Number(req.params.id);

      const { event_title, description, event_date, event_time, mode, venue } =
        req.body;

      const image = req.file ? req.file.filename : undefined;

      const updated = await EventService.updateEventService(id, {
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
      const id = Number(req.params.id);

      await EventService.deleteEventService(id);

      res
        .status(200)
        .json({ success: true, message: "Event deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
