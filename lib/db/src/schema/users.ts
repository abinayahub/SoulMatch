import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "premium",
  "admin",
  "superadmin",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  gender: genderEnum("gender"),
  phone: varchar("phone", { length: 30 }),
  bio: text("bio"),
  occupation: varchar("occupation", { length: 200 }),
  education: varchar("education", { length: 200 }),
  religion: varchar("religion", { length: 100 }),
  motherTongue: varchar("mother_tongue", { length: 100 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  height: integer("height"),
  maritalStatus: varchar("marital_status", { length: 50 }),
  dietaryPreference: varchar("dietary_preference", { length: 50 }),
  smoking: varchar("smoking", { length: 50 }),
  drinking: varchar("drinking", { length: 50 }),
  interests: text("interests").array(),
  languages: text("languages").array(),
  weight: integer("weight"),
  fieldOfStudy: varchar("field_of_study", { length: 200 }),
  company: varchar("company", { length: 200 }),
  industry: varchar("industry", { length: 100 }),
  annualIncomeRange: varchar("annual_income_range", { length: 100 }),
  stateRegion: varchar("state_region", { length: 100 }),
  citizenship: varchar("citizenship", { length: 100 }),
  videoIntroUrl: text("video_intro_url"),
  isGovIdVerified: boolean("is_gov_id_verified").notNull().default(false),
  isSelfieVerified: boolean("is_selfie_verified").notNull().default(false),
  govIdFrontUrl: text("gov_id_front_url"),
  govIdBackUrl: text("gov_id_back_url"),
  selfieUrl: text("selfie_url"),
  role: userRoleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("active"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("unverified"),
  isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  journeyProgress: integer("journey_progress").notNull().default(0),
  googleId: text("google_id"),
  journeyStartedAt: timestamp("journey_started_at"),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const profileViewsTable = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  viewerId: integer("viewer_id").references(() => usersTable.id).notNull(),
  targetUserId: integer("target_user_id").references(() => usersTable.id).notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});
export const insertProfileViewSchema = createInsertSchema(profileViewsTable).omit({
  id: true,
  viewedAt: true,
});
export type ProfileView = typeof profileViewsTable.$inferSelect;
