import { pgTable, uuid, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const sessionStatusEnum = pgEnum("session_status", ["active", "paused", "completed"]);
export const aiProviderEnum = pgEnum("ai_provider", ["ollama", "gemini", "claude"]);

export const assemblySessions = pgTable("assembly_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  completedSteps: integer("completed_steps").array().default([]).notNull(),
  status: sessionStatusEnum("status").default("active").notNull(),
  aiProvider: aiProviderEnum("ai_provider"),
  totalAiCalls: integer("total_ai_calls").default(0).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type AssemblySession = typeof assemblySessions.$inferSelect;
export type NewAssemblySession = typeof assemblySessions.$inferInsert;
