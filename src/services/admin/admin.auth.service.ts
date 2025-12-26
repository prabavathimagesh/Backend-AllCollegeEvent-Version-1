const prisma = require("../../config/db.config");
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken, verifyToken } from "../../utils/jwt";
import { ADMIN_AUTH_MESSAGES } from "../../constants/admin.auth.message";

export default class AdminAuthService {
  static async login(email: string, password: string) {
    // fetch user with role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // validations
    if (!user) {
      throw new Error(ADMIN_AUTH_MESSAGES.ADMIN_NOT_FOUND);
    }

    if (user.isDeleted) {
      throw new Error(ADMIN_AUTH_MESSAGES.ACCOUNT_DELETED);
    }

    if (!user.isActive) {
      throw new Error(ADMIN_AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }

    // admin check
    const isAdminFlag = (user as any).isAdmin === true;
    const roleIsAdmin = user.role?.name?.toLowerCase() === "admin";

    if (!isAdminFlag && !roleIsAdmin) {
      throw new Error(ADMIN_AUTH_MESSAGES.NOT_AN_ADMIN);
    }

    // password check
    const ok = await comparePassword(password, user.password);
    if (!ok) {
      throw new Error(ADMIN_AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    // token generation
    const token = generateToken({
      id:user.id,
      identity: user.identity,
      email: user.email,
      roleId: user.role ? user.role.idnty : null,
      type: "admin",
    });

    // remove password
    const { password: _p, ...rest } = user as any;

    return { user: rest, token };
  }
}
