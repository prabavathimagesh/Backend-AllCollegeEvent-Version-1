const prisma = require("../config/db.config");

export class OrgService {
  // Events
  static async createEventService(data: {
    org_id: number;
    event_title: string;
    description?: string;
    event_date: string;
    event_time: string;
    mode: string;
    image: string | null;
    venue: string;
  }) {
    const event = await prisma.event.create({
      data: {
        orgIdentity: data.org_id,
        title: data.event_title,
        description: data.description,
        bannerImage: data.image,
        eventDate: data.event_date,
        eventTime: data.event_time,
        mode: data.mode,
        venue: data.venue,
      },
    });

    return event;
  }

  static async getAllEventsService() {
    return await prisma.event.findMany({
      orderBy: { createdBy: "desc" },
    });
  }

  static async getEventById(orgId: string, eventId: string) {
    return prisma.event.findFirst({
      where: {
        identity: eventId,
        orgIdentity: orgId,
      },
    });
  }

  static async updateEvent(orgId: string, eventId: string, data: any) {
    return prisma.event.updateMany({
      where: {
        identity: eventId,
        orgIdentity: orgId,
      },
      data,
    });
  }

  static async deleteEvent(orgId: string, eventId: string) {
    return prisma.event.deleteMany({
      where: {
        identity: eventId,
        orgIdentity: orgId,
      },
    });
  }

  // Org
  static async getAllOrgs() {
    return prisma.org.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getOrgById(identity: string) {
    return prisma.org.findUnique({
      where: { identity },
    });
  }

  static async updateOrg(identity: string, data: any) {
    return prisma.org.update({
      where: { identity },
      data,
    });
  }

  static async deleteOrg(identity: string) {
    return prisma.org.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }

  static async getEventsByOrg(identity: string) {
    return prisma.event.findMany({
      where: {
        orgIdentity: identity,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
