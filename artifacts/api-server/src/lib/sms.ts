import twilio from "twilio";
import { logger } from "./logger";

export const sendSms = async (to: string, message: string) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    logger.warn("Twilio is not configured in .env. Mocking SMS delivery to console:");
    logger.info(`[MOCK SMS to ${to}] ${message}`);
    return;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}. Message SID: ${result.sid}`);
  } catch (error) {
    logger.error(`Failed to send SMS to ${to}: ${error}`);
    throw error;
  }
};
