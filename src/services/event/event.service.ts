const prisma = require("../../config/db.config");
import { EventType, EventWithRelations } from "../../types/type";
import { EVENT_STATUS_LIST } from "../../constants/event.status.message";
import { EVENT_MESSAGES } from "../../constants/event.message";
import { getResolvedImageUrl } from "../../utils/s3SignedUrl";
import { cleanPayload } from "../../utils/cleanPayload";
import { Prisma } from "@prisma/client";
import { EventMode } from "@prisma/client";
import { generateSlug } from "../../utils/slug";
import { EVENT_FULL_INCLUDE } from "./event.include";
import { enrichEvents } from "./event.enricher";

export class EventService {
  static async getEventsByOrg(identity: string) {
    const events = await prisma.event.findMany({
      where: { orgIdentity: identity, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: EVENT_FULL_INCLUDE,
    });

    const count = await prisma.event.count({
      where: { orgIdentity: identity, status: "APPROVED" },
    });

    return {
      count,
      events: await enrichEvents(events),
    };
  }

  static async createEvent(payload: any) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      /* ---------------------------------------------------
       1. Create Event (UNCHANGED)
    --------------------------------------------------- */
      const event = await tx.event.create({
        data: {
          title: payload.title,
          slug: generateSlug(payload.title),
          description: payload.description,
          mode: payload.mode,
          categoryIdentity: payload.categoryIdentity,
          eventTypeIdentity: payload.eventTypeIdentity,

          cert: payload.certIdentity
            ? { connect: { identity: payload.certIdentity } }
            : undefined,

          eligibleDeptIdentities: payload.eligibleDeptIdentities,
          tags: payload.tags,
          bannerImages: payload.bannerImages,

          socialLinks: payload.socialLinks ?? {},

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
          const member = await tx.collaboratorMember.create({
            data: {
              hostIdentity: c.hostIdentity ?? null,
              organizerName: c.organizerName ?? null,
              organizerNumber: c.organizerNumber ?? null,
              organizationName: c.organizationName ?? null,
              orgDept: c.orgDept ?? null,
              location: c.location ?? null,
            },
          });

          // 3.2 Create Collaborator mapping (Event ↔ Member)
          await tx.collaborator.createMany({
            data: payload.collaborators.map(() => ({
              collaboratorMemberId: member.identity,
              eventIdentity: eventId,
              orgIdentity: payload.orgIdentity,
            })),
            skipDuplicates: true,
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
          data: payload.calendars.map((c: any) => ({
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
          data: payload.tickets.map((t: any) => ({
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
          data: payload.perkIdentities.map((id: string) => ({
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

  static async getEventById(orgId: string, eventId: string) {
    if (!orgId || !eventId) {
      throw new Error(EVENT_MESSAGES.ORG_AND_EVENT_ID_REQ);
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

    if (!event) return null;

    /* ---------- 2. Resolve host categories ---------- */
    const hostIds: string[] = [];

    for (const col of event.Collaborator) {
      if (col.member.hostIdentity) {
        hostIds.push(col.member.hostIdentity);
      }
    }

    const categories = await prisma.orgCategory.findMany({
      where: { identity: { in: hostIds } },
      select: { identity: true, categoryName: true },
    });

    const hostCategoryMap: Record<string, string> = {};
    for (const c of categories) {
      hostCategoryMap[c.identity] = c.categoryName;
    }

    /* ---------- 3. Resolve Event Category ---------- */
    let categoryName: string | null = null;

    if (event.categoryIdentity) {
      const category = await prisma.AceCategoryType.findUnique({
        where: { identity: event.categoryIdentity },
        select: { categoryName: true },
      });

      categoryName = category ? category.categoryName : null;
    }

    /* ---------- 4. Resolve Event Type ---------- */
    let eventTypeName: string | null = null;

    if (event.eventTypeIdentity) {
      const eventType = await prisma.AceEventTypes.findUnique({
        where: { identity: event.eventTypeIdentity },
        select: { name: true },
      });

      eventTypeName = eventType ? eventType.name : null;
    }

    /* ---------- 5. Build collaborators ---------- */
    const collaborators: any[] = [];

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

      perks: event.eventPerks.map((p: any) => p.perk),
      accommodations: event.eventAccommodations.map(
        (a: any) => a.accommodation
      ),

      collaborators,
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

  static async getAllEventsService() {
    const events = await prisma.event.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: EVENT_FULL_INCLUDE,
    });

    return enrichEvents(events);
  }

  static async getSingleEventsService(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { identity: eventId },
      include: EVENT_FULL_INCLUDE,
    });

    if (!event) return null;

    const [enriched] = await enrichEvents([event]);
    return enriched;
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

      // if (payload.certIdentities?.length) {
      //   await tx.eventCertification.createMany({
      //     data: payload.certIdentities.map((id: string) => ({
      //       eventIdentity: eventId,
      //       certIdentity: id,
      //     })),
      //     skipDuplicates: true,
      //   });
      // }

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
