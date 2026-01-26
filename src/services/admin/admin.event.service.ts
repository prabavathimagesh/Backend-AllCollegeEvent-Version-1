const prisma = require("../../config/db.config");

// Event type definition
import { EventType } from "../../types/type";

// Allowed event status values
import { EVENT_STATUS_LIST } from "../../constants/event.status.message";

// Admin event messages
import { ADMIN_EVENT_MESSAGES } from "../../constants/admin.event.message";
import { EVENT_FULL_INCLUDE } from "../event/event.include";
import { enrichEvents } from "../event/event.enricher";

/**
 * Admin Event Service
 * Handles admin-level event operations
 */
export default class AdminEventService {

  static async getAllEvents() {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: EVENT_FULL_INCLUDE,
    });

    return enrichEvents(events);
  }

  static async getEventsByOrg(orgId: string) {
    const events = await prisma.event.findMany({
      where: { orgIdentity: orgId },
      include: EVENT_FULL_INCLUDE,
    });

    return enrichEvents(events); // clean & simple
  }

  static async getEventById(orgId: string, eventId: string) {
    const BASE_URL = process.env.BASE_URL ?? "";

    const event = await prisma.event.findFirst({
      where: { identity: eventId, orgIdentity: orgId },
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

    if (!event) return null;

    return {
      ...event,
      bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
    };
  }

  static async createEvent(orgId: string, data: any) {
    return prisma.event.create({
      data: {
        orgIdentity: orgId,
        title: data.event_title,
        description: data.description,
        bannerImage: data.image,
        eventDate: data.event_date,
        eventTime: data.event_time,
        mode: data.mode,
        venue: data.venue,
      },
    });
  }

  static async updateEvent(orgId: string, eventId: string, payload: any) {
    return prisma.event.update({
      where: { identity: eventId, orgIdentity: orgId },
      data: {
        title: payload.event_title,
        description: payload.description,
        bannerImage: payload.bannerImage,
        eventDate: payload.event_date,
        eventTime: payload.event_time,
        mode: payload.mode,
        venue: payload.venue,
        updatedAt: new Date(),
      },
    });
  }

  static async deleteEvent(orgId: string, eventId: string) {
    return prisma.event.deleteMany({
      where: { identity: eventId, orgIdentity: orgId },
    });
  }

  static async updateEventStatus(eventId: string, status: string) {
    // Validate status
    if (!EVENT_STATUS_LIST.includes(status)) {
      throw new Error(ADMIN_EVENT_MESSAGES.INVALID_EVENT_STATUS);
    }

    const event = await prisma.event.findUnique({
      where: { identity: eventId },
    });

    if (!event) {
      throw new Error(ADMIN_EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    return prisma.event.update({
      where: { identity: eventId },
      data: {
        status,
        publishedAt: status === "APPROVED" ? new Date() : null,
      },
    });
  }
}
