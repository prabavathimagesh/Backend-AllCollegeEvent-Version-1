const prisma = require("../config/db.config");
import { EventType, EventWithRelations } from "../types/type";
import { Prisma } from "@prisma/client";
import { EVENT_FULL_INCLUDE } from "../services/event/event.include";
import { enrichEvents } from "../services/event/event.enricher";

export class OrgService {
  static async getAllOrgs() {
    return prisma.org.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        identity: true,
        organizationName: true,
        domainEmail: true, // FIXED
        createdAt: true,
        id: true,
        organizationCategory: true,
        city: true,
        state: true,
        country: true,
        profileImage: true,
        isVerified: true,
        updatedAt: true,
        isActive: true,
        website: true,
        isAdminCreated: true,
        adminCreatedBy: true,
        socialLinks: true,
        _count: {
          select: {
            events: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
    });
  }

  static async getOrgById(identity: string) {
    // fetching a single organization by identity
    return prisma.org.findUnique({
      where: { identity },
    });
  }

  static async updateOrg(identity: string, data: any) {
    // mapping incoming fields to database fields before update
    const mappedData = {
      ...(data.password && { password: data.password }),
      ...(data.org_name && { organizationName: data.org_name }),
      ...(data.org_cat && { organizationCategory: data.org_cat }),
      ...(data.country && { country: data.country }),
      ...(data.state && { state: data.state }),
      ...(data.city && { city: data.city }),
      ...(data.pImg && { profileImage: data.pImg }),
      ...(data.left_url && { logoUrl: data.left_url }),
      ...(data.website && { website: data.website }),
      ...(typeof data.is_active !== "undefined" && {
        isActive: data.is_active,
      }),
    };

    // updating organization details with mapped values
    return prisma.org.update({
      where: { identity },
      data: mappedData,
    });
  }

  static async deleteOrg(identity: string) {
    // soft-deleting organization by setting isDeleted = true
    return prisma.org.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }

  static async getEventsByOrg(identity: string): Promise<EventType[]> {
    const BASE_URL = process.env.BASE_URL ?? "";

    // fetching all events that belong to specific organization
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

    // mapping banner image URLs to include BASE_URL
    return events.map((event: EventType) => ({
      ...event,
      bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
    }));
  }

  static async getEventsByOrganization(identity: string) {
    if (!identity) {
      throw new Error("Organization ID is required");
    }

    // Fetch events + count together
    const [events, count] = await prisma.$transaction([
      prisma.event.findMany({
        where: {
          orgIdentity: identity, // NO status filter
        },
        orderBy: {
          createdAt: "desc",
        },
        include: EVENT_FULL_INCLUDE,
      }),

      prisma.event.count({
        where: {
          orgIdentity: identity,
        },
      }),
    ]);

    // Enrich using shared helper
    const enrichedEvents = await enrichEvents(events);

    return {
      count,
      events: enrichedEvents,
    };
  }
}
