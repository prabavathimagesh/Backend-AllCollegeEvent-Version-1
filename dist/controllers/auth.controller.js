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
                success: true,
                message: `${type} created successfully`,
                user,
            });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password, type } = req.body;
            const data = await auth_service_1.AuthService.login(email, password, type);
            res.status(200).json({ success: true, ...data });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    static async verifyOrg(req, res) {
        try {
            const { token } = req.query;
            const result = await auth_service_1.AuthService.verifyOrg(token);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}
exports.AuthController = AuthController;
