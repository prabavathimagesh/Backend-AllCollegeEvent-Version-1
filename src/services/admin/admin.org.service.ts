const prisma = require("../../config/db.config");
import { hashPassword } from "../../utils/hash";

export default class AdminOrgService {
  
  static async getAllOrgs() {
    //fetch all non-deleted organizations for admin panel
    return prisma.org.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getOrgById(identity: string) {
    //retrieve a single organization by identity
    return prisma.org.findUnique({
      where: { identity },
    });
  }

  static async createOrg(payload: any) {
    //check if organization already exists with this domain email
    const exists = await prisma.org.findUnique({
      where: { domainEmail: payload.domainEmail },
    });

    if (exists) throw new Error("Organization already exists");

    //encrypting organization login password
    payload.password = await hashPassword(payload.password);

    //creating new organization with admin info
    return prisma.org.create({
      data: {
        domainEmail: payload.domainEmail,
        password: payload.password,
        organizationName: payload.organizationName,
        organizationCategory: payload.organizationCategory,
        country: payload.country,
        state: payload.state,
        city: payload.city,

        //mark that admin created this organization
        isAdminCreated: true,
      },
    });
  }

  static async updateOrg(identity: string, data: any) {
    //updating organization details from admin panel
    return prisma.org.update({
      where: { identity },
      data,
    });
  }

  static async deleteOrg(identity: string) {
    //soft-delete organization instead of permanent delete
    return prisma.org.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }
}
