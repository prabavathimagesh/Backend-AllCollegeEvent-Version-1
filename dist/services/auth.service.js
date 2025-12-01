"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma = require("../config/db.config");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const sendVerificationMail = async (org) => {
    const URL = process.env.MAIL_SEND;
    const token = (0, jwt_1.generateToken)(org.idnty);
    const verifyUrl = `${URL}verify?token=${token}`;
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
    await (0, mailer_1.sendEmail)({
        to: org.domEmail,
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
            where: { domEmail: email },
        });
        if (existsUser || existsOrg)
            throw new Error("Email already registered");
        const hashed = await (0, hash_1.hashPassword)(password);
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
    static async login(email, password, type) {
        let user;
        if (type === "user") {
            user = await prisma.user.findUnique({ where: { email } });
        }
        else if (type === "org") {
            user = await prisma.org.findUnique({ where: { domEmail: email } });
        }
        if (!user)
            throw new Error("Account not found");
        const ok = await (0, hash_1.comparePassword)(password, user.pwd);
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
        const userResponse = {
            ...user,
            roleId: roleUUID,
        };
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            idnty: user.idnty,
            email: email,
            roleId: roleUUID,
            type: type,
        });
        return { user: userResponse, token };
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
    static async forgotPassword(email) {
        if (!email)
            throw new Error("Email is required");
        let account = await prisma.user.findUnique({ where: { email } });
        if (!account) {
            account = await prisma.org.findUnique({
                where: { domEmail: email },
            });
        }
        if (!account)
            throw new Error("Email not found");
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
        await prisma.oTP.create({
            data: {
                email,
                code: otp,
                purpose: "FORGOT_PASSWORD",
                expAt,
                userId: account.email ? account.id : null,
                orgId: account.domEmail ? account.id : null,
            },
        });
        await (0, mailer_1.sendEmail)({
            to: email,
            subject: "Your Password Reset OTP",
            html: `
        <h3>Your OTP for password reset is:</h3>
        <h1>${otp}</h1>
        <p>It will expire in 5 minutes.</p>
      `,
        });
        return {
            success: true,
            message: "OTP sent to email",
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
            data: { pwd: hashed },
        });
        if (updatedUser.count === 0) {
            updatedUser = await prisma.org.updateMany({
                where: { domEmail: email },
                data: { pwd: hashed },
            });
        }
        if (updatedUser.count === 0)
            throw new Error("Email not found");
        return {
            success: true,
            message: "Password reset successful",
        };
    }
}
exports.AuthService = AuthService;
