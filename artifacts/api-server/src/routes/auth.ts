import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "@workspace/db";
import { usersTable, otpsTable, photosTable } from "@workspace/db";
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
import { sendPasswordResetEmail } from "../lib/mail";
import { sendSms } from "../lib/sms";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    let { email, password, firstName, lastName, dateOfBirth, gender, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Strong password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ error: "Password does not meet complexity requirements" });
    }
    email = email.toLowerCase();
    const existing = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      email, passwordHash, firstName, lastName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone ? phone.trim() : null,
      isPhoneVerified: false,
    }).returning();

    if (phone && phone.trim()) {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await db.insert(otpsTable).values({
        type: "phone_verification",
        value: phone.trim(),
        otp,
        expiresAt,
      });

      req.log.info({ phone: phone.trim(), otp }, "Phone verification OTP generated");
      
      // Attempt to send actual SMS
      try {
        await sendSms(phone.trim(), `Your SoulMatch verification code is: ${otp}. It expires in 10 minutes.`);
      } catch (e) {
        req.log.error("Failed to send SMS OTP, but continuing to allow fallback/mock testing");
      }

      return res.status(201).json({
        message: "Account created successfully. Please verify your phone number.",
        phone: phone.trim(),
        mockOtp: otp, // For local developer testing
        requirePhoneVerification: true,
        userId: user.id
      });
    }

    // If no phone provided, just log them in immediately
    const payload = { userId: user.id, email: user.email, role: user.role };
    return res.status(201).json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: await buildUserProfile(user),
      requirePhoneVerification: false
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    email = email.toLowerCase();

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

router.post("/verify-phone", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });

    const record = await db.query.otpsTable.findFirst({
      where: and(
        eq(otpsTable.type, "phone_verification"),
        eq(otpsTable.value, phone),
        eq(otpsTable.otp, otp),
        eq(otpsTable.isUsed, false),
        gt(otpsTable.expiresAt, new Date()),
      ),
    });

    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    // Mark OTP as used
    await db.update(otpsTable).set({ isUsed: true }).where(eq(otpsTable.id, record.id));

    // Update user's phone verification status
    const [user] = await db.update(usersTable)
      .set({ isPhoneVerified: true })
      .where(eq(usersTable.phone, phone))
      .returning();

    if (!user) return res.status(404).json({ error: "User not found" });

    // Log the user in now that they are verified
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
    let googleUser: { email: string; name: string; sub: string; picture?: string } | null = null;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      googleUser = { email: payload.email, name: payload.name || "User", sub: payload.sub, picture: payload.picture };
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

      if (googleUser.picture) {
        await db.insert(photosTable).values({
          userId: user.id,
          url: googleUser.picture,
          publicId: `google_${googleUser.sub}`,
          isPrimary: true,
        });
      }
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
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const normalizedEmail = email.toLowerCase();
    
    // Check if user exists
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, normalizedEmail) });
    if (!user) {
      return res.json({ message: "Password reset link sent if email exists" });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await db.insert(otpsTable).values({
      type: "password_reset",
      value: normalizedEmail,
      otp: token,
      expiresAt,
    });

    req.log.info({ email: normalizedEmail }, "Password reset requested");
    
    // Attempt to send the actual email
    try {
      await sendPasswordResetEmail(normalizedEmail, token);
    } catch (e) {
      req.log.error("Failed to send email, but continuing so we don't leak user existence.");
    }
    
    // Do not return the mockToken anymore, the email is sent
    return res.json({ message: "Password reset link sent if email exists" });
  } catch (err: any) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error", details: err.message, stack: err.stack });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and newPassword required" });

    // Strong password validation
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password does not meet complexity requirements" });
    }

    const record = await db.query.otpsTable.findFirst({
      where: and(
        eq(otpsTable.type, "password_reset"),
        eq(otpsTable.otp, token),
        eq(otpsTable.isUsed, false),
        gt(otpsTable.expiresAt, new Date()),
      ),
    });

    if (!record) return res.status(400).json({ error: "Invalid or expired reset token" });

    const passwordHash = await hashPassword(newPassword);
    
    await db.update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.email, record.value));

    await db.update(otpsTable)
      .set({ isUsed: true })
      .where(eq(otpsTable.id, record.id));

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
