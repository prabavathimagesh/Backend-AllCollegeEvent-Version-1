"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
const generateToken = (payload) => {
    return jwt.sign({ data: payload }, SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
exports.verifyToken = verifyToken;
