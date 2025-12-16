import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event.service";
import { EVENT_MESSAGES } from "../constants/event.message";

/**
 * Event Controller
 * Handles event-related API requests
 */
export class EventController {

  /**
   * Get all events of a specific organization (Public / Org view)
   */
  static async getOrgEvents(req: Request, res: Response) {
    try {
      // Extract organization ID from params
      const identity = String(req.params.orgId);

      // Validate organization ID
      if (!identity) {
        return res.status(200).json({
          status: false,
          message: EVENT_MESSAGES.ORG_ID_REQUIRED,
        });
      }

      // Fetch events for organization
      const events = await EventService.getEventsByOrg(identity);

      // Success response
      return res.status(200).json({
        status: true,
        data: events,
        message: EVENT_MESSAGES.EVENTS_FETCHED,
      });

    } catch (err: any) {

      // Known / business-level errors
      const safeErrors = [
        EVENT_MESSAGES.ORG_ID_REQUIRED,
        EVENT_MESSAGES.EVENTS_NOT_FOUND,
      ];

      // Known errors → return 200
      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // Unknown / system errors → return 500
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
        error: err.message,
      });
    }
  }

  /**
   * Get a single event by organization and event ID
   */
  static async getEventById(req: Request, res: Response) {
    try {
      // Extract route params
      const { orgId, eventId } = req.params;

      // Fetch event details
      const event = await EventService.getEventById(orgId, eventId);

      // Event not found
      if (!event) {
        return res.status(404).json({
          status: false,
          message: EVENT_MESSAGES.EVENT_NOT_FOUND,
        });
      }

      // Success response
      res.json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Create a new event under an organization
   */
  static async createEvent(req: Request, res: Response) {
    try {
      // Extract organization ID
      const { orgId } = req.params;

      // Extract event details from request body
      const { event_title, description, event_date, event_time, mode, venue } =
        req.body;

      // Handle optional image upload
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      // Create event
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

      // Success response
      res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_CREATED,
      });
    } catch (err) {
      // Internal error
      res
        .status(400)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(req: Request, res: Response) {
    try {
      // Extract route params
      const { orgId, eventId } = req.params;

      // Handle optional image upload
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;

      // Update event
      const result = await EventService.updateEvent(orgId, eventId, {
        ...req.body,
        ...(image && { bannerImage: image }),
      });

      // Success response
      res.json({
        status: true,
        data: result,
        message: EVENT_MESSAGES.EVENT_UPDATED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(req: Request, res: Response) {
    try {
      // Extract route params
      const { orgId, eventId } = req.params;

      // Delete event
      const deleted = await EventService.deleteEvent(orgId, eventId);

      // Success response
      res.json({
        status: true,
        data: deleted,
        message: EVENT_MESSAGES.EVENT_DELETED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Get all events (Admin / Public listing)
   */
  static async getAllEvents(req: Request, res: Response) {
    try {
      // Fetch all events
      const events = await EventService.getAllEventsService();

      // Success response
      res.status(200).json({
        status: true,
        data: events,
        message: EVENT_MESSAGES.ALL_EVENTS_FETCHED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Get a single public event by event ID
   */
  static async getSingleEvent(req: Request, res: Response) {
    try {
      // Extract event ID
      const { eventId } = req.params;

      // Fetch event details
      const event = await EventService.getSingleEventsService(eventId);

      // Success response
      res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      // Internal server error
      res
        .status(500)
        .json({ status: false, message: EVENT_MESSAGES.INTERNAL_ERROR });
    }
  }

  /**
   * Get all available event statuses
   */
  static async getStatuses(req: Request, res: Response) {
    try {
      // Fetch status list
      const statuses = EventService.getAllStatuses();

      // Success response
      return res.status(200).json({
        status: true,
        data: statuses,
        message: EVENT_MESSAGES.EVENT_LIST_FETCHED,
      });
    } catch (err: any) {
      // Internal server error
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
        error: err.message,
      });
    }
  }
}
