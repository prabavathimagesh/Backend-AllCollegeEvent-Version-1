"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res) {
        try {
            //   extracting signup data from request body
            const { name, email, password, type, ...rest } = req.body;
            //   calling signup service to create user or org
            const user = await auth_service_1.AuthService.signup(name, email, password, type, rest);
            //   returning success response when signup completes
            return res.status(200).json({
                status: true,
                message: `${type} created successfully`,
                data: user,
            });
        }
        catch (err) {
            //   list of error messages that should return 200 instead of 500
            const safeErrors = [
                "Role not found in database",
                "Email already registered",
                "Invalid type",
            ];
            //   returning handled errors with 200 response
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            //   unexpected error → internal server error
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                error: err.message,
            });
        }
    }
    static async login(req, res) {
        try {
            //   extracting login credentials from request body
            const { email, password, type } = req.body;
            //   calling login service to validate user/org
            const data = await auth_service_1.AuthService.login(email, password, type);
            //   returning success login response
            return res
                .status(200)
                .json({ status: true, ...data, message: "login successfully" });
        }
        catch (err) {
            //   list of safe login errors for 200 response
            const safeErrors = [
                "Account not found",
                "Your account is deleted. Contact support.",
                "Your account is inactive. Contact admin.",
                "Organization account not found",
                "Organization account deleted. Contact support.",
                "Your organization is not verified yet. Please contact admin.",
                "Invalid password",
            ];
            //   known login error → return 200
            if (safeErrors.includes(err.message)) {
                return res.status(200).json({
                    status: false,
                    message: err.message,
                });
            }
            //   unknown server error
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                error: err.message,
            });
        }
    }
    static async verifyOrg(req, res) {
        try {
            //   extract token from email verification link
            const { token } = req.query;
            //   verifying org account using token
            const result = await auth_service_1.AuthService.verifyOrg(token);
            //   return verification success
            return res
                .status(200)
                .json({ status: true, data: result, message: "verified" });
        }
        catch (err) {
            //   error during verification
            return res.status(400).json({
                status: false,
                message: err.message,
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            //   get email from request body for password reset
            const { email } = req.body;
            //   trigger forgot password service to send otp
            const result = await auth_service_1.AuthService.forgotPassword(email);
            //   return otp sent response
            return res
                .status(200)
                .json({ data: result, status: true, message: "otp send to email" });
        }
        catch (err) {
            //   error during otp sending
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async resendOtp(req, res) {
        try {
            //   extract email to resend otp
            const { email } = req.body;
            //   triggering resendOtp service
            const result = await auth_service_1.AuthService.resendOtp(email);
            //   return resend success message
            return res.status(200).json({
                data: result,
                status: true,
                message: "otp resend successfully",
            });
        }
        catch (err) {
            //   error during resend otp
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async verifyOtp(req, res) {
        try {
            //   extract email and otp for verification
            const { email, otp } = req.body;
            //   verifying otp using service
            const result = await auth_service_1.AuthService.verifyOtp(email, otp);
            //   return otp verified response
            return res
                .status(200)
                .json({ data: result, status: true, message: "otp verified" });
        }
        catch (err) {
            //   otp verification error
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            //   extracting email and new password
            const { email, password } = req.body;
            //   calling service to update new password
            const result = await auth_service_1.AuthService.resetPassword(email, password);
            //   return reset success response
            return res.status(200).json({
                data: result,
                status: true,
                message: "Password reset successfully",
            });
        }
        catch (err) {
            //   error resetting password
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async googleLoginController(req, res, next) {
        try {
            //   extract google token from request body
            const { googleToken } = req.body;
            //   validate if google token is received
            if (!googleToken) {
                return res.status(400).json({
                    success: false,
                    message: "Google token missing",
                });
            }
            //   calling google login service for authentication
            const { user, token } = await auth_service_1.AuthService.googleLogin(googleToken);
            //   storing token in cookie for session
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            });
            //   return login success
            return res.status(200).json({
                status: true,
                data: user,
                token,
                message: "Login Successfully",
            });
        }
        catch (err) {
            //   unexpected google login error
            console.error("Google Login Error:", err);
            return res.status(500).json({
                status: false,
                message: err.message || "Google login failed",
            });
        }
    }
}
exports.AuthController = AuthController;
