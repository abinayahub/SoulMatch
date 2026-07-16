import nodemailer from "nodemailer";
import { logger } from "./logger";

// Standard SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
  // If no SMTP user is provided, don't crash, just log and skip
  if (!process.env.SMTP_USER) {
    logger.warn("SMTP_USER is not configured in .env. Mocking email delivery to console:");
    logger.info(`[MOCK EMAIL to ${to}] Reset Link: http://localhost:5173/reset-password?token=${token}`);
    return;
  }

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Soul Match AI" <${process.env.SMTP_USER}>`,
      to,
      subject: "Password Reset Request - Soul Match AI",
      text: `You requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f43f5e;">Reset Your Password</h2>
          <p>You requested a password reset for your Soul Match AI account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">If you did not request this password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
    logger.info(`Password reset email sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}: ${error}`);
    throw error;
  }
};
