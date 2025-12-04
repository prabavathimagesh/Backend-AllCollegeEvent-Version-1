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

  static async getEventByIdService(id: String) {
    return await prisma.event.findUnique({
      where: { identity: id },
    });
  }

  static async updateEventService(
    id: String,
    data: {
      event_title?: string;
      description?: string;
      event_date?: string;
      event_time?: string;
      mode?: string;
      image?: string | null;
      venue?: string;
    }
  ) {
    return await prisma.event.update({
      where: { identity: id },
      data: {
        title: data.event_title,
        description: data.description,
        bannerImage: data.image ?? undefined,
        eventDate: data.event_date,
        eventTime: data.event_time,
        mode: data.mode,
        venue: data.venue,
      },
    });
  }

  static async deleteEventService(id: String) {
    return await prisma.event.delete({
      where: { identity: id },
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
}
