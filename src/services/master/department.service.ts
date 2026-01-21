const prisma = require("../../config/db.config");

class DepartmentService {
  // Get all departments
  static async getAllDepartments() {
    return prisma.aceDepartment.findMany({
      orderBy: { name: "asc" },
      select: {
        identity: true,
        name: true,
      },
    });
  }

  // Get all eligible departments
  static async getAllEligibleDepartments() {
    return prisma.aceEligibleDepartment.findMany({
      orderBy: { name: "asc" },
      select: {
        identity: true,
        name: true,
      },
    });
  }
}

export default DepartmentService;
