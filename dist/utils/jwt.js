"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jwt = require("jsonwebtoken");
/**
 * JWT secret key
 * - Must be defined in environment variables
 */
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
/**
 * Generate JWT token
 * @param payload - data to embed inside the token
 * @returns signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign({ data: payload }, SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns decoded token payload
 * @throws if token is invalid or expired
 */
const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
exports.verifyToken = verifyToken;
