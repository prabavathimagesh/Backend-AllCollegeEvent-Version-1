const prisma = require("../../config/db.config");
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken, verifyToken } from "../../utils/jwt";

export default class AdminAuthService {
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
}
