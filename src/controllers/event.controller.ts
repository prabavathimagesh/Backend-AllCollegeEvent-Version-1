import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event/event.service";
import { EVENT_MESSAGES } from "../constants/event.message";
import { uploadToS3 } from "../utils/s3Upload";
import { AuthRequest } from "../types/type";

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
      const identity = String(req.params.orgId);

      if (!identity) {
        return res.status(200).json({
          status: false,
          message: EVENT_MESSAGES.ORG_ID_REQUIRED,
        });
      }

      const result = await EventService.getEventsByOrg(identity);

      return res.status(200).json({
        status: true,
        count: result.count, // total events
        data: result.events, // events list
        message: EVENT_MESSAGES.EVENTS_FETCHED,
      });
    } catch (err: any) {
      const safeErrors = [
        EVENT_MESSAGES.ORG_ID_REQUIRED,
        EVENT_MESSAGES.EVENTS_NOT_FOUND,
      ];

      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

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
      const { orgId, eventId } = req.params;

      const event = await EventService.getEventById(orgId, eventId);

      if (!event) {
        return res.status(404).json({
          status: false,
          message: EVENT_MESSAGES.EVENT_NOT_FOUND,
        });
      }

      return res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Create a new event under an organization
   */

  static async createEvent(req: Request, res: Response) {
    try {
      const orgIdentity = req.params.orgId;

      if (!orgIdentity) {
        return res.status(400).json({
          success: false,
          message: "orgId is required",
        });
      }

      // ===== FILE HANDLING =====
      let bannerImages: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const uploaded = await uploadToS3(file, "events");
          bannerImages.push(uploaded.url);
        }
      }

      // ===== SAFE PARSER =====
      const parseJSON = <T>(value: any, fallback: T): T => {
        try {
          if (!value) return fallback;
          if (Array.isArray(value)) value = value[value.length - 1];
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      };

      // ===== NORMALIZED PAYLOAD =====
      const payload = {
        orgIdentity,
        createdBy: req.body.createdBy ? Number(req.body.createdBy) : null,

        title: req.body.title,
        description: req.body.description,
        mode: req.body.mode,
        categoryIdentity: req.body.categoryIdentity,
        eventTypeIdentity: req.body.eventTypeIdentity,

        certIdentity: req.body.certIdentity || null,

        eligibleDeptIdentities: parseJSON(req.body.eligibleDeptIdentities, []),
        tags: parseJSON(req.body.tags, []),

        collaborators: parseJSON(req.body.collaborators, []), // NEW STRUCTURE
        calendars: parseJSON(req.body.calendars, []),
        tickets: parseJSON(req.body.tickets, []),

        perkIdentities: parseJSON(req.body.perkIdentities, []),
        accommodationIdentities: parseJSON(
          req.body.accommodationIdentities,
          []
        ),

        location: parseJSON(req.body.location, {}),
        bannerImages,
        eventLink: req.body.eventLink,
        paymentLink: req.body.paymentLink,
        socialLinks: parseJSON(req.body.socialLinks, {}),
      };

      const event = await EventService.createEvent(payload);

      res.status(200).json({ success: true, data: event });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
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
      const events = await EventService.getAllEventsService();

      return res.status(200).json({
        status: true,
        data: events,
        message: EVENT_MESSAGES.ALL_EVENTS_FETCHED,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Get a single public event by event ID
   */
  static async getSingleEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await EventService.getSingleEventsService(eventId);

      if (!event) {
        return res.status(404).json({
          status: false,
          message: EVENT_MESSAGES.EVENT_NOT_FOUND,
        });
      }

      return res.status(200).json({
        status: true,
        data: event,
        message: EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: EVENT_MESSAGES.INTERNAL_ERROR,
      });
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

  // New Event and Draft Based Controllers

  static async createDraft(req: Request, res: Response) {
    if (!req.user || !(req.user as any).data) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = (req.user as any).data;

    const userId = decoded.id; // number
    const orgIdentity = decoded.identity; // UUID string

    const event = await EventService.createDraftEvent(userId, orgIdentity);

    res.status(201).json(event);
  }

  static async autoSave(req: Request, res: Response) {
    await EventService.autoSaveEvent(req.params.id, req.body);
    res.json({ success: true });
  }

  static async publishEvent(req: Request, res: Response) {
    const event = await EventService.publishEvent(req.params.id, req.body);
    res.json({ success: true, data: event });
  }
}
