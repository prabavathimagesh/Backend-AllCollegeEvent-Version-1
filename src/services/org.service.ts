const prisma = require("../config/db.config");
import { EventType } from "../types/type";
import { Prisma } from "@prisma/client";

/**
 * Event with required relations (NEW SCHEMA)
 */
type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    org: true;
    cert: true;
    location: true;
    calendars: true;
    tickets: true;
    eventPerks: {
      include: { perk: true };
    };
    eventAccommodations: {
      include: { accommodation: true };
    };
    Collaborator: {
      include: {
        member: true;
        org: true;
      };
    };
  };
}>;

export class OrgService {
  static async getAllOrgs() {
    // fetching all organizations that are not deleted
    return prisma.org.findMany({
      orderBy: { createdAt: "desc" },
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

    // ✅ Fetch events + count together
    const [events, count] = await prisma.$transaction([
      prisma.event.findMany({
        where: {
          orgIdentity: identity, // NO status filter
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
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

          cert: {
            select: {
              identity: true,
              certName: true,
            },
          },

          location: true,
          calendars: true,
          tickets: true,

          eventPerks: {
            include: {
              perk: true,
            },
          },

          eventAccommodations: {
            include: {
              accommodation: true,
            },
          },

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
        },
      }),
    ]);

    const typedEvents: EventWithRelations[] = events;

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
}
