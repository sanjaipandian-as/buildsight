import { z } from "zod";

export const analyseSchema = z.object({
  imageBase64: z.string().min(100, "Image data required").max(4_000_000, "Image too large"),
  projectId: z.string().uuid("Invalid project ID"),
  stepNumber: z.number().int().min(1).max(500),
  sessionId: z.string().uuid("Invalid session ID"),
});

export const createSessionSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

export const updateSessionSchema = z.object({
  currentStep: z.number().int().min(1).optional(),
  completedSteps: z.array(z.number().int().min(1)).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(["electronics", "furniture", "mechanical", "craft", "other"]).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  steps: z.array(z.object({
    step_number: z.number().int().min(1),
    title: z.string().min(1).max(255),
    instruction: z.string().min(1),
    visual_cues: z.array(z.string()),
    image_url: z.string().url().optional(),
    ai_prompt_hint: z.string().optional(),
  })).min(1),
  thumbnail: z.string().url().optional(),
  estMinutes: z.number().int().min(1).optional(),
  isPublic: z.boolean().default(true),
});

export const projectsQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
