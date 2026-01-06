import { JwtPayload } from "jsonwebtoken";

const jwt = require("jsonwebtoken");

/**
 * JWT secret key
 * - Must be defined in environment variables
 */
const SECRET = process.env.JWT_SECRET as string;

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * Generate JWT token
 * @param payload - data to embed inside the token
 * @returns signed JWT token
 */
export const generateToken = (payload: unknown): string => {
  return jwt.sign(
    { data: payload },
    SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns decoded token payload
 * @throws if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, SECRET);
};
