const prisma = require("../config/db.config");

// Utility imports
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail } from "../utils/sendOtp";

// Auth-related constant messages
import { AUTH_MESSAGES } from "../constants/auth.message";

/**
 * Send organization account verification email
 * Triggered after successful org signup
 */
const sendVerificationMail = async (org: any) => {
  // Frontend verification URL base
  const URL = process.env.MAIL_SEND;

  // Generate verification token
  const token = generateToken({ identity: org.identity });

  // Construct verification URL
  const verifyUrl = `${URL}auth/email-verify?token=${token}`;

  // Email HTML template
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

  // Send verification email
  await sendEmail({
    to: org.domainEmail,
    subject: "Verify your account",
    html,
  });
};

/**
 * Authentication service
 * Handles signup, login, verification, OTP, password reset & Google login
 */
export class AuthService {

  /**
   * Signup user or organization
   */
  static async signup(
    name: string,
    email: string,
    password: string,
    type: "user" | "org",
    extra: any
  ) {
    // Fetch role based on type
    const role = await prisma.role.findFirst({
      where: { name: type },
    });

    if (!role) throw new Error(AUTH_MESSAGES.ROLE_NOT_FOUND);

    // Check if email already exists
    const existsUser = await prisma.user.findUnique({ where: { email } });
    const existsOrg = await prisma.org.findUnique({
      where: { domainEmail: email },
    });

    if (existsUser || existsOrg)
      throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);

    // Hash password
    const hashed = await hashPassword(password);

    // User signup
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

    // Organization signup
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

      // Send verification email
      await sendVerificationMail(org);

      return org;
    }

    throw new Error(AUTH_MESSAGES.INVALID_TYPE);
  }

  /**
   * Login for user or organization
   */
  static async login(email: string, password: string, type: "user" | "org") {
    let user;

    // User login validation
    if (type === "user") {
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) throw new Error(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);
      if (user.isDeleted) throw new Error(AUTH_MESSAGES.ACCOUNT_DELETED);
      if (!user.isActive) throw new Error(AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }
    // Organization login validation
    else if (type === "org") {
      user = await prisma.org.findUnique({ where: { domainEmail: email } });

      if (!user) throw new Error(AUTH_MESSAGES.ORG_NOT_FOUND);
      if (user.isDeleted) throw new Error(AUTH_MESSAGES.ORG_DELETED);
      if (!user.isVerified) throw new Error(AUTH_MESSAGES.ORG_NOT_VERIFIED);
    }

    // Validate password
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Error(AUTH_MESSAGES.INVALID_PASSWORD);

    // Fetch role UUID
    let roleUUID = null;

    if (user.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: user.roleId },
        select: { idnty: true },
      });
      roleUUID = role?.idnty || null;
    }

    // Attach role UUID to response
    const data = {
      ...user,
      roleId: roleUUID,
    };

    // Generate JWT
    const token = generateToken({
      identity: user.identity,
      email,
      roleId: roleUUID,
      type,
    });

    return { data, token };
  }

  /**
   * Verify organization account using token
   */
  static async verifyOrg(token: string) {
    if (!token) throw new Error(AUTH_MESSAGES.TOKEN_MISSING);

    let decoded: any;

    try {
      decoded = verifyToken(token);
    } catch {
      throw new Error(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    const orgIdnty = decoded.data.identity;

    const org = await prisma.org.findUnique({
      where: { identity: orgIdnty },
    });

    if (!org) throw new Error(AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN);

    // Mark org as verified
    await prisma.org.update({
      where: { identity: orgIdnty },
      data: { isVerified: true },
    });

    return {
      success: true,
      message: AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
    };
  }

  /**
   * Forgot password - send OTP
   */
  static async forgotPassword(email: string) {
    if (!email) throw new Error(AUTH_MESSAGES.EMAIL_REQUIRED);

    let account = await prisma.user.findUnique({ where: { email } });

    if (!account) {
      account = await prisma.org.findUnique({
        where: { domainEmail: email },
      });
    }

    if (!account) throw new Error(AUTH_MESSAGES.EMAIL_NOT_FOUND);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: expAt,
        userIdentity: account.email ? account.identity : null,
        orgIdentity: account.domainEmail ? account.identity : null,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp, 10);

    return {
      success: true,
      message: AUTH_MESSAGES.OTP_SENT,
    };
  }

  /**
   * Resend OTP
   */
  static async resendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    const org = await prisma.org.findUnique({ where: { domainEmail: email } });

    if (!user && !org) throw new Error(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const existingOtp = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create OTP
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
      message: AUTH_MESSAGES.OTP_RESENT,
    };
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(email: string, otp: string) {
    const record = await prisma.oTP.findFirst({
      where: { email, code: otp, purpose: "FORGOT_PASSWORD" },
      orderBy: { id: "desc" },
    });

    if (!record) throw new Error(AUTH_MESSAGES.INVALID_OTP);
    if (record.expAt < new Date()) throw new Error(AUTH_MESSAGES.OTP_EXPIRED);

    return {
      success: true,
      message: AUTH_MESSAGES.OTP_VERIFIED,
    };
  }

  /**
   * Reset password using OTP
   */
  static async resetPassword(email: string, newPassword: string) {
    if (!email) throw new Error(AUTH_MESSAGES.EMAIL_REQUIRED);
    if (!newPassword) throw new Error(AUTH_MESSAGES.PASSWORD_REQUIRED);

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

    if (updatedUser.count === 0) {
      throw new Error(AUTH_MESSAGES.EMAIL_NOT_FOUND);
    }

    return {
      success: true,
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }

  /**
   * Google OAuth login
   */
  static async googleLogin(googleToken: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error(AUTH_MESSAGES.GOOGLE_LOGIN_FAILED);

    const { email, name, picture } = payload;

    const role = await prisma.role.findFirst({
      where: { name: "user" },
    });

    if (!role) throw new Error(AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND);

    const roleUUID = role.idnty;

    let user = await prisma.user.findUnique({ where: { email } });

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
      email,
      roleId: roleUUID,
      type: "user",
    });

    return { user, token };
  }
}
