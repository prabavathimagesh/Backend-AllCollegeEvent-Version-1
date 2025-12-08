"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma = require("../config/db.config");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const google_auth_library_1 = require("google-auth-library");
const sendOtp_1 = require("../utils/sendOtp");
const sendVerificationMail = async (org) => {
    const URL = process.env.MAIL_SEND;
    const token = (0, jwt_1.generateToken)({ identity: org.identity });
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
    await (0, mailer_1.sendEmail)({
        to: org.domainEmail,
        subject: "Verify your account",
        html,
    });
};
class AuthService {
    static async signup(name, email, password, type, extra) {
        const role = await prisma.role.findFirst({
            where: { name: type },
        });
        if (!role)
            throw new Error("Role not found in database");
        const existsUser = await prisma.user.findUnique({ where: { email } });
        const existsOrg = await prisma.org.findUnique({
            where: { domainEmail: email },
        });
        if (existsUser || existsOrg)
            throw new Error("Email already registered");
        const hashed = await (0, hash_1.hashPassword)(password);
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
    static async login(email, password, type) {
        let user;
        if (type === "user") {
            user = await prisma.user.findUnique({ where: { email } });
        }
        else if (type === "org") {
            user = await prisma.org.findUnique({ where: { domainEmail: email } });
        }
        if (!user)
            throw new Error("Account not found");
        const ok = await (0, hash_1.comparePassword)(password, user.password);
        if (!ok)
            throw new Error("Invalid password");
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
        const token = (0, jwt_1.generateToken)({
            identity: user.identity,
            email: email,
            roleId: roleUUID,
            type: type,
        });
        return { data, token };
    }
    static async verifyOrg(token) {
        if (!token)
            throw new Error("Token missing");
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch (err) {
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
    static async forgotPassword(email) {
        if (!email)
            throw new Error("Email is required");
        let account = await prisma.user.findUnique({ where: { email } });
        if (!account) {
            account = await prisma.org.findUnique({
                where: { domainEmail: email },
            });
        }
        if (!account)
            throw new Error("Email not found");
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
        await (0, sendOtp_1.sendOtpEmail)(email, otp, 10);
        return {
            success: true,
            message: "OTP sent to email",
        };
    }
    static async resendOtp(email) {
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
            message: "OTP resent successfully",
        };
    }
    static async verifyOtp(email, otp) {
        const record = await prisma.oTP.findFirst({
            where: { email, code: otp, purpose: "FORGOT_PASSWORD" },
            orderBy: { id: "desc" },
        });
        if (!record)
            throw new Error("Invalid OTP");
        if (record.expAt < new Date())
            throw new Error("OTP expired");
        return {
            success: true,
            message: "OTP verified successfully",
        };
    }
    static async resetPassword(email, newPassword) {
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
        if (updatedUser.count === 0)
            throw new Error("Email not found");
        return {
            success: true,
            message: "Password reset successful",
        };
    }
    static async googleLogin(googleToken) {
        const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error("Invalid Google token");
        const { email, name, picture } = payload;
        const role = await prisma.role.findFirst({
            where: { name: "user" },
        });
        if (!role)
            throw new Error("Default role 'user' not found");
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
        const token = (0, jwt_1.generateToken)({
            identity: user.identity,
            email: email,
            roleId: roleUUID,
            type: "user",
        });
        return { user, token };
    }
}
exports.AuthService = AuthService;
