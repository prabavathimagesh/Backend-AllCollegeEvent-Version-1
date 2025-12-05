const prisma = require("../config/db.config");
import { EventType } from "../types/event.type";

export class OrgService {
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

    return prisma.org.update({
      where: { identity },
      data: mappedData,
    });
  }

  static async deleteOrg(identity: string) {
    return prisma.org.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }

  static async getEventsByOrg(identity: string): Promise<EventType[]> {
    const BASE_URL = process.env.BASE_URL ?? "";

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

    return events.map((event: EventType) => ({
      ...event,
      bannerImage: event.bannerImage ? `${BASE_URL}${event.bannerImage}` : null,
    }));
  }
}
