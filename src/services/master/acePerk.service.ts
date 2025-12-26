const prisma = require("../../config/db.config");

export class AcePerkService {
  static create(perkName: string) {
    return prisma.acePerk.create({ data: { perkName } });
  }

  static getAll() {
    return prisma.acePerk.findMany({ orderBy: { createdAt: "desc" } });
  }

  static getById(identity: string) {
    return prisma.acePerk.findUnique({ where: { identity } });
  }

  static update(identity: string, perkName: string) {
    return prisma.acePerk.update({
      where: { identity },
      data: { perkName },
    });
  }

  static delete(identity: string) {
    return prisma.acePerk.delete({ where: { identity } });
  }
}
