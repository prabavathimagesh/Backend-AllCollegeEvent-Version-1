const prisma = require("../../config/db.config");
import { EventType } from "../../types/type";

export default class AdminEventService {
  static async getAllEvents() {
    //fetch every event from the system
    const BASE_URL = process.env.BASE_URL ?? "";

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        org: {
          select: { organizationName: true },
        },
      },
    });

    //attach full URL to event images
    return events.map((e: EventType) => ({
      ...e,
      bannerImage: e.bannerImage ? `${BASE_URL}${e.bannerImage}` : null,
    }));
  }

  static async getEventsByOrg(orgId: string) {
    //fetch all events for a specific organization
    const BASE_URL = process.env.BASE_URL ?? "";

    const events = await prisma.event.findMany({
      where: { orgIdentity: orgId },
      include: {
        org: {
          select: { organizationName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return events.map((e: EventType) => ({
      ...e,
      bannerImage: e.bannerImage ? `${BASE_URL}${e.bannerImage}` : null,
    }));
  }

  static async getEventById(orgId: string, eventId: string) {
    //fetch a specific event from an organization
    const BASE_URL = process.env.BASE_URL ?? "";

    const event = await prisma.event.findFirst({
      where: { identity: eventId, orgIdentity: orgId },
      include: {
        org: { select: { organizationName: true } },
      },
    });

    if (!event) return null;

    return {
      ...event,
      bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
    };
  }

  static async createEvent(orgId: string, data: any) {
    //create new event under this organization
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
    //update event details
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
    //remove event under an organization
    return prisma.event.deleteMany({
      where: { identity: eventId, orgIdentity: orgId },
    });
  }
}
