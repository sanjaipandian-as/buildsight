import { pgTable, uuid, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { assemblySessions } from "./sessions";

export const aiLogs = pgTable("ai_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => assemblySessions.id, { onDelete: "cascade" }).notNull(),
  stepNumber: integer("step_number").notNull(),
  provider: uuid("provider"),
  promptTokens: integer("prompt_tokens"),
  imageSizeKb: integer("image_size_kb"),
  responseMs: integer("response_ms"),
  confidence: numeric("confidence", { precision: 4, scale: 2 }),
  stepDetected: integer("step_detected"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AiLog = typeof aiLogs.$inferSelect;
