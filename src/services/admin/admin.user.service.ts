const prisma = require("../../config/db.config");
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken, verifyToken } from "../../utils/jwt";

export default class AdminUserService {
  static async listUsers(page = 1, limit = 20) {
    // applying pagination logic
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // fetching users + total count in parallel
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          identity: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          isDeleted: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    // returning paginated response
    return {
      data: rows,
      meta: {
        total,
        page: Number(page),
        limit: take,
      },
    };
  }

  static async getUserById(userID: string) {
    // fetching a single user with selected fields only
    const user = await prisma.user.findUnique({
      where: { identity: userID },
      select: {
        id: true,
        identity: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  static async createUser(payload: any) {
    // checking if the email already exists
    const found = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (found) throw new Error("Email already in use");

    const role = await prisma.role.findFirst({
      where: { name: "user" },
    });

    if (!role) {
      throw new Error("Invalid role name");
    }

    // ensure password provided
    if (!payload.password) {
      throw new Error("Password is required");
    }

    payload.password = await hashPassword(payload.password);

    // creating new user
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        roleId: role.id,
      },
      select: {
        identity: true,
        name: true,
        email: true,
        isActive: true,
        roleId: true,
      },
    });

    return user;
  }

  static async updateUser(userID: string, payload: any) {
    // preventing modification of restricted fields
    delete payload.identity;
    delete payload.id;
    delete payload.createdAt;

    // hashing password if updated
    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }

    // normalizing phone number field
    if (payload.phone) payload.phone = String(payload.phone);

    // updating user with new payload
    const user = await prisma.user.update({
      where: { identity: userID },
      data: payload,
      select: {
        identity: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isDeleted: true,
      },
    });

    return user;
  }

  static async deleteUser(userID: string) {
    // soft-delete user (safer than permanent deletion)
    const user = await prisma.user.update({
      where: { identity: userID },
      data: { isDeleted: true, isActive: false },
      select: { identity: true, email: true, isDeleted: true },
    });
    return user;
  }
}
