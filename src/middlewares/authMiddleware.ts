import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/type";
const prisma = require("../../config/db.config");

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Token not provided",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    //  Verify JWT
    const decoded = jwt.verify(token, secret) as DecodedToken;

    //  DB validation based on type
    if (decoded.type === "org") {
      const org = await prisma.org.findUnique({
        where: { identity: decoded.identity },
      });

      if (!org) {
        return res.status(401).json({
          status: false,
          message: "Organization not found or unauthorized",
        });
      }
    }

    if (decoded.type === "user") {
      const user = await prisma.user.findUnique({
        where: { identity: decoded.identity },
      });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found or unauthorized",
        });
      }
    }

    // ✅ Attach decoded token to request
    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};
