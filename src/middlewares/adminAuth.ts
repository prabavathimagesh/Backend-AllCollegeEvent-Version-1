import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const prisma = require("../config/db.config");
import { JwtPayload } from "../types/event.type";

export default async function adminAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ status: false, message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET ?? "secret";

    const payload = jwt.verify(token, secret) as JwtPayload;
    if (!payload || payload.type !== "admin")
      return res.status(403).json({ status: false, message: "Forbidden" });

    // fetch user by identity to confirm still valid and admin
    const user = await prisma.user.findUnique({
      where: { identity: payload.identity },
      include: { role: true },
    });

    if (!user) return res.status(401).json({ status: false, message: "User not found" });
    if (user.isDeleted) return res.status(403).json({ status: false, message: "Account deleted" });
    if (!user.isActive) return res.status(403).json({ status: false, message: "Account inactive" });

    // Determine admin privileges: either boolean flag, or role name === "Admin"
    const isAdminFlag = (user as any).isAdmin === true;
    const roleIsAdmin = user.role?.name?.toLowerCase() === "admin";

    if (!isAdminFlag && !roleIsAdmin) {
      return res.status(403).json({ status: false, message: "Admin access required" });
    }

    // attach user to request
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ status: false, message: "Invalid or expired token" });
  }
}
