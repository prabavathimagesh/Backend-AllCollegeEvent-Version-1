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
        // Fetch events + count in one transaction
        const [events, count] = await prisma.$transaction([
            prisma.event.findMany({
                where: {
                    orgIdentity: identity,
                    status: event_message_1.EVENT_MESSAGES.APPROVED,
                },
                orderBy: {
                    createdAt: "desc",
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
                    // Certification (single)
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
                    // Collaborators (NEW STRUCTURE)
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
            }),
            prisma.event.count({
                where: {
                    orgIdentity: identity,
                    status: event_message_1.EVENT_MESSAGES.APPROVED,
                },
            }),
        ]);
        // Explicit typing (THIS FIXES ALL implicit `any` ERRORS)
        const typedEvents = events;
        if (!typedEvents.length) {
            throw new Error(event_message_1.EVENT_MESSAGES.EVENTS_NOT_FOUND);
        }
        // Final shaped response
        return {
            count,
            events: typedEvents.map((event) => ({
                identity: event.identity,
                title: event.title,
                slug: event.slug,
                description: event.description,
                mode: event.mode,
                status: event.status,
                createdAt: event.createdAt,
                // Already full S3 URLs
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
                collaborators: event.Collaborator.map((c) => ({
                    role: c.role,
                    member: c.member,
                    organization: c.org,
                })),
            })),
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
        const event = await prisma.event.findFirst({
            where: {
                identity: eventId,
                orgIdentity: orgId,
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
        // Final shaped response (same pattern as other APIs)
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
        const events = await prisma.event.findMany({
            // NO status condition (fetch all)
            orderBy: {
                createdAt: "desc",
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
        const typedEvents = events;
        // Final shaped response
        return typedEvents.map((event) => ({
            identity: event.identity,
            title: event.title,
            slug: event.slug,
            description: event.description,
            mode: event.mode,
            status: event.status,
            createdAt: event.createdAt,
            bannerImages: event.bannerImages, // S3 URLs directly
            eventLink: event.eventLink,
            paymentLink: event.paymentLink,
            org: event.org,
            cert: event.cert,
            location: event.location,
            calendars: event.calendars,
            tickets: event.tickets,
            perks: event.eventPerks.map((p) => p.perk),
            accommodations: event.eventAccommodations.map((a) => a.accommodation),
            collaborators: event.Collaborator.map((c) => ({
                role: c.role,
                member: c.member,
                organization: c.org,
            })),
        }));
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
