import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event.service";
import { EVENT_MESSAGES } from "../constants/event.message";

export class EventController {
static async getOrgEvents(req: Request, res: Response) {
  try {
    const identity = String(req.params.orgId);

    if (!identity) {
      return res.status(200).json({
        status: false,
        message: EVENT_MESSAGES.ORG_ID_REQUIRED,
      });
    }

    const events = await EventService.getEventsByOrg(identity);

    return res.status(200).json({
      status: true,
      data: events,
      message: EVENT_MESSAGES.EVENTS_FETCHED,
    });

  } catch (err: any) {

    const safeErrors = [
      EVENT_MESSAGES.ORG_ID_REQUIRED,
      EVENT_MESSAGES.EVENTS_NOT_FOUND,
    ];

    // known / business errors → 200
    if (safeErrors.includes(err.message)) {
      return res.status(200).json({
        status: false,
        message: err.message,
      });
    }

    // unknown / system errors → 500
    return res.status(500).json({
      status: false,
      message: EVENT_MESSAGES.INTERNAL_ERROR,
      error: err.message,
    });
  }
}


  static async getEventById(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;
      const event = await EventService.getEventById(orgId, eventId);

      if (!event) {
        return res.status(404).json({
          status: false,
          message: EVENT_MESSAGES.EVENT_NOT_FOUND,
        });
      }

      res.json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { event_title, description, event_date, event_time, mode, venue } =
        req.body;

      const image = req.file ? `/uploads/${req.file.filename}` : null;

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

      res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_CREATED,
      });
    } catch (err) {
      res
        .status(400)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;

      const result = await EventService.updateEvent(orgId, eventId, {
        ...req.body,
        ...(image && { bannerImage: image }),
      });

      res.json({
        status: true,
        data: result,
        message: EVENT_MESSAGES.EVENT_UPDATED,
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;

      const deleted = await EventService.deleteEvent(orgId, eventId);

      res.json({
        status: true,
        data: deleted,
        message: EVENT_MESSAGES.EVENT_DELETED,
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await EventService.getAllEventsService();

      res.status(200).json({
        status: true,
        data: events,
        message: EVENT_MESSAGES.ALL_EVENTS_FETCHED,
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async getSingleEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await EventService.getSingleEventsService(eventId);

      res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  static async getStatuses(req: Request, res: Response) {
    try {
      const statuses = EventService.getAllStatuses();

      return res.status(200).json({
        status: true,
        data: statuses,
        message: EVENT_MESSAGES.EVENT_LIST_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
        error: err.message,
      });
    }
  }
}
