const prisma = require("../config/db.config");
import { EventType } from "../types/type";
import { EVENT_STATUS_LIST } from "../constants/event.status.message";
import { EVENT_MESSAGES } from "../constants/event.message";
import { getResolvedImageUrl } from "../utils/s3SignedUrl";
import { cleanPayload } from "../utils/cleanPayload";
import { Prisma } from "@prisma/client";

export class EventService {
  static async getEventsByOrg(identity: string): Promise<EventType[]> {
    if (!identity) {
      throw new Error(EVENT_MESSAGES.ORG_ID_REQUIRED);
    }

    const BASE_URL = process.env.BASE_URL ?? "";

    const events = await prisma.event.findMany({
      where: {
        orgIdentity: identity,
        status: EVENT_MESSAGES.APPROVED,
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
      throw new Error(EVENT_MESSAGES.EVENTS_NOT_FOUND);
    }

    return events.map((event: EventType) => ({
      ...event,
      bannerImage: getResolvedImageUrl(event.bannerImage),
    }));
  }

  static async createEvent(payload: any) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Event
      const event = await tx.event.create({
        data: {
          orgIdentity: payload.orgId,
          createdBy: payload.createdBy,

          title: payload.title,
          description: payload.description,
          mode: payload.mode,
          categoryIdentity: payload.categoryIdentity,
          eventTypeIdentity: payload.eventTypeIdentity,

          eligibleDeptIdentities: payload.eligibleDeptIdentities ?? [],
          tags: payload.tags ?? [],

          bannerImages: payload.bannerImages ?? [],
          eventLink: payload.eventLink,
          socialLinks: payload.socialLinks,
          paymentLink: payload.paymentLink,
        },
      });

      const eventId = event.identity;

      // 2. Collaborators
      if (payload.collaborators?.length) {
        await tx.eventCollaborator.createMany({
          data: payload.collaborators.map((c: any) => ({
            ...c,
            eventIdentity: eventId,
          })),
        });
      }

      // 3. Calendars
      if (payload.calendars?.length) {
        await tx.eventCalendar.createMany({
          data: payload.calendars.map((c: any) => ({
            ...c,
            eventIdentity: eventId,
          })),
        });
      }

      // 4. Tickets
      if (payload.tickets?.length) {
        await tx.ticket.createMany({
          data: payload.tickets.map((t: any) => ({
            ...t,
            eventIdentity: eventId,
          })),
        });
      }

      // 5. Perks
      if (payload.perkIdentities?.length) {
        await tx.eventPerk.createMany({
          data: payload.perkIdentities.map((id: string) => ({
            eventIdentity: eventId,
            perkIdentity: id,
          })),
          skipDuplicates: true,
        });
      }

      // 6. Certifications
      if (payload.certIdentities?.length) {
        await tx.eventCertification.createMany({
          data: payload.certIdentities.map((id: string) => ({
            eventIdentity: eventId,
            certIdentity: id,
          })),
          skipDuplicates: true,
        });
      }

      // 7. Accommodations
      if (payload.accommodationIdentities?.length) {
        await tx.eventAccommodation.createMany({
          data: payload.accommodationIdentities.map((id: string) => ({
            eventIdentity: eventId,
            accommodationIdentity: id,
          })),
          skipDuplicates: true,
        });
      }

      return event;
    });
  }

  static async getEventById(
    orgId: string,
    eventId: string
  ): Promise<EventType | null> {
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
    if (!event) return null;

    // mapping image url to include base URL
    return {
      ...event,
      bannerImage: getResolvedImageUrl(event.bannerImage),
    };
  }

  static async updateEvent(orgId: string, eventId: string, data: any) {
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

  static async deleteEvent(orgId: string, eventId: string) {
    // deleting event that matches both event id and organization id
    return prisma.event.deleteMany({
      where: {
        identity: eventId,
        orgIdentity: orgId,
      },
    });
  }

  static async getAllEventsService(): Promise<EventType[]> {
    const BASE_URL = process.env.BASE_URL ?? "";

    // fetch ONLY approved events
    const rawEvents = await prisma.event.findMany({
      where: {
        status: EVENT_MESSAGES.APPROVED,
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
    const events: EventType[] = rawEvents.map((e: EventType) => ({
      ...e,
      bannerImage: getResolvedImageUrl(e.bannerImage),
    }));

    return events;
  }

  static async getSingleEventsService(
    eventId: string
  ): Promise<EventType | null> {
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
    if (!rawEvent) return null;

    // adding absolute image path
    const event: EventType = {
      ...rawEvent,
      bannerImage: getResolvedImageUrl(rawEvent.bannerImage),
    };

    return event;
  }

  static getAllStatuses() {
    return EVENT_STATUS_LIST;
  }

  // Event & Draft Based Servcies

  static async createDraftEvent(userId: number, orgIdentity: string) {
    const existingDraft = await prisma.event.findFirst({
      where: {
        createdBy: userId,
        status: "DRAFT",
      },
    });

    if (existingDraft) return existingDraft;

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

  static async autoSaveEvent(eventId: string, payload: any) {
    const data = cleanPayload(payload);
    if (!Object.keys(data).length) return;

    await prisma.event.update({
      where: { identity: eventId },
      data,
    });
  }

  static async publishEvent(eventId: string, payload: any) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.event.findUnique({
        where: { identity: eventId },
      });

      if (!event) throw new Error("Event not found");
      if (!event.title) throw new Error("Title is required");
      if (!event.mode) throw new Error("Mode is required");

      await tx.event.update({
        where: { identity: eventId },
        data: {
          status: "PENDING",
          publishedAt: new Date(),
        },
      });

      if (payload.collaborators?.length) {
        await tx.eventCollaborator.createMany({
          data: payload.collaborators.map((c: any) => ({
            ...c,
            eventIdentity: eventId,
          })),
        });
      }

      if (payload.calendars?.length) {
        await tx.eventCalendar.createMany({
          data: payload.calendars.map((c: any) => ({
            ...c,
            eventIdentity: eventId,
          })),
        });
      }

      if (payload.tickets?.length) {
        await tx.ticket.createMany({
          data: payload.tickets.map((t: any) => ({
            ...t,
            eventIdentity: eventId,
          })),
        });
      }

      if (payload.perkIdentities?.length) {
        await tx.eventPerk.createMany({
          data: payload.perkIdentities.map((id: string) => ({
            eventIdentity: eventId,
            perkIdentity: id,
          })),
          skipDuplicates: true,
        });
      }

      if (payload.certIdentities?.length) {
        await tx.eventCertification.createMany({
          data: payload.certIdentities.map((id: string) => ({
            eventIdentity: eventId,
            certIdentity: id,
          })),
          skipDuplicates: true,
        });
      }

      if (payload.accommodationIdentities?.length) {
        await tx.eventAccommodation.createMany({
          data: payload.accommodationIdentities.map((id: string) => ({
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
