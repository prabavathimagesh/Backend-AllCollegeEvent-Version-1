import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event.service";

export class EventController {
  static async getOrgEvents(req: Request, res: Response) {
    try {
      // extracting organization id from route params
      const identity = String(req.params.orgId);

      // fetching all events for the given organization
      const events = await EventService.getEventsByOrg(identity);

      // returning event list response
      res.json({ status: true, data: events, message: "Events fetched" });
    } catch (err: any) {
      // internal error during fetching organization events
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      // extracting organization id and event id from params
      const { orgId, eventId } = req.params;

      // fetching a single event based on org and event id
      const event = await EventService.getEventById(orgId, eventId);

      // checking if event exists
      if (!event) {
        return res.status(404).json({
          status: false,
          message: "Event not found",
        });
      }

      // event fetched successfully
      res.json({ status: true, data: event, message: "event fetched" });
    } catch (err: any) {
      // error while fetching event
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      // extracting event details from request body
      const { event_title, description, event_date, event_time, mode, venue } =
        req.body;

      // extracting organization id for event creation
      const { orgId } = req.params;

      // handling event image upload
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      // creating event through service layer
      const event = await EventService.createEventService({
        org_id: orgId,
        event_title,
        description,
        event_date,
        event_time,
        mode,
        image,
        venue,
      });

      // sending event creation success response
      res
        .status(200)
        .json({ status: true, data: event, message: "event created" });
    } catch (err: any) {
      // error during event creation
      res.status(400).json({ status: false, message: err.message });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      // extracting organization id and event id for update
      const { orgId, eventId } = req.params;

      // processing banner image if uploaded
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;

      // updating event details
      const result = await EventService.updateEvent(orgId, eventId, {
        ...req.body,
        ...(image && { bannerImage: image }),
      });

      // sending update success response
      res.json({ status: true, data: result, message: "event updated" });
    } catch (err: any) {
      // internal server error while updating event
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      // extracting event and organization id for deletion
      const { orgId, eventId } = req.params;

      // deleting event using service
      const deleted = await EventService.deleteEvent(orgId, eventId);

      // sending deletion success response
      res.json({ status: true, data: deleted, message: "event deleted" });
    } catch (err: any) {
      // error during event deletion
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      // fetching all events from database
      const events = await EventService.getAllEventsService();

      // returning list of all events
      res
        .status(200)
        .json({ status: true, data: events, message: "All events fetched" });
    } catch (err: any) {
      // error during fetching all events
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getSingleEvent(req: Request, res: Response) {
    try {
      // extracting event id from route params
      const { eventId } = req.params;

      // fetching the single event based on id
      const events = await EventService.getSingleEventsService(eventId);

      // returning event details
      res
        .status(200)
        .json({ status: true, data: events, message: "Event fetched" });
    } catch (err: any) {
      // internal error fetching single event
      res.status(500).json({ status: false, message: err.message });
    }
  }
}
