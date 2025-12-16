"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const mailer_1 = require("./mailer");
/**
 * Send OTP email for password reset
 * @param email - recipient email address
 * @param otp - one-time password
 * @param expiryMinutes - OTP expiry time in minutes (default: 10)
 */
const sendOtpEmail = async (email, otp, expiryMinutes = 10) => {
    // Get current time (reserved for future use if needed)
    const now = new Date();
    // Format time to human-readable format (IST, 12-hour)
    const formatTime = (date) => date.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    // HTML email template for OTP
    const html = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP is:</p>

    <h1 style="letter-spacing: 4px; color: #2b6cb0;">${otp}</h1>

    <p style="margin-top: 20px;">
      This OTP will be valid for <b>${expiryMinutes} minutes</b>.
    </p>

    <p>If you did not request this, please ignore this email.</p>
  `;
    // Send OTP email using common mailer utility
    await (0, mailer_1.sendEmail)({
        to: email, // Recipient email
        subject: "Your Password Reset OTP", // Email subject
        html, // HTML content
    });
};
exports.sendOtpEmail = sendOtpEmail;
