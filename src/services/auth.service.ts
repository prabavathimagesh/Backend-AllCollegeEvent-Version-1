const prisma = require("../config/db.config");
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";

const sendVerificationMail = async (org: any) => {
  const URL = process.env.MAIL_SEND;

  const token = generateToken(org.idnty);

  const verifyUrl = `${URL}?token=${token}`;

  const html = `
    <h2>Verify Your Organization Account</h2>
    <p>Hello <b>${org.org_name}</b>,</p>
    <p>Your account was created successfully. Please click the link below to verify:</p>
    <a href="${verifyUrl}" 
       style="padding:10px 15px; background:#4CAF50; color:white; border-radius:4px; text-decoration:none;">
      Verify Your Account
    </a>
    <p>After verification, you can login using the login page.</p>
  `;

  await sendEmail({
    to: org.domEmail,
    subject: "Verify your account",
    html,
  });
};

export class AuthService {
  static async signup(
    name: string,
    email: string,
    password: string,
    type: "user" | "org",
    extra: any
  ) {
    const role = await prisma.role.findFirst({
      where: { name: type },
    });

    if (!role) throw new Error("Role not found in database");

    const existsUser = await prisma.user.findUnique({ where: { email } });
    const existsOrg = await prisma.org.findUnique({
      where: { domEmail: email },
    });

    if (existsUser || existsOrg) throw new Error("Email already registered");

    const hashed = await hashPassword(password);

    if (type === "user") {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          pwd: hashed,
          roleId: role.id,
        },
      });

      return user;
    }

    if (type === "org") {
      const org = await prisma.org.create({
        data: {
          domEmail: email,
          pwd: hashed,
          roleId: role.id,
          org_name: extra.org_name,
          org_cat: extra.org_cat,
          country: extra.country,
          state: extra.state,
          city: extra.city,
          pImg: extra.pImg ?? null,
        },
      });

      await sendVerificationMail(org);

      return org;
    }

    throw new Error("Invalid type");
  }

  static async login(email: string, password: string, type: "user" | "org") {
    let user;

    if (type === "user") {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (type === "org") {
      user = await prisma.org.findUnique({ where: { domEmail: email } });
    }

    if (!user) throw new Error("Account not found");

    const ok = await comparePassword(password, user.pwd);
    if (!ok) throw new Error("Invalid password");

    let roleUUID = null;

    if (user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: user.roleId },
        select: { idnty: true },
      });
      roleUUID = role?.idnty || null;
    }

    const userResponse = {
      ...user,
      roleId: roleUUID,
    };

    const token = generateToken({
      id: user.id,
      idnty: user.idnty,
      email: email,
      roleId: roleUUID,
      type: type,
    });

    return { user: userResponse, token };
  }

  static async verifyOrg(token: string) {
    if (!token) throw new Error("Token missing");

    let decoded: any;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new Error("Invalid or expired token");
    }

    const orgIdnty = decoded.data;

    const org = await prisma.org.findUnique({
      where: { idnty: orgIdnty },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    await prisma.org.update({
      where: { idnty: orgIdnty },
      data: { isVerf: true },
    });

    return {
      success: true,
      message: "Account verified successfully",
    };
  }
}
