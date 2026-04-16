import { auth } from "@/lib/auth";
import { getSessionsByUser, createSession } from "@/lib/db/queries/sessions";
import { getProjectById } from "@/lib/db/queries/projects";
import { ok, err, handleError } from "@/lib/response";
import { z } from "zod";

const createSessionSchema = z.object({
  projectId: z.string().uuid(),
  aiProvider: z.enum(["ollama", "gemini", "claude"]).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    const sessions = await getSessionsByUser(session.user.id);
    
    return ok({ sessions });
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

    const body = await req.json();
    const { projectId, aiProvider } = createSessionSchema.parse(body);
    
    // Verify project exists and is accessible
    const project = await getProjectById(projectId);
    if (!project) {
      return err("Project not found", 404);
    }

    if (!project.isPublic && project.createdBy !== session.user.id) {
      return err("Project not accessible", 403);
    }

    // Create new session
    const newSession = await createSession({
      userId: session.user.id,
      projectId,
      currentStep: 1,
      completedSteps: [],
      status: "active",
      aiProvider: aiProvider || null,
      totalAiCalls: 0,
    });

    return ok({ 
      session: newSession,
      project 
    });
  } catch (error) {
    return handleError(error);
  }
}