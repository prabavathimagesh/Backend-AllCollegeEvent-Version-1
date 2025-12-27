"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma = require("../config/db.config");
const event_status_message_1 = require("../constants/event.status.message");
const event_message_1 = require("../constants/event.message");
const s3SignedUrl_1 = require("../utils/s3SignedUrl");
const cleanPayload_1 = require("../utils/cleanPayload");
function validateLocation(mode, location) {
    if (mode === "ONLINE") {
        if (!location.onlineMeetLink) {
            throw new Error("Online meet link is required");
        }
    }
    if (mode === "OFFLINE") {
        if (!location.country || !location.city || !location.mapLink) {
            throw new Error("Offline location details are required");
        }
    }
    if (mode === "HYBRID") {
        if (!location.onlineMeetLink ||
            !location.country ||
            !location.city ||
            !location.mapLink) {
            throw new Error("Both online and offline details are required");
        }
    }
}
class EventService {
    static async getEventsByOrg(identity) {
        if (!identity) {
            throw new Error(event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED);
        }
        const BASE_URL = process.env.BASE_URL ?? "";
        const events = await prisma.event.findMany({
            where: {
                orgIdentity: identity,
                status: event_message_1.EVENT_MESSAGES.APPROVED,
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
            bannerImage: (0, s3SignedUrl_1.getResolvedImageUrl)(event.bannerImage),
        }));
    }
    static async createEvent(payload) {
        return prisma.$transaction(async (tx) => {
            validateLocation(payload.mode, payload.location);
            // 1. Create Event
            const event = await tx.event.create({
                data: {
                    title: payload.title,
                    description: payload.description,
                    mode: payload.mode,
                    categoryIdentity: payload.categoryIdentity,
                    eventTypeIdentity: payload.eventTypeIdentity,
                    eligibleDeptIdentities: payload.eligibleDeptIdentities,
                    tags: payload.tags,
                    bannerImages: payload.bannerImages,
                    eventLink: payload.eventLink,
                    paymentLink: payload.paymentLink,
                    socialLinks: payload.socialLinks,
                    createdBy: payload.createdBy,
                    // REQUIRED RELATION
                    org: {
                        connect: { identity: payload.orgIdentity },
                    },
                },
            });
            const eventId = event.identity;
            // 2. Collaborators
            if (payload.collaborators?.length) {
                await tx.eventCollaborator.createMany({
                    data: payload.collaborators.map((c) => ({
                        ...c,
                        eventIdentity: eventId,
                    })),
                });
            }
            await tx.eventLocation.create({
                data: {
                    eventIdentity: event.identity,
                    onlineMeetLink: payload.location?.onlineMeetLink,
                    country: payload.location?.country,
                    state: payload.location?.state,
                    city: payload.location?.city,
                    mapLink: payload.location?.mapLink,
                },
            });
            // 3. Calendars
            if (payload.calendars?.length) {
                await tx.eventCalendar.createMany({
                    data: payload.calendars.map((c) => ({
                        ...c,
                        eventIdentity: eventId,
                    })),
                });
            }
            // 4. Tickets
            if (payload.tickets?.length) {
                await tx.ticket.createMany({
                    data: payload.tickets.map((t) => ({
                        ...t,
                        eventIdentity: eventId,
                    })),
                });
            }
            // 5. Perks
            if (payload.perkIdentities?.length) {
                await tx.eventPerk.createMany({
                    data: payload.perkIdentities.map((id) => ({
                        eventIdentity: eventId,
                        perkIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            // 6. Certifications
            if (payload.certIdentities?.length) {
                await tx.eventCertification.createMany({
                    data: payload.certIdentities.map((id) => ({
                        eventIdentity: eventId,
                        certIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            // 7. Accommodations
            if (payload.accommodationIdentities?.length) {
                await tx.eventAccommodation.createMany({
                    data: payload.accommodationIdentities.map((id) => ({
                        eventIdentity: eventId,
                        accommodationIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            return event;
        });
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
            bannerImage: (0, s3SignedUrl_1.getResolvedImageUrl)(event.bannerImage),
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
                status: event_message_1.EVENT_MESSAGES.APPROVED,
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
            bannerImage: (0, s3SignedUrl_1.getResolvedImageUrl)(e.bannerImage),
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
            bannerImage: (0, s3SignedUrl_1.getResolvedImageUrl)(rawEvent.bannerImage),
        };
        return event;
    }
    static getAllStatuses() {
        return event_status_message_1.EVENT_STATUS_LIST;
    }
    // Event & Draft Based Servcies
    static async createDraftEvent(userId, orgIdentity) {
        const existingDraft = await prisma.event.findFirst({
            where: {
                createdBy: userId,
                status: "DRAFT",
            },
        });
        if (existingDraft)
            return existingDraft;
        return prisma.event.create({
            data: {
                orgIdentity,
                createdBy: userId,
                status: "DRAFT",
                org: {
                    connect: {
                        identity: orgIdentity,
                    },
                },
            },
        });
    }
    static async autoSaveEvent(eventId, payload) {
        const data = (0, cleanPayload_1.cleanPayload)(payload);
        if (!Object.keys(data).length)
            return;
        await prisma.event.update({
            where: { identity: eventId },
            data,
        });
    }
    static async publishEvent(eventId, payload) {
        return prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { identity: eventId },
            });
            if (!event)
                throw new Error("Event not found");
            if (!event.title)
                throw new Error("Title is required");
            if (!event.mode)
                throw new Error("Mode is required");
            await tx.event.update({
                where: { identity: eventId },
                data: {
                    status: "PENDING",
                    publishedAt: new Date(),
                },
            });
            if (payload.collaborators?.length) {
                await tx.eventCollaborator.createMany({
                    data: payload.collaborators.map((c) => ({
                        ...c,
                        eventIdentity: eventId,
                    })),
                });
            }
            if (payload.calendars?.length) {
                await tx.eventCalendar.createMany({
                    data: payload.calendars.map((c) => ({
                        ...c,
                        eventIdentity: eventId,
                    })),
                });
            }
            if (payload.tickets?.length) {
                await tx.ticket.createMany({
                    data: payload.tickets.map((t) => ({
                        ...t,
                        eventIdentity: eventId,
                    })),
                });
            }
            if (payload.perkIdentities?.length) {
                await tx.eventPerk.createMany({
                    data: payload.perkIdentities.map((id) => ({
                        eventIdentity: eventId,
                        perkIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            if (payload.certIdentities?.length) {
                await tx.eventCertification.createMany({
                    data: payload.certIdentities.map((id) => ({
                        eventIdentity: eventId,
                        certIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            if (payload.accommodationIdentities?.length) {
                await tx.eventAccommodation.createMany({
                    data: payload.accommodationIdentities.map((id) => ({
                        eventIdentity: eventId,
                        accommodationIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            return eventId;
        });
    }
}
exports.EventService = EventService;
