import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const categoryEnum = pgEnum("category", ["electronics", "furniture", "mechanical", "craft", "other"]);
export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);

export type ProjectStep = {
  step_number: number;
  title: string;
  instruction: string;
  visual_cues: string[];
  image_url?: string;
  ai_prompt_hint?: string;
};

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: categoryEnum("category"),
  difficulty: difficultyEnum("difficulty"),
  steps: jsonb("steps").$type<ProjectStep[]>().notNull(),
  thumbnail: text("thumbnail"),
  totalSteps: integer("total_steps").notNull(),
  estMinutes: integer("est_minutes"),
  createdBy: uuid("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
