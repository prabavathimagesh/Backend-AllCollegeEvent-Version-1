const prisma = require("../../config/db.config");

// Event type definition
import { EventType } from "../../types/type";

// Allowed event status values
import { EVENT_STATUS_LIST } from "../../constants/event.status.message";

/**
 * Admin Event Service
 * Handles admin-level event operations
 */
export default class AdminEventService {

  /**
   * Fetch all events in the system
   * Includes organization details
   */
  static async getAllEvents() {
    // Base URL for image mapping
    const BASE_URL = process.env.BASE_URL ?? "";

    // Fetch all events ordered by latest first
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Include organization details
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

    // Attach full banner image URL
    return events.map((e: EventType) => ({
      ...e,
      bannerImage: e.bannerImage ? `${BASE_URL}${e.bannerImage}` : null,
    }));
  }

  /**
   * Fetch all events created by a specific organization
   */
  static async getEventsByOrg(orgId: string) {
    // Base URL for image mapping
    const BASE_URL = process.env.BASE_URL ?? "";

    // Fetch events for the given organization
    const events = await prisma.event.findMany({
      where: { orgIdentity: orgId },
      include: {
        // Include organization details
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
      orderBy: { createdAt: "desc" },
    });

    // Attach full banner image URL
    return events.map((e: EventType) => ({
      ...e,
      bannerImage: e.bannerImage ? `${BASE_URL}${e.bannerImage}` : null,
    }));
  }

  /**
   * Fetch a single event by organization and event ID
   */
  static async getEventById(orgId: string, eventId: string) {
    // Base URL for image mapping
    const BASE_URL = process.env.BASE_URL ?? "";

    // Fetch event matching org and event ID
    const event = await prisma.event.findFirst({
      where: { identity: eventId, orgIdentity: orgId },
      include: {
        // Include organization details
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

    // Return null if event not found
    if (!event) return null;

    // Attach full banner image URL
    return {
      ...event,
      bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
    };
  }

  /**
   * Create a new event under an organization
   */
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

  /**
   * Update event details
   */
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

  /**
   * Delete an event under an organization
   */
  static async deleteEvent(orgId: string, eventId: string) {
    return prisma.event.deleteMany({
      where: { identity: eventId, orgIdentity: orgId },
    });
  }

  /**
   * Update event status (Admin action)
   */
  static async updateEventStatus(eventId: string, status: string) {
    // Validate incoming status value
    if (!EVENT_STATUS_LIST.includes(status)) {
      throw new Error("Invalid event status");
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { identity: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Update status and published time
    return prisma.event.update({
      where: { identity: eventId },
      data: {
        status,
        publishedAt: status === "APPROVED" ? new Date() : null,
      },
    });
  }
}
