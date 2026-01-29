const prisma = require("../../config/db.config");

export class AceCategoryTypeService {
  static create(categoryName: string) {
    return prisma.aceCategoryType.create({
      data: { categoryName },
    });
  }

  static getAll() {
    return prisma.aceCategoryType.findMany();
  }

  static getById(id: string) {
    return prisma.aceCategoryType.findUnique({
      where: { identity: id },
    });
  }

  static update(id: string, categoryName: string) {
    return prisma.aceCategoryType.update({
      where: { identity: id },
      data: { categoryName },
    });
  }

  static delete(id: string) {
    return prisma.aceCategoryType.delete({
      where: { identity: id },
    });
  }
}
