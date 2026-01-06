"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_message_1 = require("../constants/auth.message");
const s3Upload_1 = require("../utils/s3Upload");
/**
 * Auth Controller
 * Handles authentication & authorization related APIs
 */
class AuthController {
    /**
     * Signup user or organization
     */
    static async signup(req, res) {
        try {
            // Extract signup details from request body
            const { name, email, password, type, platform = "web", ...rest } = req.body;
            // Call signup service (6 args)
            const user = await auth_service_1.AuthService.signup(name, email, password, type, platform, rest);
            return res.status(200).json({
                status: true,
                message: type === "user"
                    ? auth_message_1.AUTH_MESSAGES.USER_CREATED_SUCCESS
                    : auth_message_1.AUTH_MESSAGES.ORG_CREATED_SUCCESS,
                data: user,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.ROLE_NOT_FOUND,
                auth_message_1.AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED,
                auth_message_1.AUTH_MESSAGES.INVALID_TYPE,
                auth_message_1.AUTH_MESSAGES.EMAIL_ALREADY_USER,
                auth_message_1.AUTH_MESSAGES.EMAIL_ALREADY_ORG,
                auth_message_1.AUTH_MESSAGES.PUBLIC_EMAIL_MSG,
            ];
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Login user or organization
     */
    static async login(req, res) {
        try {
            // Extract login credentials
            const { email, password, type } = req.body;
            // Call login service
            const data = await auth_service_1.AuthService.login(email, password, type);
            // Success response
            return res.status(200).json({
                status: true,
                ...data,
                message: auth_message_1.AUTH_MESSAGES.LOGIN_SUCCESS,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_DELETED,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_INACTIVE,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND,
                auth_message_1.AUTH_MESSAGES.ORG_DELETED,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_VERIFIED,
                auth_message_1.AUTH_MESSAGES.INVALID_PASSWORD,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Verify organization account using email token
     */
    static async verifyOrg(req, res) {
        try {
            // Extract token from query params
            const { token } = req.query;
            // Token missing
            if (!token) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.TOKEN_MISSING,
                });
            }
            // Verify organization
            const result = await auth_service_1.AuthService.verifyAccount(token);
            // Success response
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.TOKEN_MISSING,
                auth_message_1.AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN,
                auth_message_1.AUTH_MESSAGES.ORG_ALREADY_VERIFIED,
                auth_message_1.AUTH_MESSAGES.USER_ALREADY_VERIFIED,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND_BY_TOKEN,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Forgot password - send OTP
     */
    static async forgotPassword(req, res) {
        try {
            // Extract email
            const { email } = req.body;
            // Email required
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            // Trigger forgot password flow
            const result = await auth_service_1.AuthService.forgotPassword(email);
            // Success response
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_SENT,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Resend OTP
     */
    static async resendOtp(req, res) {
        try {
            // Extract email
            const { email } = req.body;
            // Email required
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            // Resend OTP
            const result = await auth_service_1.AuthService.resendOtp(email);
            // Success response
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_RESENT,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Verify OTP
     */
    static async verifyOtp(req, res) {
        try {
            // Extract email & OTP
            const { email, otp } = req.body;
            // Verify OTP
            const result = await auth_service_1.AuthService.verifyOtp(email, otp);
            // Success response
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_VERIFIED,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [auth_message_1.AUTH_MESSAGES.INVALID_OTP, auth_message_1.AUTH_MESSAGES.OTP_EXPIRED];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Reset password
     */
    static async resetPassword(req, res) {
        try {
            // Extract email & password
            const { email, password } = req.body;
            // Email required
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            // Password required
            if (!password) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.PASSWORD_REQUIRED,
                });
            }
            // Reset password
            const result = await auth_service_1.AuthService.resetPassword(email, password);
            // Success response
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.PASSWORD_REQUIRED,
                auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Google OAuth login
     */
    static async googleLoginController(req, res) {
        try {
            // Extract Google token
            const { googleToken } = req.body;
            // Token missing
            if (!googleToken) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
                });
            }
            // Perform Google login
            const { user, token } = await auth_service_1.AuthService.googleLogin(googleToken);
            // Set auth cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // set true in production with HTTPS
                sameSite: "lax",
                path: "/",
            });
            // Success response
            return res.status(200).json({
                status: true,
                data: user,
                token,
                message: auth_message_1.AUTH_MESSAGES.LOGIN_SUCCESS,
            });
        }
        catch (err) {
            // Known / business errors
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
                auth_message_1.AUTH_MESSAGES.GOOGLE_LOGIN_FAILED,
                auth_message_1.AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
            ];
            // Business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // System errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    /**
     * Profile Update
     */
    static async updateProfile(req, res) {
        try {
            const { type, identity } = req.body;
            if (!type || !identity) {
                return res.status(200).json({
                    success: false,
                    message: auth_message_1.AUTH_MESSAGES.TYPE_AND_ID_REQUIRED,
                });
            }
            /* ---------- S3 IMAGE UPLOAD ---------- */
            let profileImage;
            if (req.file) {
                const uploaded = await (0, s3Upload_1.uploadToS3)(req.file, "profiles");
                profileImage = uploaded.url;
            }
            /* ---------- PARSE SOCIAL LINKS ---------- */
            let socialLinks;
            if (req.body.socialLinks) {
                try {
                    socialLinks = JSON.parse(req.body.socialLinks);
                }
                catch {
                    throw new Error(auth_message_1.AUTH_MESSAGES.IVALID_SOCIAL_LINK_FORMAT);
                }
            }
            const payload = {
                type,
                identity,
                name: req.body.name,
                organizationName: req.body.organizationName,
                profileImage,
                socialLinks,
            };
            const data = await auth_service_1.AuthService.updateProfile(payload);
            return res.status(200).json({
                success: true,
                data,
            });
        }
        catch (err) {
            const message = err.message || auth_message_1.AUTH_MESSAGES.SOMETHING_WENT_WRONG;
            const safeErrors = [
                // Controller-level
                auth_message_1.AUTH_MESSAGES.TYPE_AND_ID_REQUIRED,
                auth_message_1.AUTH_MESSAGES.IVALID_SOCIAL_LINK_FORMAT,
                // Service-level
                auth_message_1.AUTH_MESSAGES.INVALID_PROFILE_TYPE,
            ];
            /* ---------- SAFE ERRORS (EXPECTED) ---------- */
            if (safeErrors.includes(message)) {
                return res.status(200).json({
                    success: false,
                    message,
                });
            }
            /* ---------- UNEXPECTED / SYSTEM ERRORS ---------- */
            return res.status(500).json({
                success: false,
                message,
            });
        }
    }
}
exports.AuthController = AuthController;
