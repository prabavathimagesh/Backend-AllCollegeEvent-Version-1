const prisma = require("../config/db.config");
import { UserType } from "../types/type";
import { hashPassword } from "../utils/hash";

class UserService {
  static async getAllUsers(): Promise<UserType | null> {
    // fetching all users who are not deleted
    return prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUserById(identity: string): Promise<UserType | null> {
    // fetching a single user by identity (unique id)
    return prisma.user.findUnique({
      where: { identity },
    });
  }

  static async updateUser(
    identity: string,
    data: any
  ): Promise<UserType | null> {
    // if password exists → hash it before saving
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    return prisma.user.update({
      where: { identity },
      data,
    });
  }

  static async deleteUser(identity: string): Promise<UserType | null> {
    // soft deleting user by marking isDeleted as true
    return prisma.user.update({
      where: { identity },
      data: { isDeleted: true },
    });
  }
}

export default UserService;
