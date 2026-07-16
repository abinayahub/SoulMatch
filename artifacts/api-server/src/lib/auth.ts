import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const JWT_SECRET = process.env.JWT_SECRET ?? "soulmatch-secret-dev-2024";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "soulmatch-refresh-secret-dev-2024";
const JWT_EXPIRES_IN = "7d";
const JWT_REFRESH_EXPIRES_IN = "30d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    const userId = req.user.userId;
    db.update(usersTable)
      .set({ lastActive: new Date() })
      .where(eq(usersTable.id, userId))
      .execute()
      .then(() => console.log("Updated lastActive for user", userId))
      .catch((err) => console.error("Error updating lastActive:", err));
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    
    // Fast path: if token has the role
    if (roles.includes(req.user.role)) {
      next();
      return;
    }

    // Slow path: check DB if role was updated
    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, req.user.userId)
      });
      
      if (user && roles.includes(user.role)) {
        req.user.role = user.role;
        next();
        return;
      }
    } catch (err) {
      // Ignore DB errors and fall through to 403
    }
    
    res.status(403).json({ error: "Insufficient permissions" });
  };
}
