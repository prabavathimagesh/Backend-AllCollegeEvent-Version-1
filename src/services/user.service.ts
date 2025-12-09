const prisma = require("../config/db.config");

class UserService {
  static async getAllUsers() {
    // fetching all users who are not deleted
    return prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUserById(identity: string) {
    // fetching a single user by identity (unique id)
    return prisma.user.findUnique({
      where: { identity },
    });
  }

  static async updateUser(identity: string, data: any) {
    // updating user information based on identity
    return prisma.user.update({
      where: { identity },
      data,
    });
  }
  
  static async deleteUser(identity: string) {
    // soft deleting user by marking isDeleted as true
    return prisma.user.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }
}

export default UserService;
