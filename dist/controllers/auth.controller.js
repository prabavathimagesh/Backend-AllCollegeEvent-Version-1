"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res) {
        try {
            const { name, email, password, type, ...rest } = req.body;
            const user = await auth_service_1.AuthService.signup(name, email, password, type, rest);
            res.status(201).json({
                status: true,
                message: `${type} created successfully`,
                data: user,
            });
        }
        catch (err) {
            res.status(400).json({ status: false, message: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password, type } = req.body;
            const data = await auth_service_1.AuthService.login(email, password, type);
            res.status(200).json({ status: true, ...data });
        }
        catch (err) {
            res.status(400).json({ status: false, message: err.message });
        }
    }
    static async verifyOrg(req, res) {
        try {
            const { token } = req.query;
            const result = await auth_service_1.AuthService.verifyOrg(token);
            return res
                .status(200)
                .json({ status: true, data: result, message: "verified" });
        }
        catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message,
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.AuthService.forgotPassword(email);
            return res
                .status(200)
                .json({ data: result, status: true, message: "email received" });
        }
        catch (err) {
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async resendOtp(req, res) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.AuthService.resendOtp(email);
            return res.status(200).json({ data: result, status: true, message: "" });
        }
        catch (err) {
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await auth_service_1.AuthService.verifyOtp(email, otp);
            return res
                .status(200)
                .json({ data: result, status: true, message: "otp verified" });
        }
        catch (err) {
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.resetPassword(email, password);
            return res.status(200).json({
                data: result,
                status: true,
                message: "Password reset successfully",
            });
        }
        catch (err) {
            return res.status(400).json({ status: false, message: err.message });
        }
    }
    static async googleLoginController(req, res, next) {
        try {
            const { googleToken } = req.body;
            if (!googleToken) {
                return res.status(400).json({
                    success: false,
                    message: "Google token missing",
                });
            }
            const { user, token } = await auth_service_1.AuthService.googleLogin(googleToken);
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
            });
            return res.status(200).json({
                status: true,
                data: user,
                token,
                message: "Login Successfully",
            });
        }
        catch (err) {
            console.error("Google Login Error:", err);
            return res.status(500).json({
                status: false,
                message: err.message || "Google login failed",
            });
        }
    }
}
exports.AuthController = AuthController;
