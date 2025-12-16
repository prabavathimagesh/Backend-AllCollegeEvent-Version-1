"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_message_1 = require("../constants/auth.message");
class AuthController {
    static async signup(req, res) {
        try {
            const { name, email, password, type, ...rest } = req.body;
            const user = await auth_service_1.AuthService.signup(name, email, password, type, rest);
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
    static async login(req, res) {
        try {
            const { email, password, type } = req.body;
            const data = await auth_service_1.AuthService.login(email, password, type);
            return res.status(200).json({
                status: true,
                ...data,
                message: auth_message_1.AUTH_MESSAGES.LOGIN_SUCCESS,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_DELETED,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_INACTIVE,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND,
                auth_message_1.AUTH_MESSAGES.ORG_DELETED,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_VERIFIED,
                auth_message_1.AUTH_MESSAGES.INVALID_PASSWORD,
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
    static async verifyOrg(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.TOKEN_MISSING,
                });
            }
            const result = await auth_service_1.AuthService.verifyOrg(token);
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.ORG_VERIFIED_SUCCESS,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.TOKEN_MISSING,
                auth_message_1.AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
                auth_message_1.AUTH_MESSAGES.ORG_NOT_FOUND_BY_TOKEN,
            ];
            // Known errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // Unknown errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            const result = await auth_service_1.AuthService.forgotPassword(email);
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_SENT,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND,
            ];
            // ✅ Known / safe errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // ❌ Unknown errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    static async resendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            const result = await auth_service_1.AuthService.resendOtp(email);
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_RESENT,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.ACCOUNT_NOT_FOUND,
            ];
            // ✅ Known / business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // ❌ Unknown errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await auth_service_1.AuthService.verifyOtp(email, otp);
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.OTP_VERIFIED,
            });
        }
        catch (err) {
            const safeErrors = [auth_message_1.AUTH_MESSAGES.INVALID_OTP, auth_message_1.AUTH_MESSAGES.OTP_EXPIRED];
            // ✅ Known / business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // ❌ Unknown errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, password } = req.body;
            // reuse existing message
            if (!email) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                });
            }
            if (!password) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.PASSWORD_REQUIRED,
                });
            }
            const result = await auth_service_1.AuthService.resetPassword(email, password);
            return res.status(200).json({
                status: true,
                data: result,
                message: auth_message_1.AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.EMAIL_REQUIRED,
                auth_message_1.AUTH_MESSAGES.PASSWORD_REQUIRED,
                auth_message_1.AUTH_MESSAGES.EMAIL_NOT_FOUND,
            ];
            // ✅ business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // ❌ system errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
    static async googleLoginController(req, res) {
        try {
            const { googleToken } = req.body;
            if (!googleToken) {
                return res.status(200).json({
                    status: false,
                    message: auth_message_1.AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
                });
            }
            const { user, token } = await auth_service_1.AuthService.googleLogin(googleToken);
            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // set true in production with HTTPS
                sameSite: "lax",
                path: "/",
            });
            return res.status(200).json({
                status: true,
                data: user,
                token,
                message: auth_message_1.AUTH_MESSAGES.LOGIN_SUCCESS,
            });
        }
        catch (err) {
            const safeErrors = [
                auth_message_1.AUTH_MESSAGES.GOOGLE_TOKEN_MISSING,
                auth_message_1.AUTH_MESSAGES.GOOGLE_LOGIN_FAILED,
                auth_message_1.AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND,
            ];
            // ✅ Known / business errors → 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            // ❌ Unknown errors → 500
            return res.status(500).json({
                status: false,
                message: auth_message_1.AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
                error: err.message,
            });
        }
    }
}
exports.AuthController = AuthController;
