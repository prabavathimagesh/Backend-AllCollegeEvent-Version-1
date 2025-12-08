const prisma = require("../config/db.config");
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail } from "../utils/sendOtp";

const sendVerificationMail = async (org: any) => {
  const URL = process.env.MAIL_SEND;

  const token = generateToken({ identity: org.identity });

  const verifyUrl = `${URL}verify?token=${token}`;

  const html = `
    <h2>Verify Your Organization Account</h2>
    <p>Hello <b>${org.organizationName}</b>,</p>
    <p>Your account was created successfully. Please click the link below to verify:</p>
    <a href="${verifyUrl}" 
       style="padding:10px 15px; background:#4CAF50; color:white; border-radius:4px; text-decoration:none;">
      Verify Your Account
    </a>
    <p>After verification, you can login using the login page.</p>
  `;

  await sendEmail({
    to: org.domainEmail,
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
      where: { domainEmail: email },
    });

    if (existsUser || existsOrg) throw new Error("Email already registered");

    const hashed = await hashPassword(password);

    if (type === "user") {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          roleId: role.id,
        },
      });

      return user;
    }

    if (type === "org") {
      const org = await prisma.org.create({
        data: {
          domainEmail: email,
          password: hashed,
          roleId: role.id,
          organizationName: extra.org_name,
          organizationCategory: extra.org_cat,
          country: extra.country,
          state: extra.state,
          city: extra.city,
          profileImage: extra.pImg ?? null,
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
      user = await prisma.org.findUnique({ where: { domainEmail: email } });
    }

    if (!user) throw new Error("Account not found");

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error("Invalid password");

    let roleUUID = null;

    if (user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: user.roleId },
        select: { idnty: true },
      });
      roleUUID = role?.idnty || null;
    }

    const data = {
      ...user,
      roleId: roleUUID,
    };

    const token = generateToken({
      identity: user.identity,
      email: email,
      roleId: roleUUID,
      type: type,
    });

    return { data, token };
  }

  static async verifyOrg(token: string) {
    if (!token) throw new Error("Token missing");

    let decoded: any;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new Error("Invalid or expired token");
    }

    const orgIdnty = decoded.data.identity;

    const org = await prisma.org.findUnique({
      where: { identity: orgIdnty },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    await prisma.org.update({
      where: { identity: orgIdnty },
      data: { isVerified: true },
    });

    return {
      success: true,
      message: "Account verified successfully",
    };
  }

  static async forgotPassword(email: string) {
    if (!email) throw new Error("Email is required");

    let account = await prisma.user.findUnique({ where: { email } });

    if (!account) {
      account = await prisma.org.findUnique({
        where: { domainEmail: email },
      });
    }

    if (!account) throw new Error("Email not found");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: expAt,
        userIdentity: account.email ? account.identity : null,
        orgIdentity: account.domEmail ? account.id : null,
      },
    });

    await sendOtpEmail(email, otp, 10);

    return {
      success: true,
      message: "OTP sent to email",
    };
  }

  static async resendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    const org = await prisma.org.findUnique({ where: { domainEmail: email } });

    if (!user && !org) {
      throw new Error("Account not found");
    }

    const existingOtp = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingOtp) {
      await prisma.oTP.update({
        where: { id: existingOtp.id },
        data: {
          code: otp,
          expiresAt: expAt,
          createdAt: new Date(),
        },
      });
    } else {
      await prisma.oTP.create({
        data: {
          email,
          code: otp,
          expiresAt: expAt,
          createdAt: new Date(),
          userIdentity: user ? user.identity : null,
          orgIdentity: org ? org.identity : null,
        },
      });
    }

    await sendOtpEmail(email, otp, 10);

    return {
      success: true,
      message: "OTP resent successfully",
    };
  }

  static async verifyOtp(email: string, otp: string) {
    const record = await prisma.oTP.findFirst({
      where: { email, code: otp, purpose: "FORGOT_PASSWORD" },
      orderBy: { id: "desc" },
    });

    if (!record) throw new Error("Invalid OTP");
    if (record.expAt < new Date()) throw new Error("OTP expired");

    return {
      success: true,
      message: "OTP verified successfully",
    };
  }

  static async resetPassword(email: string, newPassword: string) {
    const hashed = await hashPassword(newPassword);

    let updatedUser = await prisma.user.updateMany({
      where: { email },
      data: { password: hashed },
    });

    if (updatedUser.count === 0) {
      updatedUser = await prisma.org.updateMany({
        where: { domainEmail: email },
        data: { password: hashed },
      });
    }

    if (updatedUser.count === 0) throw new Error("Email not found");

    return {
      success: true,
      message: "Password reset successful",
    };
  }

  static async googleLogin(googleToken: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google token");

    const { email, name, picture } = payload;

    const role = await prisma.role.findFirst({
      where: { name: "user" },
    });

    if (!role) throw new Error("Default role 'user' not found");

    const roleUUID = role.idnty;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          password: "",
          profileImage: picture || null,
          roleId: role.id,
        },
      });
    }

    const token = generateToken({
      identity: user.identity,
      email: email,
      roleId: roleUUID,
      type: "user",
    });

    return { user, token };
  }
}
