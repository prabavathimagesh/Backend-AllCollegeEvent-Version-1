"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma = require("../config/db.config");
// Utility imports
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const google_auth_library_1 = require("google-auth-library");
const sendOtp_1 = require("../utils/sendOtp");
// Auth-related constant messages
const auth_message_1 = require("../constants/auth.message");
/**
 * Send organization account verification email
 * Triggered after successful org signup
 */
const sendVerificationMail = async (org) => {
    // Frontend verification URL base
    const URL = process.env.MAIL_SEND;
    // Generate verification token
    const token = (0, jwt_1.generateToken)({ identity: org.identity });
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
    await (0, mailer_1.sendEmail)({
        to: org.domainEmail,
        subject: "Verify your account",
        html,
    });
};
/**
 * Authentication service
 * Handles signup, login, verification, OTP, password reset & Google login
 */
class AuthService {
    /**
     * Signup user or organization
     */
    static async signup(name, email, password, type, extra) {
        // Fetch role based on type
        const role = await prisma.role.findFirst({
            where: { name: type },
        });
        if (!role)
            throw new Error(auth_message_1.AUTH_MESSAGES.ROLE_NOT_FOUND);
        // Check if email already exists
        const existsUser = await prisma.user.findUnique({ where: { email } });
        const existsOrg = await prisma.org.findUnique({
            where: { domainEmail: email },
        });
        if (existsUser || existsOrg)
            throw new Error(auth_message_1.AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);
        // Hash password
        const hashed = await (0, hash_1.hashPassword)(password);
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
        throw new Error(auth_message_1.AUTH_MESSAGES.INVALID_TYPE);
    }
    /**
     * Login for user or organization
     */
    static async login(email, password, type) {
        let user;
        // User login validation
        if (type === "user") {
            user = await prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error(auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND);
            if (user.isDeleted)
                throw new Error(auth_message_1.AUTH_MESSAGES.ACCOUNT_DELETED);
            if (!user.isActive)
                throw new Error(auth_message_1.AUTH_MESSAGES.ACCOUNT_INACTIVE);
        }
        // Organization login validation
        else if (type === "org") {
            user = await prisma.org.findUnique({ where: { domainEmail: email } });
            if (!user)
                throw new Error(auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND);
            if (user.isDeleted)
                throw new Error(auth_message_1.AUTH_MESSAGES.ORG_DELETED);
            if (!user.isVerified)
                throw new Error(auth_message_1.AUTH_MESSAGES.ORG_NOT_VERIFIED);
        }
        // Validate password
        const ok = await (0, hash_1.comparePassword)(password, user.password);
        if (!ok)
            throw new Error(auth_message_1.AUTH_MESSAGES.INVALID_PASSWORD);
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
        const token = (0, jwt_1.generateToken)({
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
    static async verifyOrg(token) {
        if (!token)
            throw new Error(auth_message_1.AUTH_MESSAGES.TOKEN_MISSING);
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch {
            throw new Error(auth_message_1.AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
        }
        const orgIdnty = decoded.data.identity;
        const org = await prisma.org.findUnique({
            where: { identity: orgIdnty },
        });
        if (!org)
            throw new Error(auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN);
        // Mark org as verified
        await prisma.org.update({
            where: { identity: orgIdnty },
            data: { isVerified: true },
        });
        return {
            success: true,
            message: auth_message_1.AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
        };
    }
    /**
     * Forgot password - send OTP
     */
    static async forgotPassword(email) {
        if (!email)
            throw new Error(auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED);
        let account = await prisma.user.findUnique({ where: { email } });
        if (!account) {
            account = await prisma.org.findUnique({
                where: { domainEmail: email },
            });
        }
        if (!account)
            throw new Error(auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND);
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
        await (0, sendOtp_1.sendOtpEmail)(email, otp, 10);
        return {
            success: true,
            message: auth_message_1.AUTH_MESSAGES.OTP_SENT,
        };
    }
    /**
     * Resend OTP
     */
    static async resendOtp(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        const org = await prisma.org.findUnique({ where: { domainEmail: email } });
        if (!user && !org)
            throw new Error(auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND);
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
        }
        else {
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
        await (0, sendOtp_1.sendOtpEmail)(email, otp, 10);
        return {
            success: true,
            message: auth_message_1.AUTH_MESSAGES.OTP_RESENT,
        };
    }
    /**
     * Verify OTP
     */
    static async verifyOtp(email, otp) {
        const record = await prisma.oTP.findFirst({
            where: { email, code: otp, purpose: "FORGOT_PASSWORD" },
            orderBy: { id: "desc" },
        });
        if (!record)
            throw new Error(auth_message_1.AUTH_MESSAGES.INVALID_OTP);
        if (record.expAt < new Date())
            throw new Error(auth_message_1.AUTH_MESSAGES.OTP_EXPIRED);
        return {
            success: true,
            message: auth_message_1.AUTH_MESSAGES.OTP_VERIFIED,
        };
    }
    /**
     * Reset password using OTP
     */
    static async resetPassword(email, newPassword) {
        if (!email)
            throw new Error(auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED);
        if (!newPassword)
            throw new Error(auth_message_1.AUTH_MESSAGES.PASSWORD_REQUIRED);
        const hashed = await (0, hash_1.hashPassword)(newPassword);
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
            throw new Error(auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND);
        }
        return {
            success: true,
            message: auth_message_1.AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
        };
    }
    /**
     * Google OAuth login
     */
    static async googleLogin(googleToken) {
        const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error(auth_message_1.AUTH_MESSAGES.GOOGLE_LOGIN_FAILED);
        const { email, name, picture } = payload;
        const role = await prisma.role.findFirst({
            where: { name: "user" },
        });
        if (!role)
            throw new Error(auth_message_1.AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
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
        const token = (0, jwt_1.generateToken)({
            identity: user.identity,
            email,
            roleId: roleUUID,
            type: "user",
        });
        return { user, token };
    }
}
exports.AuthService = AuthService;
