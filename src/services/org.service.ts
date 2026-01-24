const prisma = require("../config/db.config");
import { EventType, EventWithRelations, OrgWithCount } from "../types/type";
import { Prisma } from "@prisma/client";
import { EVENT_FULL_INCLUDE } from "../services/event/event.include";
import { enrichEvents } from "../services/event/event.enricher";
import { OrgSocialLink } from "@prisma/client";

export class OrgService {
  static async getAllOrgs() {
    const orgs = await prisma.org.findMany({
      orderBy: {
        events: {
          _count: "desc", // sort by event count
        },
      },
      select: {
        identity: true,
        organizationName: true,
        slug: true,
        domainEmail: true,
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

    const sorted = orgs.sort(
      (a: OrgWithCount, b: OrgWithCount) => b._count.events - a._count.events
    );

    return sorted.map((org: OrgWithCount, index: number) => ({
      ...org,
      eventCount: org._count.events,
      rank: index + 1,
    }));

  }


  static async getOrgById(identity: string) {
    const org = await prisma.org.findUnique({
      where: { identity },
      include: {
        socialLinks: true,
      },
    });

    if (!org) return null;

    const socialLinks = org.socialLinks.reduce(
      (acc: Record<string, string>, link: OrgSocialLink) => {
        acc[link.platform] = link.url;
        return acc;
      },
      {} as Record<string, string>
    );

    console.log(org)

    return {
      ...org,
      socialLinks,
    };
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

  static async getProtectedEventsByOrganization(identity: string, userIdentity: string) {
    if (!identity) {
      throw new Error("Organization ID is required");
    }

    // Fetch events + count together
    const [events, count] = await prisma.$transaction([
      prisma.event.findMany({
        where: {
          orgIdentity: identity,
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

    // Enrich events
    const enrichedEvents = await enrichEvents(events);

    // Like & Save Logic
    let likedEventIds: string[] = [];
    let savedEventIds: string[] = [];

    if (userIdentity) {
      type EventRecord = {
        identity: string;
      };

      const eventIds = events.map((e: EventRecord) => e.identity);

      const [likes, saves] = await Promise.all([
        prisma.eventLike.findMany({
          where: {
            userIdentity,
            eventIdentity: { in: eventIds },
          },
          select: { eventIdentity: true },
        }),
        prisma.eventSave.findMany({
          where: {
            userIdentity,
            eventIdentity: { in: eventIds },
          },
          select: { eventIdentity: true },
        }),
      ]);


      type LikeRecord = { eventIdentity: string };
      type SaveRecord = { eventIdentity: string };

      likedEventIds = likes.map((l: LikeRecord) => l.eventIdentity);
      savedEventIds = saves.map((s: SaveRecord) => s.eventIdentity);
    }

    // Attach isLiked & isSaved
    const finalEvents = enrichedEvents.map((event: any) => ({
      ...event,
      isLiked: likedEventIds.includes(event.identity),
      isSaved: savedEventIds.includes(event.identity),
    }));

    return {
      count,
      events: finalEvents,
    };
  }

  static async toggleFollow(
    followerType: "USER" | "ORG",
    followerId: string,
    followingOrgId: string
  ) {
    const existing = await prisma.follow.findFirst({
      where: {
        followerType,
        followerId,
        followingOrgId,
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { identity: existing.identity },
      });

      return { followed: false };
    }

    await prisma.follow.create({
      data: {
        followerType,
        followerId,
        followingOrgId,
      },
    });

    return { followed: true };
  }

  static async getFollowersAndFollowing(orgIdentity: string) {
    // Followers = who follows this org
    const followers = await prisma.follow.findMany({
      where: {
        followingOrgId: orgIdentity,
      },
      select: {
        followerType: true,
        followerId: true,
        createdAt: true,
      },
    });

    // Following = org follows other orgs
    const following = await prisma.follow.findMany({
      where: {
        followerType: "ORG",
        followerId: orgIdentity,
      },
      include: {
        followingOrg: {
          select: {
            identity: true,
            organizationName: true,
            profileImage: true,
            slug: true,
          },
        },
      },
    });

    return {
      orgIdentity,
      followersCount: followers.length,
      followingCount: following.length,
      followers,
      following,
    };
  }
}
