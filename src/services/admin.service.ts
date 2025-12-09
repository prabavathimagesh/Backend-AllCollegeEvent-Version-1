const prisma = require("../config/db.config");
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { sendOtpEmail } from "../utils/sendOtp";

export default class AdminService {
  static async login(email: string, password: string) {
    // fetching user along with role to verify admin permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // checking if user exists
    if (!user) throw new Error("Admin account not found");

    // validating account status
    if (user.isDeleted) throw new Error("Account deleted");
    if (!user.isActive) throw new Error("Account inactive");

    // verifying if user is actually an admin (via flag or role name)
    const isAdminFlag = (user as any).isAdmin === true;
    const roleIsAdmin = user.role?.name?.toLowerCase() === "admin";
    if (!isAdminFlag && !roleIsAdmin) throw new Error("Not an admin");

    // checking password correctness
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    // generating admin login token
    const token = generateToken({
      identity: user.identity,
      email: user.email,
      roleId: user.role ? user.role.idnty : null,
      type: "admin",
    });

    // removing password from response
    const { password: _p, ...rest } = user as any;
    return { user: rest, token };
  }

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

    // ensuring password is provided
    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    } else {
      throw new Error("Password is required");
    }

    // creating new user
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
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
