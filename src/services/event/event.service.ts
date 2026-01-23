const prisma = require("../../config/db.config");
import {
  AssetItem,
  EventFilterDTO,
  EventType,
  EventWithRelations,
  FilterResult,
} from "../../types/type";
import { EVENT_STATUS_LIST } from "../../constants/event.status.message";
import { EVENT_MESSAGES } from "../../constants/event.message";
import { getResolvedImageUrl } from "../../utils/s3SignedUrl";
import { cleanPayload } from "../../utils/cleanPayload";
import { Prisma } from "@prisma/client";
import { EventMode } from "@prisma/client";
import { generateSlug } from "../../utils/slug";
import { EVENT_FULL_INCLUDE } from "./event.include";
import { enrichEvents } from "./event.enricher";
import { uploadToS3 } from "../../utils/s3Upload";

export class EventService {
  static async getEventsByOrgSlug(slug: string) {
    const org = await prisma.org.findUnique({
      where: { slug },
      select: { identity: true },
    });

    if (!org) {
      throw new Error(EVENT_MESSAGES.ORG_NOT_FOUND);
    }

    const events = await prisma.event.findMany({
      where: {
        orgIdentity: org.identity,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      include: EVENT_FULL_INCLUDE,
    });

    const count = await prisma.event.count({
      where: {
        orgIdentity: org.identity,
        status: "APPROVED",
      },
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
      if (
        Array.isArray(payload.collaborators) &&
        payload.collaborators.length > 0
      ) {
        for (const c of payload.collaborators) {
          /* ---------- GUARD ---------- */
          if (!c.organizerNumber) {
            throw new Error(EVENT_MESSAGES.ORGANIZER_NUMBER_REQUIRED);
          }

          /* ---------- UPSERT COLLABORATOR MEMBER ---------- */
          const member = await tx.collaboratorMember.upsert({
            where: {
              organizerNumber: c.organizerNumber, // @unique
            },
            update: {
              organizerName: c.organizerName ?? null,
              organizationName: c.organizationName ?? null,
              orgDept: c.orgDept ?? null,
              location: c.location ?? null,
            },
            create: {
              organizerNumber: c.organizerNumber,
              hostIdentity: c.hostIdentity ?? null,
              organizerName: c.organizerName ?? null,
              organizationName: c.organizationName ?? null,
              orgDept: c.orgDept ?? null,
              location: c.location ?? null,
            },
          });

          /* ---------- CREATE EVENT COLLABORATOR (NO DUPLICATES) ---------- */
          await tx.collaborator.upsert({
            where: {
              collaboratorMemberId_eventIdentity: {
                collaboratorMemberId: member.identity,
                eventIdentity: eventId,
              },
            },
            update: {
              role: c.role ?? null,
            },
            create: {
              collaboratorMemberId: member.identity,
              eventIdentity: eventId,
              orgIdentity: payload.orgIdentity, // event creator org
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
            venue: payload.location.venue ?? null,
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
            ? (hostCategoryMap[col.member.hostIdentity] ?? null)
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
        (a: any) => a.accommodation,
      ),

      collaborators,
    };
  }

  static async updateEvent(eventIdentity: string, payload: any) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      /* =====================================================
       1️⃣ ENSURE EVENT EXISTS (ONCE)
    ===================================================== */
      console.log(eventIdentity);
      const event = await tx.event.findUnique({
        where: { identity: eventIdentity },
        select: { identity: true, orgIdentity: true },
      });
      console.log(event);

      if (!event) {
        throw new Error("Event not found or access denied");
      }

      console.log(payload);

      /* =====================================================
       2️⃣ EVENT CORE (PATCH STYLE)
    ===================================================== */
      const eventUpdateData: any = {};

      if (payload.description !== undefined) {
        eventUpdateData.description = payload.description;
      }

      if (payload.offers !== undefined) {
        eventUpdateData.offers = payload.offers;
      }

      if (payload.certIdentity !== undefined) {
        eventUpdateData.certIdentity = payload.certIdentity;
      }

      if (payload.socialLinks !== undefined) {
        eventUpdateData.socialLinks = payload.socialLinks
          ? JSON.parse(payload.socialLinks)
          : null;
      }

      // ✅ Update event ONLY if needed
      if (Object.keys(eventUpdateData).length > 0) {
        await tx.event.update({
          where: { identity: eventIdentity },
          data: eventUpdateData,
        });
      }

      /* =====================================================
       3️⃣ PERKS
    ===================================================== */
      if (payload.perkIdentities !== undefined) {
        await tx.eventPerk.deleteMany({ where: { eventIdentity } });

        if (payload.perkIdentities.length > 0) {
          await tx.eventPerk.createMany({
            data: payload.perkIdentities.map((perkId: string) => ({
              eventIdentity,
              perkIdentity: perkId,
            })),
          });
        }
      }

      /* =====================================================
       4️⃣ ACCOMMODATIONS
    ===================================================== */
      if (payload.accommodationIdentities !== undefined) {
        await tx.eventAccommodation.deleteMany({
          where: { eventIdentity },
        });

        if (payload.accommodationIdentities.length > 0) {
          await tx.eventAccommodation.createMany({
            data: payload.accommodationIdentities.map((accId: string) => ({
              eventIdentity,
              accommodationIdentity: accId,
            })),
          });
        }
      }

      /* =====================================================
       5️⃣ TICKETS (SYNC LOGIC)
    ===================================================== */
      let tickets = payload.tickets;

      if (typeof tickets === "string") {
        try {
          tickets = JSON.parse(tickets);
        } catch {
          throw new Error("Invalid tickets payload");
        }
      }

      if (payload.tickets !== undefined && Array.isArray(tickets)) {
        const incomingTicketIds = tickets
          .filter((t: any) => typeof t.identity === "string")
          .map((t: any) => t.identity);

        await tx.ticket.deleteMany({
          where: {
            eventIdentity,
            ...(incomingTicketIds.length > 0
              ? { identity: { notIn: incomingTicketIds } }
              : {}),
          },
        });

        for (const ticket of tickets) {
          if (!ticket.name || !ticket.sellingTo) continue;

          if (ticket.identity) {
            const existing = await tx.ticket.findUnique({
              where: { identity: ticket.identity },
            });

            if (!existing) continue;

            const sellingStarted = new Date() >= existing.sellingFrom;

            await tx.ticket.update({
              where: { identity: ticket.identity },
              data: {
                name: ticket.name,
                sellingFrom: sellingStarted ? undefined : ticket.sellingFrom,
                sellingTo: ticket.sellingTo,
                price: ticket.price,
                totalQuantity: ticket.totalQuantity,
              },
            });
          } else {
            await tx.ticket.create({
              data: {
                eventIdentity,
                name: ticket.name,
                sellingFrom: ticket.sellingFrom,
                sellingTo: ticket.sellingTo,
                price: ticket.price,
                totalQuantity: ticket.totalQuantity,
              },
            });
          }
        }
      }

      /* =====================================================
       6️⃣ COLLABORATORS (PRODUCTION SAFE)
    ===================================================== */
      if (
        payload.collaborators !== undefined &&
        Array.isArray(payload.collaborators)
      ) {
        const incomingMemberIds = payload.collaborators
          .filter((c: any) => typeof c.collaboratorMemberId === "string")
          .map((c: any) => c.collaboratorMemberId);

        await tx.collaborator.deleteMany({
          where: {
            eventIdentity,
            ...(incomingMemberIds.length > 0
              ? { collaboratorMemberId: { notIn: incomingMemberIds } }
              : {}),
          },
        });

        for (const collab of payload.collaborators) {
          if (!collab.organizerNumber) continue;

          let member;

          if (collab.collaboratorMemberId) {
            member = await tx.collaboratorMember.update({
              where: { identity: collab.collaboratorMemberId },
              data: {
                organizerName: collab.organizerName,
                organizerNumber: collab.organizerNumber,
              },
            });
          } else {
            const existingMember = await tx.collaboratorMember.findFirst({
              where: { organizerNumber: collab.organizerNumber },
              orderBy: { createdAt: "asc" },
            });

            if (existingMember) {
              member = await tx.collaboratorMember.update({
                where: { identity: existingMember.identity },
                data: {
                  organizerName: collab.organizerName,
                  organizationName: collab.organizationName,
                  orgDept: collab.orgDept,
                  location: collab.location,
                  hostIdentity: collab.hostIdentity ?? null,
                },
              });
            } else {
              member = await tx.collaboratorMember.create({
                data: {
                  organizerName: collab.organizerName,
                  organizerNumber: collab.organizerNumber,
                  organizationName: collab.organizationName,
                  orgDept: collab.orgDept,
                  location: collab.location,
                  hostIdentity: collab.hostIdentity ?? null,
                },
              });
            }
          }

          await tx.collaborator.upsert({
            where: {
              collaboratorMemberId_eventIdentity: {
                collaboratorMemberId: member.identity,
                eventIdentity,
              },
            },
            update: { role: collab.role },
            create: {
              collaboratorMemberId: member.identity,
              eventIdentity,
              orgIdentity: event.orgIdentity,
              role: collab.role,
            },
          });
        }
      }

      return { eventIdentity };
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

  static async getAllProtectedEventsService() {
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

  static async getSingleEventBySlug(slug: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: EVENT_FULL_INCLUDE,
    });

    if (!event) return null;

    const [enriched] = await enrichEvents([event]);
    return enriched;
  }

  static getAllStatuses() {
    return EVENT_STATUS_LIST;
  }

  static async incrementViewCount(slug: string) {
    const event = await prisma.event.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    if (!event) {
      throw new Error(EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    return true;
  }

  static async toggleSave(eventIdentity: string, userIdentity: string) {
    const existing = await prisma.eventSave.findFirst({
      where: { eventIdentity, userIdentity },
    });

    if (existing) {
      await prisma.eventSave.delete({
        where: { identity: existing.identity },
      });
      return { saved: false };
    }

    await prisma.eventSave.create({
      data: { eventIdentity, userIdentity },
    });

    return { saved: true };
  }

  static async toggleLike(eventIdentity: string, userIdentity: string) {

    // Check if already liked
    const existingLike = await prisma.eventLike.findFirst({
      where: { eventIdentity, userIdentity },
    });

    // If already liked → Unlike
    if (existingLike) {
      await prisma.eventLike.delete({
        where: { identity: existingLike.identity },
      });

      // update like count
      const likeCount = await prisma.eventLike.count({
        where: { eventIdentity },
      });

      await prisma.event.update({
        where: { identity: eventIdentity },
        data: { likeCount },
      });

      return { liked: false, likeCount };
    }

    // If not liked → Like
    await prisma.eventLike.create({
      data: { eventIdentity, userIdentity },
    });

    // update like count
    const likeCount = await prisma.eventLike.count({
      where: { eventIdentity },
    });

    await prisma.event.update({
      where: { identity: eventIdentity },
      data: { likeCount },
    });

    return { liked: true, likeCount };
  }


  /* ----------------------- BULK UPDATE FOR EVENT TYPES ----------------------- */

  static async bulkUpdateAssets(
    items: AssetItem[],
    files: Express.Multer.File[],
  ) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const file = files[i];

        const updateData: Prisma.AceEventTypesUpdateInput = {};

        // color from JSON
        if (item.color) {
          updateData.color = item.color;
        }

        // image from file
        if (file) {
          const upload = await uploadToS3(file, "event-types-images");
          updateData.imageUrl = upload.url;
        }

        await tx.aceEventTypes.update({
          where: { identity: item.identity },
          data: updateData,
        });
      }
    });
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

/**
 * Event Filter Service using Optimized Set Intersection Algorithm
 *
 * ALGORITHM EXPLANATION:
 * We use a Hash Set Intersection approach with early termination optimization.
 * This is O(n + m) where n and m are the sizes of sets being intersected.
 *
 * Strategy:
 * 1. Build individual filter result sets in parallel
 * 2. Use Set data structure for O(1) lookup
 * 3. Intersect sets progressively (early termination if empty)
 * 4. Single final database query with filtered identities
 *
 * This approach is faster than multiple JOINs or sequential filtering
 */
export class EventFilterService {
  async filterEvents(filters: EventFilterDTO): Promise<FilterResult> {
    const startTime = Date.now();

    // Collect all event identity sets from different filters
    const filterSets: Set<string>[] = [];

    // Run all independent filters in parallel for better performance
    const [locationSet, perkSet, accommodationSet, dateSet, pricingSet] =
      await Promise.all([
        this.getLocationFilterSet(filters),
        this.getPerkFilterSet(filters),
        this.getAccommodationFilterSet(filters),
        this.getDateFilterSet(filters),
        this.getPricingFilterSet(filters),
      ]);

    // Add non-null sets to filterSets array
    if (locationSet) filterSets.push(locationSet);
    if (perkSet) filterSets.push(perkSet);
    if (accommodationSet) filterSets.push(accommodationSet);
    if (dateSet) filterSets.push(dateSet);
    if (pricingSet) filterSets.push(pricingSet);

    // Perform set intersection to get common event identities
    let finalEventIdentities = this.intersectSets(filterSets);

    // CRITICAL FIX: If any filter was applied and returned an empty set,
    // we should have NO results (not all results)
    // Check if we had filters but got no matches
    const hadActiveFilters = filterSets.length > 0;
    if (hadActiveFilters && finalEventIdentities.size === 0) {
      // Return empty result immediately - no need to query database
      return {
        events: [],
        total: 0,
        executionTime: Date.now() - startTime,
      };
    }

    // Build Prisma where clause for main event table filters
    const whereClause: any = {
      // If we have intersection results, filter by those identities
      ...(finalEventIdentities.size > 0 && {
        identity: { in: Array.from(finalEventIdentities) },
      }),
    };

    // Apply direct event table filters
    this.applyDirectFilters(whereClause, filters);

    // Execute final query with all filters
    const events = await prisma.event.findMany({
      where: {
        ...whereClause,
        status: "APPROVED"
      },
      include: {
        location: true,
        calendars: true,
        tickets: true,
        eventPerks: { include: { perk: true } },
        eventAccommodations: { include: { accommodation: true } },
        cert: true,
      },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
      orderBy: this.getOrderBy(filters), // sorting applied here
    });

    const total = await prisma.event.count({
      where: {
        ...whereClause,
        status: "APPROVED"
      }
    });

    return {
      events,
      total,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Set Intersection Algorithm - O(n + m)
   * Uses the smallest set as base for optimization
   */
  private intersectSets(sets: Set<string>[]): Set<string> {
    if (sets.length === 0) return new Set();
    if (sets.length === 1) return sets[0];

    // Sort by size - start with smallest set for optimization
    sets.sort((a, b) => a.size - b.size);

    let result = new Set(sets[0]);

    // Intersect with remaining sets
    for (let i = 1; i < sets.length; i++) {
      const intersection = new Set<string>();

      for (const item of result) {
        if (sets[i].has(item)) {
          intersection.add(item);
        }
      }

      result = intersection;

      // Early termination - if intersection is empty, no need to continue
      if (result.size === 0) break;
    }

    return result;
  }

  /**
   * Apply filters that can be done directly on Event table
   */
  private applyDirectFilters(whereClause: any, filters: EventFilterDTO) {
    // 1. Trending/Featured events
    if (filters.eventTypes?.length) {
      const orConditions = [];

      if (filters.eventTypes.includes("trending")) {
        orConditions.push({
          viewCount: { gte: filters.trendingThreshold || 100 },
        });
      }

      if (filters.eventTypes.includes("featured")) {
        orConditions.push({ isPaid: true });
      }

      if (orConditions.length > 0) {
        whereClause.OR = orConditions;
      }
    }

    // 2. Mode filter
    if (filters.modes?.length) {
      whereClause.mode = { in: filters.modes };
    }

    // 4. Certification
    if (filters.certIdentity) {
      whereClause.certIdentity = filters.certIdentity;
    }

    // 7. Event Type
    if (filters.eventTypeIdentity) {
      whereClause.eventTypeIdentity = filters.eventTypeIdentity;
    }

    // 8. Eligible Departments (array overlap check)
    if (filters.eligibleDeptIdentities?.length) {
      whereClause.eligibleDeptIdentities = {
        hasSome: filters.eligibleDeptIdentities,
      };
    }

    // 11 + 12. Unified Search (title OR tags)
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }
  }

  /**
   * 3. Location Filter - Get event identities from location table
   */
  private async getLocationFilterSet(
    filters: EventFilterDTO,
  ): Promise<Set<string> | null> {
    if (!filters.country && !filters.state && !filters.city) {
      return null;
    }

    const locationWhere: any = {};

    if (filters.country) locationWhere.country = filters.country;
    if (filters.state) locationWhere.state = filters.state;
    if (filters.city) locationWhere.city = filters.city;

    const locations = await prisma.eventLocation.findMany({
      where: locationWhere,
      select: { eventIdentity: true },
    });

    return new Set(
      locations.map((l: { eventIdentity: string }) => l.eventIdentity),
    );
  }

  /**
   * 5. Perks Filter - Union approach (OR logic)
   */
  private async getPerkFilterSet(
    filters: EventFilterDTO,
  ): Promise<Set<string> | null> {
    if (!filters.perkIdentities?.length) {
      return null;
    }

    const eventPerks = await prisma.eventPerk.findMany({
      where: {
        perkIdentity: { in: filters.perkIdentities },
      },
      select: { eventIdentity: true },
    });

    return new Set(
      eventPerks.map((ep: { eventIdentity: string }) => ep.eventIdentity),
    );
  }

  /**
   * 6. Accommodation Filter - Union approach (OR logic)
   */
  private async getAccommodationFilterSet(
    filters: EventFilterDTO,
  ): Promise<Set<string> | null> {
    if (!filters.accommodationIdentities?.length) {
      return null;
    }

    const eventAccommodations = await prisma.eventAccommodation.findMany({
      where: {
        accommodationIdentity: { in: filters.accommodationIdentities },
      },
      select: { eventIdentity: true },
    });

    return new Set(
      eventAccommodations.map(
        (ea: { eventIdentity: string }) => ea.eventIdentity,
      ),
    );
  }

  /**
   * 9. Date Range Filter - FIXED
   * Proper date range overlap logic
   */
  private async getDateFilterSet(
    filters: EventFilterDTO,
  ): Promise<Set<string> | null> {
    if (!filters.dateRange?.startDate && !filters.dateRange?.endDate) {
      return null;
    }

    const dateWhere: any = {};

    // Logic: Find events where the event's date range overlaps with filter's date range
    // Event overlaps if: event.startDate <= filter.endDate AND event.endDate >= filter.startDate

    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      // Both dates provided - find events that overlap with this range
      dateWhere.AND = [
        { startDate: { lte: filters.dateRange.endDate } },
        { endDate: { gte: filters.dateRange.startDate } },
      ];
    } else if (filters.dateRange.startDate) {
      // Only start date - find events that end on or after this date
      dateWhere.endDate = { gte: filters.dateRange.startDate };
    } else if (filters.dateRange.endDate) {
      // Only end date - find events that start on or before this date
      dateWhere.startDate = { lte: filters.dateRange.endDate };
    }

    const calendars = await prisma.eventCalendar.findMany({
      where: dateWhere,
      select: { eventIdentity: true },
    });

    // Return set even if empty (for proper intersection)
    return new Set(
      calendars.map((c: { eventIdentity: string }) => c.eventIdentity),
    );
  }

  /**
   * 10. Pricing Filter - FIXED
   * Properly handles isPaid field and price ranges including free events
   */
  private async getPricingFilterSet(
    filters: EventFilterDTO,
  ): Promise<Set<string> | null> {
    // Only return null if priceRange is completely undefined
    if (
      !filters.priceRange ||
      (filters.priceRange.min === undefined &&
        filters.priceRange.max === undefined)
    ) {
      return null;
    }

    const { min, max } = filters.priceRange;

    // Case 1: Free events (min: 0, max: 0 or just max: 0)
    if ((min === 0 && max === 0) || (min === undefined && max === 0)) {
      const tickets = await prisma.ticket.findMany({
        where: {
          OR: [{ isPaid: false }, { isPaid: true, price: 0 }],
        },
        select: { eventIdentity: true },
        distinct: ["eventIdentity"],
      });

      return new Set(
        tickets.map((t: { eventIdentity: string }) => t.eventIdentity),
      );
    }

    // Case 2: Paid events with price range
    const priceWhere: any = {
      isPaid: true,
      price: { not: null },
    };

    if (min !== undefined && max !== undefined) {
      // Both min and max
      priceWhere.AND = [{ price: { gte: min } }, { price: { lte: max } }];
    } else if (min !== undefined) {
      // Only min (events priced >= min)
      priceWhere.price = { gte: min };
    } else if (max !== undefined) {
      // Only max (events priced <= max, but > 0 for paid events)
      priceWhere.AND = [{ price: { lte: max } }, { price: { gt: 0 } }];
    }

    const tickets = await prisma.ticket.findMany({
      where: priceWhere,
      select: { eventIdentity: true },
      distinct: ["eventIdentity"],
    });

    return new Set(
      tickets.map((t: { eventIdentity: string }) => t.eventIdentity),
    );
  }

  /**
   * Resolve sorting based on filter option
   * Does NOT affect filtering logic
   */
  private getOrderBy(filters: EventFilterDTO) {
    switch (filters.sortBy) {
      case "A_Z":
        return { title: "asc" };

      case "Z_A":
        return { title: "desc" };

      case "MOST_VIEWED":
        return { viewCount: "desc" };

      case "RECENT":
        // Prefer publishedAt, fallback to createdAt
        return [{ publishedAt: "desc" }, { createdAt: "desc" }];

      default:
        // Existing default behavior
        return { createdAt: "desc" };
    }
  }
}
