"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer = require("nodemailer");
const sendEmail = async ({ to, subject, html, }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    });
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
