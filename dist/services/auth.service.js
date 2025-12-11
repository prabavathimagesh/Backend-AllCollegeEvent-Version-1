"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma = require("../config/db.config");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const google_auth_library_1 = require("google-auth-library");
const sendOtp_1 = require("../utils/sendOtp");
// sending account verification email for organization signup
const sendVerificationMail = async (org) => {
    const URL = process.env.MAIL_SEND;
    // generating token for org verification
    const token = (0, jwt_1.generateToken)({ identity: org.identity });
    // preparing verification link
    const verifyUrl = `${URL}auth?token=${token}`;
    // html template for verification mail
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
    // sending email
    await (0, mailer_1.sendEmail)({
        to: org.domainEmail,
        subject: "Verify your account",
        html,
    });
};
class AuthService {
    static async signup(name, email, password, type, extra) {
        // checking if requested role exists in database
        const role = await prisma.role.findFirst({
            where: { name: type },
        });
        if (!role)
            throw new Error("Role not found in database");
        // checking if email already registered under user or org
        const existsUser = await prisma.user.findUnique({ where: { email } });
        const existsOrg = await prisma.org.findUnique({
            where: { domainEmail: email },
        });
        if (existsUser || existsOrg)
            throw new Error("Email already registered");
        // hashing password for secure storage
        const hashed = await (0, hash_1.hashPassword)(password);
        // creating normal user account
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
        // creating organization account
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
            // sending verification email after org signup
            await sendVerificationMail(org);
            return org;
        }
        throw new Error("Invalid type");
    }
    static async login(email, password, type) {
        let user;
        // checking login type and fetching user or org
        if (type === "user") {
            user = await prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error("Account not found");
            // validating if user account is active and not deleted
            if (user.isDeleted)
                throw new Error("Your account is deleted. Contact support.");
            if (!user.isActive)
                throw new Error("Your account is inactive. Contact admin.");
        }
        else if (type === "org") {
            user = await prisma.org.findUnique({ where: { domainEmail: email } });
            if (!user)
                throw new Error("Organization account not found");
            // checking org deletion and verification status
            if (user.isDeleted)
                throw new Error("Organization account deleted. Contact support.");
            if (!user.isVerified)
                throw new Error("Your organization is not verified yet. Please contact admin.");
        }
        // validating password
        const ok = await (0, hash_1.comparePassword)(password, user.password);
        if (!ok)
            throw new Error("Invalid password");
        // fetching UUID of role
        let roleUUID = null;
        if (user.roleId) {
            const role = await prisma.role.findUnique({
                where: { id: user.roleId },
                select: { idnty: true },
            });
            roleUUID = role?.idnty || null;
        }
        // preparing user data to send back
        const data = {
            ...user,
            roleId: roleUUID,
        };
        // generating login token for session
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
            // decoding and verifying token
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch (err) {
            throw new Error("Invalid or expired token");
        }
        const orgIdnty = decoded.data.identity;
        // fetching organization using identity
        const org = await prisma.org.findUnique({
            where: { identity: orgIdnty },
        });
        if (!org) {
            throw new Error("Organization not found");
        }
        // updating verification status
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
        // checking if email exists in user table
        let account = await prisma.user.findUnique({ where: { email } });
        // if not found, checking org table
        if (!account) {
            account = await prisma.org.findUnique({
                where: { domainEmail: email },
            });
        }
        if (!account)
            throw new Error("Email not found");
        // generating OTP for password reset
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expAt = new Date(Date.now() + 10 * 60 * 1000);
        // storing OTP in database
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
        // sending OTP email
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
        // checking if last otp exists
        const existingOtp = await prisma.oTP.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
        });
        // generating new OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expAt = new Date(Date.now() + 10 * 60 * 1000);
        // updating existing OTP or creating new OTP record
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
        // sending otp again
        await (0, sendOtp_1.sendOtpEmail)(email, otp, 10);
        return {
            success: true,
            message: "OTP resent successfully",
        };
    }
    static async verifyOtp(email, otp) {
        // fetching last OTP sent to user
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
        // hashing new password before storing
        const hashed = await (0, hash_1.hashPassword)(newPassword);
        // updating user password
        let updatedUser = await prisma.user.updateMany({
            where: { email },
            data: { password: hashed },
        });
        // if not user, update org password
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
        // creating google oauth client
        const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        // verifying google token and extracting user details
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error("Invalid Google token");
        const { email, name, picture } = payload;
        // fetching default role for google user login
        const role = await prisma.role.findFirst({
            where: { name: "user" },
        });
        if (!role)
            throw new Error("Default role 'user' not found");
        const roleUUID = role.idnty;
        // checking if user already exists in db
        let user = await prisma.user.findUnique({
            where: { email },
        });
        // creating new user if not exists
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
        // generating login token for google login
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
