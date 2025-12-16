"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer = require("nodemailer");
/**
 * Send an email using Gmail SMTP
 * - Uses Nodemailer
 * - Credentials are read from environment variables
 */
const sendEmail = async ({ to, subject, html, }) => {
    // Create SMTP transporter using Gmail service
    const transporter = nodemailer.createTransport({
        service: "gmail",
        // SMTP authentication
        auth: {
            user: process.env.SMTP_USER, // Gmail address
            pass: process.env.SMTP_PASS, // App password
        },
        // TLS configuration (allows Gmail certificates)
        tls: {
            rejectUnauthorized: false,
        },
    });
    // Verify SMTP connection before sending mail
    await transporter.verify();
    // Send email
    await transporter.sendMail({
        from: process.env.FROM_EMAIL, // Sender email
        to, // Receiver email
        subject, // Email subject
        html, // Email content (HTML)
    });
};
exports.sendEmail = sendEmail;
