"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma = require("../config/db.config");
const event_status_message_1 = require("../constants/event.status.message");
const event_message_1 = require("../constants/event.message");
class EventService {
    static async getEventsByOrg(identity) {
        if (!identity) {
            throw new Error(event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED);
        }
        const BASE_URL = process.env.BASE_URL ?? "";
        const events = await prisma.event.findMany({
            where: {
                orgIdentity: identity,
                status: "APPROVED",
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                org: {
                    select: {
                        organizationName: true,
                        organizationCategory: true,
                        city: true,
                        state: true,
                        country: true,
                        profileImage: true,
                        whatsapp: true,
                        instagram: true,
                        linkedIn: true,
                        logoUrl: true,
                    },
                },
            },
        });
        if (!events.length) {
            throw new Error(event_message_1.EVENT_MESSAGES.EVENTS_NOT_FOUND);
        }
        return events.map((event) => ({
            ...event,
            bannerImage: event.bannerImage
                ? `${BASE_URL}${event.bannerImage}`
                : null,
        }));
    }
    static async createEventService(data) {
        // creating new event record in database
        const event = await prisma.event.create({
            data: {
                orgIdentity: data.org_id,
                title: data.event_title,
                description: data.description,
                bannerImage: data.image,
                eventDate: data.event_date,
                eventTime: data.event_time,
                mode: data.mode,
                venue: data.venue,
            },
        });
        // returning created event object
        return event;
    }
    static async getEventById(orgId, eventId) {
        // base url used for generating full image path
        const BASE_URL = process.env.BASE_URL ?? "";
        // fetching specific event that belongs to given organization
        const event = await prisma.event.findFirst({
            where: {
                identity: eventId,
                orgIdentity: orgId,
            },
            include: {
                org: {
                    select: {
                        organizationName: true,
                        organizationCategory: true,
                        city: true,
                        state: true,
                        country: true,
                        profileImage: true,
                        whatsapp: true,
                        instagram: true,
                        linkedIn: true,
                        logoUrl: true,
                    },
                },
            },
        });
        // returning null if event is not found
        if (!event)
            return null;
        // mapping image url to include base URL
        return {
            ...event,
            bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
        };
    }
    static async updateEvent(orgId, eventId, data) {
        // updating event record based on event id and organization id
        return prisma.event.update({
            where: { identity: eventId, orgIdentity: orgId },
            data: {
                title: data.event_title,
                description: data.description,
                bannerImage: data.bannerImage ?? undefined,
                venueName: data.venueName ?? undefined,
                mode: data.mode,
                eventDate: data.event_date,
                eventTime: data.event_time,
                venue: data.venue,
                updatedAt: new Date(), // updating last modified timestamp
            },
        });
    }
    static async deleteEvent(orgId, eventId) {
        // deleting event that matches both event id and organization id
        return prisma.event.deleteMany({
            where: {
                identity: eventId,
                orgIdentity: orgId,
            },
        });
    }
    static async getAllEventsService() {
        const BASE_URL = process.env.BASE_URL ?? "";
        // fetch ONLY approved events
        const rawEvents = await prisma.event.findMany({
            where: {
                status: "APPROVED",
            },
            orderBy: { createdAt: "desc" },
            include: {
                org: {
                    select: {
                        organizationName: true,
                        organizationCategory: true,
                        city: true,
                        state: true,
                        country: true,
                        profileImage: true,
                        whatsapp: true,
                        instagram: true,
                        linkedIn: true, // <-- FIXED (case sensitive)
                        logoUrl: true,
                    },
                },
            },
        });
        // map full image path
        const events = rawEvents.map((e) => ({
            ...e,
            bannerImage: e.bannerImage ? `${BASE_URL}${e.bannerImage}` : null,
        }));
        return events;
    }
    static async getSingleEventsService(eventId) {
        const BASE_URL = process.env.BASE_URL ?? "";
        // fetching single event by its identity
        const rawEvent = await prisma.event.findUnique({
            where: { identity: eventId },
            include: {
                org: {
                    select: {
                        organizationName: true,
                        organizationCategory: true,
                        city: true,
                        state: true,
                        country: true,
                        profileImage: true,
                        whatsapp: true,
                        instagram: true,
                        linkedIn: true,
                        logoUrl: true,
                    },
                },
            },
        });
        // returning null if event doesn't exist
        if (!rawEvent)
            return null;
        // adding absolute image path
        const event = {
            ...rawEvent,
            bannerImage: rawEvent.bannerImage
                ? `${BASE_URL}${rawEvent.bannerImage}`
                : null,
        };
        return event;
    }
    static getAllStatuses() {
        return event_status_message_1.EVENT_STATUS_LIST;
    }
}
exports.EventService = EventService;
