"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma = require("../config/db.config");
class EventService {
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
    static async getEventsByOrg(identity) {
        const BASE_URL = process.env.BASE_URL ?? "";
        // fetching all events created by a specific organization
        const events = await prisma.event.findMany({
            where: {
                orgIdentity: identity,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                org: {
                    select: {
                        organizationName: true,
                    },
                },
            },
        });
        // mapping image URLs to include full base URL
        return events.map((event) => ({
            ...event,
            bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
        }));
    }
    static async getAllEventsService() {
        const BASE_URL = process.env.BASE_URL ?? "";
        // fetching all events across all organizations
        const rawEvents = await prisma.event.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                org: {
                    select: {
                        organizationName: true,
                    },
                },
            },
        });
        // converting image paths to include complete URL
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
}
exports.EventService = EventService;
