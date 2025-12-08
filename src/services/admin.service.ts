const prisma = require("../config/db.config");
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { sendOtpEmail } from "../utils/sendOtp";

export default class AdminService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) throw new Error("Admin account not found");

    if (user.isDeleted) throw new Error("Account deleted");
    if (!user.isActive) throw new Error("Account inactive");

    // Check admin identity: flag or role name
    const isAdminFlag = (user as any).isAdmin === true;
    const roleIsAdmin = user.role?.name?.toLowerCase() === "admin";
    if (!isAdminFlag && !roleIsAdmin) throw new Error("Not an admin");

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    const token = generateToken({
      identity: user.identity,
      email: user.email,
      roleId: user.role ? user.role.idnty : null,
      type: "admin",
    });

    // hide password
    const { password: _p, ...rest } = user as any;
    return { user: rest, token };
  }

  static async listUsers(page = 1, limit = 20) {
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

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
    // ensure email not taken
    const found = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (found) throw new Error("Email already in use");

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    } else {
      // optional: generate random password or reject
      throw new Error("Password is required");
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password
      },
      select: {
        identity: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return user;
  }

  static async updateUser(userID: string, payload: any) {
    // disallow updating identity, id, createdAt
    delete payload.identity;
    delete payload.id;
    delete payload.createdAt;

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }
    if (payload.phone) payload.phone = String(payload.phone);

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
    // soft delete: set isDeleted = true (safer)
    const user = await prisma.user.update({
      where: { identity: userID },
      data: { isDeleted: true, isActive: false },
      select: { identity: true, email: true, isDeleted: true },
    });
    return user;
  }
}
