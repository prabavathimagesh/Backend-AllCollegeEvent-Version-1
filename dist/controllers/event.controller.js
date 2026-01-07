"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("../services/event/event.service");
const event_message_1 = require("../constants/event.message");
const s3Upload_1 = require("../utils/s3Upload");
/**
 * Event Controller
 * Handles event-related API requests
 */
class EventController {
    /**
     * Get all events of a specific organization (Public / Org view)
     */
    static async getOrgEvents(req, res) {
        try {
            const identity = String(req.params.orgId);
            if (!identity) {
                return res.status(200).json({
                    status: false,
                    message: event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED,
                });
            }
            const result = await event_service_1.EventService.getEventsByOrg(identity);
            return res.status(200).json({
                status: true,
                count: result.count, // total events
                data: result.events, // events list
                message: event_message_1.EVENT_MESSAGES.EVENTS_FETCHED,
            });
        }
        catch (err) {
            const safeErrors = [
                event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED,
                event_message_1.EVENT_MESSAGES.EVENTS_NOT_FOUND,
            ];
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Get a single event by organization and event ID
     */
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
            return res.status(200).json({
                status: true,
                data: event,
                message: event_message_1.EVENT_MESSAGES.EVENT_FETCHED,
            });
        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
            });
        }
    }
    /**
     * Create a new event under an organization
     */
    static async createEvent(req, res) {
        try {
            const orgIdentity = req.params.orgId;
            if (!orgIdentity) {
                return res.status(400).json({
                    success: false,
                    message: "orgId is required",
                });
            }
            // ===== FILE HANDLING =====
            let bannerImages = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const uploaded = await (0, s3Upload_1.uploadToS3)(file, "events");
                    bannerImages.push(uploaded.url);
                }
            }
            // ===== SAFE PARSER =====
            const parseJSON = (value, fallback) => {
                try {
                    if (!value)
                        return fallback;
                    if (Array.isArray(value))
                        value = value[value.length - 1];
                    return JSON.parse(value);
                }
                catch {
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
                accommodationIdentities: parseJSON(req.body.accommodationIdentities, []),
                location: parseJSON(req.body.location, {}),
                bannerImages,
                eventLink: req.body.eventLink,
                paymentLink: req.body.paymentLink,
                socialLinks: parseJSON(req.body.socialLinks, {}),
            };
            const event = await event_service_1.EventService.createEvent(payload);
            res.status(200).json({ success: true, data: event });
        }
        catch (err) {
            const safeErrors = [event_message_1.EVENT_MESSAGES.ORGANIZER_NUMBER_REQUIRED];
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
    /**
     * Update an existing event
     */
    static async updateEvent(req, res) {
        try {
            const { eventIdentity } = req.params;
            if (!eventIdentity) {
                return res.status(200).json({
                    success: false,
                    message: event_message_1.EVENT_MESSAGES.EVENT_ID_REQUIRED,
                });
            }
            /* ---------- PARSE JSON FIELDS ---------- */
            const existingBannerImages = req.body.existingBannerImages
                ? JSON.parse(req.body.existingBannerImages)
                : [];
            const perkIdentities = req.body.perkIdentities
                ? JSON.parse(req.body.perkIdentities)
                : [];
            const accommodationIdentities = req.body.accommodationIdentities
                ? JSON.parse(req.body.accommodationIdentities)
                : [];
            const collaborators = req.body.collaborators
                ? JSON.parse(req.body.collaborators)
                : [];
            /* ---------- UPLOAD NEW IMAGES ---------- */
            const newBannerUrls = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const uploaded = await (0, s3Upload_1.uploadToS3)(file, "events");
                    newBannerUrls.push(uploaded.url);
                }
            }
            const payload = {
                ...req.body,
                existingBannerImages,
                newBannerUrls,
                perkIdentities,
                accommodationIdentities,
                collaborators,
            };
            const data = await event_service_1.EventService.updateEvent(eventIdentity, payload);
            return res.status(200).json({ success: true, data });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    /**
     * Delete an event
     */
    static async deleteEvent(req, res) {
        try {
            // Extract route params
            const { orgId, eventId } = req.params;
            // Delete event
            const deleted = await event_service_1.EventService.deleteEvent(orgId, eventId);
            // Success response
            res.json({
                status: true,
                data: deleted,
                message: event_message_1.EVENT_MESSAGES.EVENT_DELETED,
            });
        }
        catch (err) {
            // Internal server error
            res
                .status(500)
                .json({ status: false, message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR });
        }
    }
    /**
     * Get all events (Admin / Public listing)
     */
    static async getAllEvents(req, res) {
        try {
            const events = await event_service_1.EventService.getAllEventsService();
            return res.status(200).json({
                status: true,
                data: events,
                message: event_message_1.EVENT_MESSAGES.ALL_EVENTS_FETCHED,
            });
        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
            });
        }
    }
    /**
     * Get a single public event by event ID
     */
    static async getSingleEvent(req, res) {
        try {
            const { eventId } = req.params;
            const event = await event_service_1.EventService.getSingleEventsService(eventId);
            if (!event) {
                return res.status(404).json({
                    status: false,
                    message: event_message_1.EVENT_MESSAGES.EVENT_NOT_FOUND,
                });
            }
            return res.status(200).json({
                status: true,
                data: event,
                message: event_message_1.EVENT_MESSAGES.EVENT_FETCHED,
            });
        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
            });
        }
    }
    /**
     * Get all available event statuses
     */
    static async getStatuses(req, res) {
        try {
            // Fetch status list
            const statuses = event_service_1.EventService.getAllStatuses();
            // Success response
            return res.status(200).json({
                status: true,
                data: statuses,
                message: event_message_1.EVENT_MESSAGES.EVENT_LIST_FETCHED,
            });
        }
        catch (err) {
            // Internal server error
            return res.status(500).json({
                status: false,
                message: event_message_1.EVENT_MESSAGES.INTERNAL_ERROR,
                error: err.message,
            });
        }
    }
    // New Event and Draft Based Controllers
    static async createDraft(req, res) {
        if (!req.user || !req.user.data) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = req.user.data;
        const userId = decoded.id; // number
        const orgIdentity = decoded.identity; // UUID string
        const event = await event_service_1.EventService.createDraftEvent(userId, orgIdentity);
        res.status(201).json(event);
    }
    static async autoSave(req, res) {
        await event_service_1.EventService.autoSaveEvent(req.params.id, req.body);
        res.json({ success: true });
    }
    static async publishEvent(req, res) {
        const event = await event_service_1.EventService.publishEvent(req.params.id, req.body);
        res.json({ success: true, data: event });
    }
}
exports.EventController = EventController;
