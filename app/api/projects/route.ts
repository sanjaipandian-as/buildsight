import { auth } from "@/lib/auth";
import { getProjects, createProject } from "@/lib/db/queries/projects";
import { ok, err, handleError } from "@/lib/response";
import { z } from "zod";

const projectsQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(["electronics", "furniture", "mechanical", "craft", "other"]).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  steps: z.array(z.object({
    step_number: z.number().min(1),
    title: z.string().min(1),
    instruction: z.string().min(1),
    visual_cues: z.array(z.string()),
    image_url: z.string().url().optional(),
    ai_prompt_hint: z.string().optional(),
  })),
  thumbnail: z.string().url().optional(),
  estMinutes: z.number().min(1).optional(),
  isPublic: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = projectsQuerySchema.parse(Object.fromEntries(searchParams));
    
    const result = await getProjects({
      ...query,
      publicOnly: true, // Only show public projects in API
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    // TODO: Add admin check here when admin system is implemented
    // For now, any authenticated user can create projects
    
    const body = await req.json();
    const data = createProjectSchema.parse(body);
    
    const project = await createProject({
      ...data,
      totalSteps: data.steps.length,
      createdBy: session.user.id,
    });

    return ok({ project });
  } catch (error) {
    return handleError(error);
  }
}