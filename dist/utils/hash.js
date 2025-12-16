"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt = require("bcrypt");
/**
 * Hash a plain text password
 * @param pwd - plain password string
 * @returns hashed password
 */
const hashPassword = async (pwd) => {
    const saltRounds = 10;
    return bcrypt.hash(pwd, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * Compare plain password with hashed password
 * @param pwd - plain password string
 * @param hashed - hashed password from DB
 * @returns true if password matches, else false
 */
const comparePassword = async (pwd, hashed) => {
    return bcrypt.compare(pwd, hashed);
};
exports.comparePassword = comparePassword;
