const prisma = require("../../config/db.config");

export class OrgCategoryService {
  static create(categoryName: string) {
    return prisma.orgCategory.create({ data: { categoryName } });
  }

  static getAll() {
    return prisma.orgCategory.findMany();
  }
}
