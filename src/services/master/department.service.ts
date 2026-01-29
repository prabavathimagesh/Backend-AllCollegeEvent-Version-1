const prisma = require("../../config/db.config");

class DepartmentService {

  /* ================= DEPARTMENTS ================= */

  static async createDepartment(name: string) {
    return prisma.aceDepartment.create({
      data: { name },
    });
  }

  static async getAllDepartments() {
    return prisma.aceDepartment.findMany({
      orderBy: { name: "asc" },
      select: {
        identity: true,
        name: true,
      },
    });
  }

  static async getDepartmentById(id: string) {
    return prisma.aceDepartment.findUnique({
      where: { identity: id },
    });
  }

  static async updateDepartment(id: string, name?: string) {
    return prisma.aceDepartment.update({
      where: { identity: id },
      data: {
        ...(name && { name }),
      },
    });
  }

  static async deleteDepartment(id: string) {
    return prisma.aceDepartment.delete({
      where: { identity: id },
    });
  }

  /* ================= ELIGIBLE DEPARTMENTS ================= */

  static async createEligibleDepartment(name: string) {
    return prisma.aceEligibleDepartment.create({
      data: { name },
    });
  }

  static async getAllEligibleDepartments() {
    return prisma.aceEligibleDepartment.findMany({
      orderBy: { name: "asc" },
      select: {
        identity: true,
        name: true,
      },
    });
  }

  static async getEligibleDepartmentById(id: string) {
    return prisma.aceEligibleDepartment.findUnique({
      where: { identity: id },
    });
  }

  static async updateEligibleDepartment(id: string, name?: string) {
    return prisma.aceEligibleDepartment.update({
      where: { identity: id },
      data: {
        ...(name && { name }),
      },
    });
  }

  static async deleteEligibleDepartment(id: string) {
    return prisma.aceEligibleDepartment.delete({
      where: { identity: id },
    });
  }
}

export default DepartmentService;
