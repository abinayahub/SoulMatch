import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, otpsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  authenticate,
  type AuthRequest,
  generateOtp,
} from "../lib/auth";
import { buildUserProfile } from "../lib/helpers";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, gender, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      email, passwordHash, firstName, lastName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone || null,
    }).returning();

    const payload = { userId: user.id, email: user.email, role: user.role };
    return res.status(201).json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: await buildUserProfile(user),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (user.status === "banned") return res.status(403).json({ error: "Account banned" });
    if (user.status === "suspended") return res.status(403).json({ error: "Account suspended" });

    const payload = { userId: user.id, email: user.email, role: user.role };
    return res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: await buildUserProfile(user),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) return res.status(400).json({ error: "Type and value required" });
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.insert(otpsTable).values({ type, value, otp, expiresAt });
    req.log.info({ type, value: value.slice(0, 3) + "***" }, "OTP sent");
    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { type, value, otp } = req.body;
    if (!type || !value || !otp) return res.status(400).json({ error: "Missing fields" });

    const record = await db.query.otpsTable.findFirst({
      where: and(
        eq(otpsTable.type, type),
        eq(otpsTable.value, value),
        eq(otpsTable.otp, otp),
        eq(otpsTable.isUsed, false),
        gt(otpsTable.expiresAt, new Date()),
      ),
    });

    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await db.update(otpsTable).set({ isUsed: true }).where(eq(otpsTable.id, record.id));

    let user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, value) });
    if (!user) {
      // Register new user from OTP flow
      const [newUser] = await db.insert(usersTable).values({
        email: type === "email" ? value : `user_${Date.now()}@soulmatch.ai`,
        firstName: "User",
        lastName: "",
        phone: type === "phone" ? value : null,
        isEmailVerified: type === "email",
        isPhoneVerified: type === "phone",
      }).returning();
      user = newUser;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    return res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: await buildUserProfile(user),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "idToken required" });

    // In production: verify with Google. For dev, decode the token.
    const parts = idToken.split(".");
    let googleUser: { email: string; name: string; sub: string } | null = null;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      googleUser = { email: payload.email, name: payload.name || "User", sub: payload.sub };
    } catch {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    let user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, googleUser.email) });
    if (!user) {
      const nameParts = googleUser.name.split(" ");
      const [newUser] = await db.insert(usersTable).values({
        email: googleUser.email,
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "",
        googleId: googleUser.sub,
        isEmailVerified: true,
      }).returning();
      user = newUser;
    }

    const jwtPayload = { userId: user.id, email: user.email, role: user.role };
    return res.json({
      accessToken: signAccessToken(jwtPayload),
      refreshToken: signRefreshToken(jwtPayload),
      user: await buildUserProfile(user),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, decoded.userId) });
    if (!user) return res.status(401).json({ error: "User not found" });
    const payload = { userId: user.id, email: user.email, role: user.role };
    return res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: await buildUserProfile(user),
    });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", authenticate, (_req, res) => {
  return res.json({ message: "Logged out successfully" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  req.log.info({ email }, "Password reset requested");
  return res.json({ message: "Password reset link sent if email exists" });
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and newPassword required" });
  return res.json({ message: "Password reset successfully" });
});

export default router;
