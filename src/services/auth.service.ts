const prisma = require("../config/db.config");

// Utility imports
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { sendEmail } from "../utils/mailer";
import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail } from "../utils/sendOtp";

// Auth-related constant messages
import { AUTH_MESSAGES } from "../constants/auth.message";
import {
  getCompanyFromEmail,
  normalizeOrgName,
  isPublicEmail,
} from "../utils/helperFunction";
import { Platform } from "../types/type";
import { Prisma } from "@prisma/client";
import { generateSlug } from "../utils/slug"

/**
 * Send organization account verification email
 * Triggered after successful org signup
 */
const sendVerificationMail = async (
  recipient: {
    email: string;
    identity?: string;
    id?: number;
    name?: string;              // add this
    organizationName?: string;
  },
  platform: Platform = "web"
) => {
  if (!recipient.email) return;

  let verifyUrl = process.env.MAIL_SEND || "";

  if (recipient.identity && recipient.id) {
    const token = generateToken({ identity: recipient.identity, id: recipient.id });
    verifyUrl = `${process.env.MAIL_SEND}auth/email-verify?token=${token}`;
  }

  const displayName =
    recipient.name ||
    recipient.organizationName?.split(" ")[0] ||
    "User";

  const html = `
<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 30px 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
        All College Event
      </h1>
      <p style="color: #dbeafe; margin: 5px 0 0; font-size: 13px;">
        Connecting Colleges, Events & Opportunities
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <h2 style="color: #111827; margin-bottom: 10px;">Welcome to All College Event 🎉</h2>

      <p style="color: #374151; font-size: 14px; line-height: 1.6;">
        Hello <strong>${displayName}</strong>,
      </p>

      <p style="color: #374151; font-size: 14px; line-height: 1.6;">
        We’re excited to have you on board! 🚀  
        Your account has been successfully created on <strong>All College Event</strong>.
      </p>

      <p style="color: #374151; font-size: 14px; line-height: 1.6;">
        You can now explore events, connect with colleges, and discover new opportunities tailored for you.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

      <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
        If you didn’t create this account, please contact our support team immediately.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 15px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Need help? Contact us at 
        <a href="mailto:support@allcollegeevent.com" style="color: #2563eb; text-decoration: none;">
          support@allcollegeevent.com
        </a>
      </p>
      <p style="margin: 5px 0 0; font-size: 11px; color: #9ca3af;">
        © ${new Date().getFullYear()} All College Event. All rights reserved.
      </p>
    </div>

  </div>
</div>
`;


  await sendEmail({
    to: recipient.email,
    subject: "Welcome to All College Event",
    html,
    // text: `Verify your account: ${verifyUrl}`,
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
    platform: "mobile" | "web",
    extra: any
  ) {
    // Role check
    const role = await prisma.role.findFirst({
      where: { name: type },
    });

    if (!role) {
      throw new Error(AUTH_MESSAGES.ROLE_NOT_FOUND);
    }

    // Email uniqueness check
    const existsUser = await prisma.user.findUnique({
      where: { email },
    });

    const existsOrg = await prisma.org.findUnique({
      where: { domainEmail: email },
    });

    // Differentiated errors for frontend
    if (existsUser && existsOrg) {
      throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    if (existsUser) {
      throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_USER);
    }

    if (existsOrg) {
      throw new Error(AUTH_MESSAGES.EMAIL_ALREADY_ORG);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    /* ================= USER SIGNUP ================= */
    if (type === "user") {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: role.id,
          isActive: true
        },
      });
      // console.log(user);

      await sendVerificationMail(
        {
          email: user.email,
          identity: user.identity,
          id: user.id,
          name: user.name, //pass user name
        },
        platform
      );


      return user;
    }

    /* ================= ORG SIGNUP ================= */
    if (type === "org") {
      if (isPublicEmail(email)) {
        throw new Error(AUTH_MESSAGES.PUBLIC_EMAIL_MSG);
      }

      const emailCompany = normalizeOrgName(getCompanyFromEmail(email));
      const orgName = normalizeOrgName(extra.org_name);

      // if (emailCompany !== orgName) {
      //   throw new Error("Organization name must match the email domain");
      // }


      const org = await prisma.org.create({
        data: {
          domainEmail: email,
          password: hashedPassword,
          roleId: role.id,
          organizationName: extra.org_name,
          organizationCategory: extra.org_cat,
          slug: generateSlug(extra.org_name),
          country: extra.country,
          state: extra.state,
          city: extra.city,
          profileImage: extra.pImg ?? null,
          isVerified: true
        },
      });

      await sendVerificationMail(
        {
          email: org.domainEmail,
          identity: org.identity,
          id: org.id,
          organizationName: org.organizationName,
          name: org.organizationName, // optional (for unified display)
        },
        platform
      );


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
      id: user.id,
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
  static async verifyAccount(token: string) {
    if (!token) {
      throw new Error(AUTH_MESSAGES.TOKEN_MISSING);
    }

    let decoded: any;

    try {
      decoded = verifyToken(token);
    } catch {
      throw new Error(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    const identity = decoded.data.identity;

    if (!identity) {
      throw new Error(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    /* ================= CHECK ORG ================= */
    const org = await prisma.org.findUnique({
      where: { identity },
    });

    if (org) {
      if (org.isVerified) {
        return {
          status: true,
          message: AUTH_MESSAGES.ORG_ALREADY_VERIFIED,
        };
      }

      await prisma.org.update({
        where: { identity },
        data: { isVerified: true },
      });

      return {
        status: true,
        message: AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
      };
    }

    /* ================= CHECK USER ================= */
    const user = await prisma.user.findUnique({
      where: { identity },
    });

    if (user) {
      if (user.isActive) {
        return {
          status: true,
          message: AUTH_MESSAGES.USER_ALREADY_VERIFIED,
        };
      }

      await prisma.user.update({
        where: { identity },
        data: { isActive: true },
      });

      return {
        status: true,
        message: AUTH_MESSAGES.USER_VERIFIED_SUCCESS,
      };
    }

    /* ================= NOT FOUND ================= */
    throw new Error(AUTH_MESSAGES.ACCOUNT_NOT_FOUND_BY_TOKEN);
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
      status: true,
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
      status: true,
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
      status: true,
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
      status: true,
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }

  /**
   * Google OAuth login
   */
  static async googleLogin(googleToken: string) {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error(AUTH_MESSAGES.GOOGLE_LOGIN_FAILED);
    }

    const {
      email,
      name,
      picture,
      sub: providerUserId, // Google unique user ID
    } = payload;

    if (!email || !providerUserId) {
      throw new Error(AUTH_MESSAGES.GOOGLE_LOGIN_FAILED);
    }

    /* ================= ROLE ================= */
    const role = await prisma.role.findFirst({
      where: { name: "user" },
    });

    if (!role) {
      throw new Error(AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
    }

    /* ================= AUTH PROVIDER ================= */
    let provider = await prisma.authProvider.findFirst({
      where: { providerName: "google" },
    });

    if (!provider) {
      provider = await prisma.authProvider.create({
        data: {
          providerName: "google",
          displayName: "Google",
          status: true,
        },
      });
    }

    /* ================= USER ================= */
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          password: "", // social login
          profileImage: picture ?? null,
          roleId: role.id,
          isActive: true, // auto-verified
        },
      });
    }

    await sendVerificationMail({
      email: user.email,
      identity: user.identity,
      id: user.id,
      name: user.name, // IMPORTANT
    });

    /* ================= SOCIAL ACCOUNT ================= */
    const existingSocial = await prisma.socialAccount.findFirst({
      where: {
        userId: user.identity,
        providerId: provider.identity,
      },
    });

    if (!existingSocial) {
      await prisma.socialAccount.create({
        data: {
          userId: user.identity,
          providerId: provider.identity,
          providerUserId,
          providerEmail: email,
        },
      });

      await sendVerificationMail({
        email: user.email,
        identity: user.identity,
        id: user.id,
        name: user.name,
      });
    }

    /* ================= TOKEN ================= */
    const token = generateToken({
      id: user.id,
      identity: user.identity,
      email,
      roleId: role.idnty,
      type: "user",
    });

    return {
      user,
      token,
    };
  }

  // Profile Update
  static async updateProfile(payload: any) {
    const { type, identity } = payload;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      /* ================= USER PROFILE ================= */
      if (type === "user") {
        return tx.user.update({
          where: { identity },
          data: {
            name: payload.name,
            profileImage: payload.profileImage,
          },
        });
      }

      /* ================= ORG PROFILE ================= */
      if (type === "org") {
        const org = await tx.org.update({
          where: { identity },
          data: {
            organizationName: payload.organizationName,
            profileImage: payload.profileImage,
          },
        });

        /* ---------- ORG SOCIAL LINKS ---------- */
        if (payload.socialLinks && Object.keys(payload.socialLinks).length) {
          for (const [platform, url] of Object.entries(payload.socialLinks)) {
            if (!url) continue;

            await tx.orgSocialLink.upsert({
              where: {
                orgIdentity_platform: {
                  orgIdentity: identity,
                  platform,
                },
              },
              update: {
                url: url as string,
              },
              create: {
                orgIdentity: identity,
                platform,
                url: url as string,
              },
            });
          }
        }

        return org;
      }

      throw new Error(AUTH_MESSAGES.INVALID_PROFILE_TYPE);
    });
  }
}
