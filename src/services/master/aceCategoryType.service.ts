const prisma = require("../../config/db.config");

export class AceCategoryTypeService {
  static create(categoryName: string) {
    return prisma.aceCategoryType.create({ data: { categoryName } });
  }

  static getAll() {
    return prisma.aceCategoryType.findMany();
  }
}
