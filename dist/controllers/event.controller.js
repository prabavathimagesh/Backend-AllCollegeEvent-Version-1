"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("../services/event.service");
class EventController {
    static async createEvent(req, res) {
        try {
            const { org_id, event_title, description, event_date, event_time, mode, venue, } = req.body;
            const org_id1 = Number(org_id);
            const image = req.file ? req.file.filename : null;
            const event = await event_service_1.EventService.createEventService({
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
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    static async getAllEvents(req, res) {
        try {
            const events = await event_service_1.EventService.getAllEventsService();
            res.status(200).json({ success: true, events });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    static async getEventById(req, res) {
        try {
            const id = Number(req.params.id);
            const event = await event_service_1.EventService.getEventByIdService(id);
            if (!event)
                return res
                    .status(404)
                    .json({ success: false, message: "Event not found" });
            res.status(200).json({ success: true, event });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    static async updateEvent(req, res) {
        try {
            const id = Number(req.params.id);
            const { event_title, description, event_date, event_time, mode, venue } = req.body;
            const image = req.file ? req.file.filename : undefined;
            const updated = await event_service_1.EventService.updateEventService(id, {
                event_title,
                description,
                event_date,
                event_time,
                mode,
                image,
                venue,
            });
            res.status(200).json({ success: true, updated });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    static async deleteEvent(req, res) {
        try {
            const id = Number(req.params.id);
            await event_service_1.EventService.deleteEventService(id);
            res
                .status(200)
                .json({ success: true, message: "Event deleted successfully" });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
}
exports.EventController = EventController;
