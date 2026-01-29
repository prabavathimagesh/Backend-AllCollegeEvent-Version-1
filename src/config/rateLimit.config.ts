import rateLimit from "express-rate-limit";

// Global API Rate Limit
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    status: false,
    message: "Too many requests. Please try again later.",
  },
});

// Auth Rate Limit (Login / Signup / OTP)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts
  message: {
    status: false,
    message: "Too many attempts. Please try again later.",
  },
});
