import { auth } from "@/lib/auth";
import { getProjectById, updateProject, deleteProject } from "@/lib/db/queries/projects";
import { ok, err, handleError } from "@/lib/response";
import { z } from "zod";

const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
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
  })).optional(),
  thumbnail: z.string().url().optional(),
  estMinutes: z.number().min(1).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    
    if (!project) {
      return err("Project not found", 404);
    }

    // Only show public projects unless user is the creator
    const session = await auth();
    if (!project.isPublic && project.createdBy !== session?.user?.id) {
      return err("Project not found", 404);
    }

    return ok({ project });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    const project = await getProjectById(params.id);
    if (!project) {
      return err("Project not found", 404);
    }

    // Check if user owns the project or is admin
    if (project.createdBy !== session.user.id) {
      // TODO: Add admin check here when admin system is implemented
      return err("Forbidden", 403);
    }

    const body = await req.json();
    const data = updateProjectSchema.parse(body);
    
    // Update totalSteps if steps are provided
    const updateData = {
      ...data,
      ...(data.steps && { totalSteps: data.steps.length }),
    };

    const updatedProject = await updateProject(params.id, updateData);
    
    return ok({ project: updatedProject });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    const project = await getProjectById(params.id);
    if (!project) {
      return err("Project not found", 404);
    }

    // Check if user owns the project or is admin
    if (project.createdBy !== session.user.id) {
      // TODO: Add admin check here when admin system is implemented
      return err("Forbidden", 403);
    }

    await deleteProject(params.id);
    
    return ok({ message: "Project deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}