const prisma = require("../../config/db.config");

export class OrgCategoryService {

  // CREATE
  static create(categoryName: string) {
    return prisma.orgCategory.create({
      data: { categoryName },
    });
  }

  // GET ALL
  static getAll() {
    return prisma.orgCategory.findMany({
      orderBy: { categoryName: "asc" },
    });
  }

  // GET BY ID
  static getById(id: string) {
    return prisma.orgCategory.findUnique({
      where: { identity: id },
    });
  }

  // UPDATE (optional field)
  static update(id: string, categoryName?: string) {
    return prisma.orgCategory.update({
      where: { identity: id },
      data: {
        ...(categoryName && { categoryName }),
      },
    });
  }

  // DELETE
  static delete(id: string) {
    return prisma.orgCategory.delete({
      where: { identity: id },
    });
  }
}
