const prisma = require("../config/db.config");

class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUserById(identity: string) {
    return prisma.user.findUnique({
      where: { identity },
    });
  }

  static async updateUser(identity: string, data: any) {
    return prisma.user.update({
      where: { identity },
      data,
    });
  }
  
  static async deleteUser(identity: string) {
    return prisma.user.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }
}

export default UserService;
