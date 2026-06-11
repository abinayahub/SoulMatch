import { pgTable, serial, integer, text, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "trialing"]);
export const rewardTierEnum = pgEnum("reward_tier", ["bronze", "silver", "gold", "platinum"]);
export const rewardTransactionTypeEnum = pgEnum("reward_transaction_type", ["earned", "spent"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rewardsTable = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  coins: integer("coins").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  tier: rewardTierEnum("tier").notNull().default("bronze"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rewardTransactionsTable = pgTable("reward_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: rewardTransactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SubscriptionRecord = typeof subscriptionsTable.$inferSelect;
