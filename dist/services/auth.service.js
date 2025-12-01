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
}
exports.AuthService = AuthService;
