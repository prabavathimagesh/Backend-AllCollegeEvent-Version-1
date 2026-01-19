import { Request, Response } from "express";
import AdminEventService from "../../services/admin/admin.event.service";
import { ADMIN_EVENT_MESSAGES } from "../../constants/admin.event.message";

export class AdminEventController {
  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await AdminEventService.getAllEvents();
      return res.status(200).json({
        status: true,
        data: events,
        message: ADMIN_EVENT_MESSAGES.ALL_EVENTS_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async getEventsByOrg(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const events = await AdminEventService.getEventsByOrg(orgId as string);

      return res.status(200).json({
        status: true,
        data: events,
        message: ADMIN_EVENT_MESSAGES.ORG_EVENTS_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;
      const event = await AdminEventService.getEventById(orgId as string, eventId as string);

      if (!event) {
        return res.status(200).json({
          status: false,
          message: ADMIN_EVENT_MESSAGES.EVENT_NOT_FOUND,
        });
      }

      return res.status(200).json({
        status: true,
        data: event,
        message: ADMIN_EVENT_MESSAGES.EVENT_FETCHED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const data = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      const event = await AdminEventService.createEvent(orgId as string, {
        ...data,
        image,
      });

      return res.status(200).json({
        status: true,
        data: event,
        message: ADMIN_EVENT_MESSAGES.EVENT_CREATED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const payload = { ...req.body, ...(image && { bannerImage: image }) };

      const event = await AdminEventService.updateEvent(
        orgId as string,
        eventId as string,
        payload,
      );

      return res.status(200).json({
        status: true,
        data: event,
        message: ADMIN_EVENT_MESSAGES.EVENT_UPDATED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const { orgId, eventId } = req.params;
      const deleted = await AdminEventService.deleteEvent(orgId as string, eventId as string);

      return res.status(200).json({
        status: true,
        data: deleted,
        message: ADMIN_EVENT_MESSAGES.EVENT_DELETED,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }

  static async updateEventStatus(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { status } = req.body;

      const updated = await AdminEventService.updateEventStatus(
        eventId as string,
        status,
      );

      return res.status(200).json({
        status: true,
        data: updated,
        message: ADMIN_EVENT_MESSAGES.EVENT_STATUS_UPDATED,
      });
    } catch (err: any) {
      // SAFE business errors
      const safeErrors = [
        ADMIN_EVENT_MESSAGES.INVALID_EVENT_STATUS,
        ADMIN_EVENT_MESSAGES.EVENT_NOT_FOUND,
      ];

      if (safeErrors.includes(err.message)) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      // System errors
      return res.status(500).json({
        status: false,
        message: ADMIN_EVENT_MESSAGES.INTERNAL_SERVER_ERROR,
        error: err.message,
      });
    }
  }
}
