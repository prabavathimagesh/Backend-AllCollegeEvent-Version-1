"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma = require("../config/db.config");
const event_status_message_1 = require("../constants/event.status.message");
const event_message_1 = require("../constants/event.message");
const cleanPayload_1 = require("../utils/cleanPayload");
const client_1 = require("@prisma/client");
const slug_1 = require("../utils/slug");
function validateLocation(mode, location) {
    // Normalize empty values
    if (!location || typeof location !== "object") {
        location = null;
    }
    if (mode === client_1.EventMode.ONLINE) {
        if (!location?.onlineMeetLink) {
            throw new Error(event_message_1.EVENT_MESSAGES.ONLINE_MEET_LINK_REQ);
        }
    }
    if (mode === client_1.EventMode.OFFLINE) {
        if (!location?.country ||
            !location?.state ||
            !location?.city ||
            !location?.mapLink) {
            throw new Error(event_message_1.EVENT_MESSAGES.OFFLINE_VALIDATION);
        }
    }
    if (mode === client_1.EventMode.HYBRID) {
        if (!location?.onlineMeetLink ||
            !location?.country ||
            !location?.state ||
            !location?.city ||
            !location?.mapLink) {
            throw new Error(event_message_1.EVENT_MESSAGES.ONLINE_OFFLINE_VALIDATION);
        }
    }
}
function buildOrgSocialUpdate(socialLinks) {
    const data = {};
    if (socialLinks?.whatsapp)
        data.whatsapp = socialLinks.whatsapp;
    if (socialLinks?.instagram)
        data.instagram = socialLinks.instagram;
    if (socialLinks?.linkedIn)
        data.linkedIn = socialLinks.linkedIn;
    return data;
}
class EventService {
    static async getEventsByOrg(identity) {
        if (!identity) {
            throw new Error(event_message_1.EVENT_MESSAGES.ORG_ID_REQUIRED);
        }
        /* ---------- 1. Fetch events ---------- */
        const events = await prisma.event.findMany({
            where: {
                orgIdentity: identity,
                status: event_message_1.EVENT_MESSAGES.APPROVED,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                org: true,
                cert: true,
                location: true,
                calendars: true,
                tickets: true,
                eventPerks: { include: { perk: true } },
                eventAccommodations: { include: { accommodation: true } },
                Collaborator: { include: { member: true } },
            },
        });
        if (events.length === 0) {
            throw new Error(event_message_1.EVENT_MESSAGES.EVENTS_NOT_FOUND);
        }
        /* ---------- 2. Count ---------- */
        const count = await prisma.event.count({
            where: {
                orgIdentity: identity,
                status: event_message_1.EVENT_MESSAGES.APPROVED,
            },
        });
        /* ---------- 3. Collect hostIdentity values ---------- */
        const hostIds = [];
        for (const ev of events) {
            for (const col of ev.Collaborator) {
                if (col.member.hostIdentity) {
                    hostIds.push(col.member.hostIdentity);
                }
            }
        }
        const uniqueHostIds = Array.from(new Set(hostIds));
        /* ---------- 4. Fetch org categories (for collaborators) ---------- */
        const orgCategories = await prisma.orgCategory.findMany({
            where: {
                identity: { in: uniqueHostIds },
            },
            select: {
                identity: true,
                categoryName: true,
            },
        });
        const hostCategoryMap = {};
        for (const cat of orgCategories) {
            hostCategoryMap[cat.identity] = cat.categoryName;
        }
        /* ---------- 5. Fetch Event Categories ---------- */
        const categoryIds = [];
        for (const ev of events) {
            if (ev.categoryIdentity) {
                categoryIds.push(ev.categoryIdentity);
            }
        }
        const uniqueCategoryIds = Array.from(new Set(categoryIds));
        const eventCategories = await prisma.AceCategoryType.findMany({
            where: {
                identity: { in: uniqueCategoryIds },
            },
            select: {
                identity: true,
                categoryName: true,
            },
        });
        const eventCategoryMap = {};
        for (const c of eventCategories) {
            eventCategoryMap[c.identity] = c.categoryName;
        }
        /* ---------- 6. Fetch Event Types ---------- */
        const eventTypeIds = [];
        for (const ev of events) {
            if (ev.eventTypeIdentity) {
                eventTypeIds.push(ev.eventTypeIdentity);
            }
        }
        const uniqueEventTypeIds = Array.from(new Set(eventTypeIds));
        const eventTypes = await prisma.AceEventTypes.findMany({
            where: {
                identity: { in: uniqueEventTypeIds },
            },
            select: {
                identity: true,
                name: true,
            },
        });
        const eventTypeMap = {};
        for (const t of eventTypes) {
            eventTypeMap[t.identity] = t.name;
        }
        /* ---------- 7. Build final response ---------- */
        const responseEvents = [];
        for (const ev of events) {
            const collaborators = [];
            for (const col of ev.Collaborator) {
                collaborators.push({
                    role: col.role,
                    member: {
                        identity: col.member.identity,
                        organizerName: col.member.organizerName,
                        organizerNumber: col.member.organizerNumber,
                        organizationName: col.member.organizationName,
                        orgDept: col.member.orgDept,
                        location: col.member.location,
                        hostIdentity: col.member.hostIdentity,
                        hostCategoryName: col.member.hostIdentity
                            ? hostCategoryMap[col.member.hostIdentity] ?? null
                            : null,
                    },
                });
            }
            responseEvents.push({
                identity: ev.identity,
                title: ev.title,
                slug: ev.slug,
                description: ev.description,
                mode: ev.mode,
                status: ev.status,
                createdAt: ev.createdAt,
                // NEW ENRICHED FIELDS
                categoryIdentity: ev.categoryIdentity,
                categoryName: ev.categoryIdentity
                    ? eventCategoryMap[ev.categoryIdentity] ?? null
                    : null,
                eventTypeIdentity: ev.eventTypeIdentity,
                eventTypeName: ev.eventTypeIdentity
                    ? eventTypeMap[ev.eventTypeIdentity] ?? null
                    : null,
                eligibleDeptIdentities: ev.eligibleDeptIdentities,
                bannerImages: ev.bannerImages,
                eventLink: ev.eventLink,
                paymentLink: ev.paymentLink,
                org: ev.org,
                cert: ev.cert,
                location: ev.location,
                calendars: ev.calendars,
                tickets: ev.tickets,
                perks: ev.eventPerks.map((p) => p.perk),
                accommodations: ev.eventAccommodations.map((a) => a.accommodation),
                collaborators,
            });
        }
        return {
            count,
            events: responseEvents,
        };
    }
    static async createEvent(payload) {
        return prisma.$transaction(async (tx) => {
            /* ---------------------------------------------------
             1. Create Event (UNCHANGED)
          --------------------------------------------------- */
            const event = await tx.event.create({
                data: {
                    title: payload.title,
                    slug: (0, slug_1.generateSlug)(payload.title),
                    description: payload.description,
                    mode: payload.mode,
                    categoryIdentity: payload.categoryIdentity,
                    eventTypeIdentity: payload.eventTypeIdentity,
                    cert: payload.certIdentity
                        ? {
                            connect: { identity: payload.certIdentity },
                        }
                        : undefined,
                    eligibleDeptIdentities: payload.eligibleDeptIdentities,
                    tags: payload.tags,
                    bannerImages: payload.bannerImages,
                    eventLink: payload.eventLink,
                    paymentLink: payload.paymentLink,
                    createdBy: payload.createdBy,
                    org: {
                        connect: { identity: payload.orgIdentity },
                    },
                },
            });
            const eventId = event.identity;
            /* ---------------------------------------------------
             2. Update Org Social Links (UNCHANGED)
          --------------------------------------------------- */
            const orgSocialUpdate = buildOrgSocialUpdate(payload.socialLinks);
            if (Object.keys(orgSocialUpdate).length) {
                await tx.org.update({
                    where: { identity: payload.orgIdentity },
                    data: orgSocialUpdate,
                });
            }
            /* ---------------------------------------------------
             3. Collaborators (UPDATED BASED ON NEW TABLE DESIGN)
          --------------------------------------------------- */
            if (payload.collaborators?.length) {
                for (const c of payload.collaborators) {
                    /**
                     * Expected collaborator payload:
                     * {
                     *   hostIdentity,
                     *   organizerName,
                     *   organizerNumber,
                     *   organizationName,
                     *   orgDept?,
                     *   location?,
                     *   role?
                     * }
                     */
                    // 3.1 Upsert CollaboratorMember
                    const member = await tx.collaboratorMember.upsert({
                        where: {
                            organizerNumber_hostIdentity: {
                                organizerNumber: c.organizerNumber,
                                hostIdentity: c.hostIdentity,
                            },
                        },
                        update: {
                            organizerName: c.organizerName,
                            organizationName: c.organizationName,
                            orgDept: c.orgDept ?? null,
                            location: c.location ?? null,
                        },
                        create: {
                            hostIdentity: c.hostIdentity,
                            organizerName: c.organizerName,
                            organizerNumber: c.organizerNumber,
                            organizationName: c.organizationName,
                            orgDept: c.orgDept ?? null,
                            location: c.location ?? null,
                        },
                    });
                    // 3.2 Create Collaborator mapping (Event ↔ Member)
                    await tx.collaborator.create({
                        data: {
                            collaboratorMemberId: member.identity,
                            eventIdentity: eventId,
                            orgIdentity: payload.orgIdentity,
                            role: c.role ?? null,
                        },
                    });
                }
            }
            /* ---------------------------------------------------
             4. Location (UNCHANGED)
          --------------------------------------------------- */
            if (payload.location) {
                await tx.eventLocation.create({
                    data: {
                        eventIdentity: eventId,
                        onlineMeetLink: payload.location.onlineMeetLink ?? null,
                        country: payload.location.country ?? null,
                        state: payload.location.state ?? null,
                        city: payload.location.city ?? null,
                        mapLink: payload.location.mapLink ?? null,
                    },
                });
            }
            /* ---------------------------------------------------
             5. Calendars (UNCHANGED)
          --------------------------------------------------- */
            if (payload.calendars?.length) {
                await tx.eventCalendar.createMany({
                    data: payload.calendars.map((c) => ({
                        eventIdentity: eventId,
                        timeZone: c.timeZone,
                        startDate: c.startDate,
                        endDate: c.endDate,
                        startTime: c.startTime ?? null,
                        endTime: c.endTime ?? null,
                    })),
                });
            }
            /* ---------------------------------------------------
             6. Tickets (UNCHANGED, DateTime SAFE)
          --------------------------------------------------- */
            if (payload.tickets?.length) {
                await tx.ticket.createMany({
                    data: payload.tickets.map((t) => ({
                        name: t.name,
                        description: t.description ?? null,
                        sellingFrom: new Date(t.sellingFrom),
                        sellingTo: new Date(t.sellingTo),
                        isPaid: t.isPaid ?? false,
                        price: t.price ?? null,
                        totalQuantity: t.totalQuantity,
                        eventIdentity: eventId,
                    })),
                });
            }
            /* ---------------------------------------------------
             7. Perks (UNCHANGED)
          --------------------------------------------------- */
            if (payload.perkIdentities?.length) {
                await tx.eventPerk.createMany({
                    data: payload.perkIdentities.map((id) => ({
                        eventIdentity: eventId,
                        perkIdentity: id,
                    })),
                    skipDuplicates: true,
                });
            }
            /* ---------------------------------------------------
             8. Accommodations (UNCHANGED)
          --------------------------------------------------- */
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
        if (!orgId || !eventId) {
            throw new Error(event_message_1.EVENT_MESSAGES.ORG_AND_EVENT_ID_REQ);
        }
        /* ---------- 1. Fetch event ---------- */
        const event = await prisma.event.findFirst({
            where: {
                identity: eventId,
                orgIdentity: orgId,
            },
            include: {
                org: true,
                cert: true,
                location: true,
                calendars: true,
                tickets: true,
                eventPerks: { include: { perk: true } },
                eventAccommodations: { include: { accommodation: true } },
                Collaborator: { include: { member: true } },
            },
        });
        if (!event)
            return null;
        /* ---------- 2. Resolve host categories ---------- */
        const hostIds = [];
        for (const col of event.Collaborator) {
            if (col.member.hostIdentity) {
                hostIds.push(col.member.hostIdentity);
            }
        }
        const categories = await prisma.orgCategory.findMany({
            where: { identity: { in: hostIds } },
            select: { identity: true, categoryName: true },
        });
        const hostCategoryMap = {};
        for (const c of categories) {
            hostCategoryMap[c.identity] = c.categoryName;
        }
        /* ---------- 3. Resolve Event Category ---------- */
        let categoryName = null;
        if (event.categoryIdentity) {
            const category = await prisma.AceCategoryType.findUnique({
                where: { identity: event.categoryIdentity },
                select: { categoryName: true },
            });
            categoryName = category ? category.categoryName : null;
        }
        /* ---------- 4. Resolve Event Type ---------- */
        let eventTypeName = null;
        if (event.eventTypeIdentity) {
            const eventType = await prisma.AceEventTypes.findUnique({
                where: { identity: event.eventTypeIdentity },
                select: { name: true },
            });
            eventTypeName = eventType ? eventType.name : null;
        }
        /* ---------- 5. Build collaborators ---------- */
        const collaborators = [];
        for (const col of event.Collaborator) {
            collaborators.push({
                role: col.role,
                member: {
                    identity: col.member.identity,
                    organizerName: col.member.organizerName,
                    organizerNumber: col.member.organizerNumber,
                    organizationName: col.member.organizationName,
                    orgDept: col.member.orgDept,
                    location: col.member.location,
                    hostIdentity: col.member.hostIdentity,
                    hostCategoryName: col.member.hostIdentity
                        ? hostCategoryMap[col.member.hostIdentity] ?? null
                        : null,
                },
            });
        }
        /* ---------- 6. Final response ---------- */
        return {
            identity: event.identity,
            title: event.title,
            slug: event.slug,
            description: event.description,
            mode: event.mode,
            status: event.status,
            createdAt: event.createdAt,
            // NEW FIELDS
            categoryIdentity: event.categoryIdentity,
            categoryName,
            eventTypeIdentity: event.eventTypeIdentity,
            eventTypeName,
            eligibleDeptIdentities: event.eligibleDeptIdentities,
            bannerImages: event.bannerImages,
            eventLink: event.eventLink,
            paymentLink: event.paymentLink,
            org: event.org,
            cert: event.cert,
            location: event.location,
            calendars: event.calendars,
            tickets: event.tickets,
            perks: event.eventPerks.map((p) => p.perk),
            accommodations: event.eventAccommodations.map((a) => a.accommodation),
            collaborators,
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
        // 1. Fetch all events
        const events = await prisma.event.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                org: true,
                cert: true,
                location: true,
                calendars: true,
                tickets: true,
                eventPerks: { include: { perk: true } },
                eventAccommodations: { include: { accommodation: true } },
                Collaborator: { include: { member: true } },
            },
        });
        if (events.length === 0)
            return [];
        // 2. Collect lookup IDs
        const hostIds = [];
        const categoryIds = [];
        const eventTypeIds = [];
        for (const ev of events) {
            if (ev.categoryIdentity)
                categoryIds.push(ev.categoryIdentity);
            if (ev.eventTypeIdentity)
                eventTypeIds.push(ev.eventTypeIdentity);
            for (const col of ev.Collaborator) {
                if (col.member.hostIdentity) {
                    hostIds.push(col.member.hostIdentity);
                }
            }
        }
        const uniqueHostIds = Array.from(new Set(hostIds));
        const uniqueCategoryIds = Array.from(new Set(categoryIds));
        const uniqueEventTypeIds = Array.from(new Set(eventTypeIds));
        // 3. Fetch lookup tables
        const hostCategories = await prisma.orgCategory.findMany({
            where: { identity: { in: uniqueHostIds } },
            select: { identity: true, categoryName: true },
        });
        const eventCategories = await prisma.AceCategoryType.findMany({
            where: { identity: { in: uniqueCategoryIds } },
            select: { identity: true, categoryName: true },
        });
        const eventTypes = await prisma.AceEventTypes.findMany({
            where: { identity: { in: uniqueEventTypeIds } },
            select: { identity: true, name: true },
        });
        // 4. Build lookup maps
        const hostCategoryMap = {};
        for (const h of hostCategories)
            hostCategoryMap[h.identity] = h.categoryName;
        const eventCategoryMap = {};
        for (const c of eventCategories)
            eventCategoryMap[c.identity] = c.categoryName;
        const eventTypeMap = {};
        for (const t of eventTypes)
            eventTypeMap[t.identity] = t.name;
        // 5. Final response
        const response = [];
        for (const ev of events) {
            const collaborators = [];
            for (const col of ev.Collaborator) {
                collaborators.push({
                    role: col.role,
                    member: {
                        identity: col.member.identity,
                        organizerName: col.member.organizerName,
                        organizerNumber: col.member.organizerNumber,
                        organizationName: col.member.organizationName,
                        orgDept: col.member.orgDept,
                        location: col.member.location,
                        hostIdentity: col.member.hostIdentity,
                        hostCategoryName: col.member.hostIdentity
                            ? hostCategoryMap[col.member.hostIdentity] ?? null
                            : null,
                    },
                });
            }
            response.push({
                identity: ev.identity,
                title: ev.title,
                slug: ev.slug,
                description: ev.description,
                mode: ev.mode,
                status: ev.status,
                createdAt: ev.createdAt,
                categoryIdentity: ev.categoryIdentity,
                categoryName: ev.categoryIdentity
                    ? eventCategoryMap[ev.categoryIdentity] ?? null
                    : null,
                eventTypeIdentity: ev.eventTypeIdentity,
                eventTypeName: ev.eventTypeIdentity
                    ? eventTypeMap[ev.eventTypeIdentity] ?? null
                    : null,
                eligibleDeptIdentities: ev.eligibleDeptIdentities,
                bannerImages: ev.bannerImages,
                eventLink: ev.eventLink,
                paymentLink: ev.paymentLink,
                org: ev.org,
                cert: ev.cert,
                location: ev.location,
                calendars: ev.calendars,
                tickets: ev.tickets,
                perks: ev.eventPerks.map((p) => p.perk),
                accommodations: ev.eventAccommodations.map((a) => a.accommodation),
                collaborators,
            });
        }
        return response;
    }
    static async getSingleEventsService(eventId) {
        if (!eventId) {
            throw new Error(event_message_1.EVENT_MESSAGES.EVENT_ID_REQUIRED);
        }
        const event = await prisma.event.findUnique({
            where: {
                identity: eventId,
            },
            include: {
                // Organization
                org: {
                    select: {
                        identity: true,
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
                // Certification
                cert: {
                    select: {
                        identity: true,
                        certName: true,
                    },
                },
                // Location
                location: true,
                // Calendars
                calendars: true,
                // Tickets
                tickets: true,
                // Perks
                eventPerks: {
                    include: {
                        perk: true,
                    },
                },
                // Accommodations
                eventAccommodations: {
                    include: {
                        accommodation: true,
                    },
                },
                // Collaborators
                Collaborator: {
                    include: {
                        member: {
                            select: {
                                identity: true,
                                name: true,
                                email: true,
                                mobile: true,
                            },
                        },
                        org: {
                            select: {
                                identity: true,
                                organizationName: true,
                                logoUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!event)
            return null;
        const typedEvent = event;
        // Final shaped response (same as other APIs)
        return {
            identity: typedEvent.identity,
            title: typedEvent.title,
            slug: typedEvent.slug,
            description: typedEvent.description,
            mode: typedEvent.mode,
            status: typedEvent.status,
            createdAt: typedEvent.createdAt,
            bannerImages: typedEvent.bannerImages, // S3 URLs directly
            eventLink: typedEvent.eventLink,
            paymentLink: typedEvent.paymentLink,
            org: typedEvent.org,
            cert: typedEvent.cert,
            location: typedEvent.location,
            calendars: typedEvent.calendars,
            tickets: typedEvent.tickets,
            perks: typedEvent.eventPerks.map((p) => p.perk),
            accommodations: typedEvent.eventAccommodations.map((a) => a.accommodation),
            collaborators: typedEvent.Collaborator.map((c) => ({
                role: c.role,
                member: c.member,
                organization: c.org,
            })),
        };
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
            // if (payload.collaborators?.length) {
            //   await tx.eventCollaborator.createMany({
            //     data: payload.collaborators.map((c: any) => ({
            //       ...c,
            //       eventIdentity: eventId,
            //     })),
            //   });
            // }
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
