const prisma = require("../../config/db.config");
import { hashPassword } from "../../utils/hash";
import { ADMIN_ORG_MESSAGES } from "../../constants/admin.org.message";
import { OrgWithCount } from "../../types/type";

export default class AdminOrgService {

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
    // retrieve a single organization by identity
    return prisma.org.findUnique({
      where: { identity },
    });
  }

  static async createOrg(payload: any) {
    // check if organization already exists
    const exists = await prisma.org.findUnique({
      where: { domainEmail: payload.domainEmail },
    });

    if (exists) {
      throw new Error(ADMIN_ORG_MESSAGES.ORG_ALREADY_EXISTS);
    }

    // encrypt password
    payload.password = await hashPassword(payload.password);

    // create organization
    return prisma.org.create({
      data: {
        domainEmail: payload.domainEmail,
        password: payload.password,
        organizationName: payload.organizationName,
        organizationCategory: payload.organizationCategory,
        country: payload.country,
        state: payload.state,
        city: payload.city,

        // mark admin-created org
        isAdminCreated: true,
      },
    });
  }

  static async updateOrg(identity: string, data: any) {
    return prisma.org.update({
      where: { identity },
      data,
    });
  }

  static async deleteOrg(identity: string) {
    // soft delete
    return prisma.org.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }
}
