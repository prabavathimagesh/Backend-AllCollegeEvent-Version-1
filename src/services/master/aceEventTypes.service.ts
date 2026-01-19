const prisma = require("../../config/db.config");

export class AceEventTypesService {
  static create(name: string, categoryIdentity: string) {
    return prisma.aceEventTypes.create({
      data: { name, categoryIdentity },
    });
  }

  static getByCategory(categoryIdentity: string) {
    return prisma.aceEventTypes.findMany({ where: { categoryIdentity } });
  }

  static getAll() {
    return prisma.aceEventTypes.findMany({
      orderBy: { name: "asc" }, // optional but recommended
    });
  }
}
