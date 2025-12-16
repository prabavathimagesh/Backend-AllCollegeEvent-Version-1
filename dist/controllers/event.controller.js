"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("../services/event.service");
const event_message_1 = require("../constants/event.message");
class EventController {
    static async getOrgEvents(req, res) {
        try {
            const identity = String(req.params.orgId);
            if (!identity) {
                return res.status(200).json({
                    status: false,
                    message: event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED,
                });
            }
            const events = await event_service_1.EventService.getEventsByOrg(identity);
            return res.status(200).json({
                status: true,
                data: events,
                message: event_message_1.EVENT_MESSAGES.EVENTS_FETCHED,
            });
        }
        catch (err) {
            const safeErrors = [
                event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED,
                event_message_1.EVENT_MESSAGES.EVENTS_NOT_FOUND,
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
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
                error: err.message,
            });
        }
    }
    static async getEventById(req, res) {
        try {
            const { orgId, eventId } = req.params;
            const event = await event_service_1.EventService.getEventById(orgId, eventId);
            if (!event) {
                return res.status(404).json({
                    status: false,
                    message: event_message_1.EVENT_MESSAGES.EVENT_NOT_FOUND,
                });
            }
            res.json({
                status: true,
                data: event,
                message: event_message_1.EVENT_MESSAGES.EVENT_FETCHED,
            });
        }
        catch (err) {
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async createEvent(req, res) {
        try {
            const { orgId } = req.params;
            const { event_title, description, event_date, event_time, mode, venue } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : null;
            const event = await event_service_1.EventService.createEventService({
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
                message: event_message_1.EVENT_MESSAGES.EVENT_CREATED,
            });
        }
        catch (err) {
            res
                .status(400)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async updateEvent(req, res) {
        try {
            const { orgId, eventId } = req.params;
            const image = req.file ? `/uploads/${req.file.filename}` : undefined;
            const result = await event_service_1.EventService.updateEvent(orgId, eventId, {
                ...req.body,
                ...(image && { bannerImage: image }),
            });
            res.json({
                status: true,
                data: result,
                message: event_message_1.EVENT_MESSAGES.EVENT_UPDATED,
            });
        }
        catch (err) {
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async deleteEvent(req, res) {
        try {
            const { orgId, eventId } = req.params;
            const deleted = await event_service_1.EventService.deleteEvent(orgId, eventId);
            res.json({
                status: true,
                data: deleted,
                message: event_message_1.EVENT_MESSAGES.EVENT_DELETED,
            });
        }
        catch (err) {
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async getAllEvents(req, res) {
        try {
            const events = await event_service_1.EventService.getAllEventsService();
            res.status(200).json({
                status: true,
                data: events,
                message: event_message_1.EVENT_MESSAGES.ALL_EVENTS_FETCHED,
            });
        }
        catch (err) {
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async getSingleEvent(req, res) {
        try {
            const { eventId } = req.params;
            const event = await event_service_1.EventService.getSingleEventsService(eventId);
            res.status(200).json({
                status: true,
                data: event,
                message: event_message_1.EVENT_MESSAGES.EVENT_FETCHED,
            });
        }
        catch (err) {
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    static async getStatuses(req, res) {
        try {
            const statuses = event_service_1.EventService.getAllStatuses();
            return res.status(200).json({
                status: true,
                data: statuses,
                message: event_message_1.EVENT_MESSAGES.EVENT_LIST_FETCHED,
            });
        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
                error: err.message,
            });
        }
    }
}
exports.EventController = EventController;
