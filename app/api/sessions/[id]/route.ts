import { auth } from "@/lib/auth";
import { getSessionById, updateSession, deleteSession } from "@/lib/db/queries/sessions";
import { ok, err, handleError } from "@/lib/response";
import { z } from "zod";

const updateSessionSchema = z.object({
  currentStep: z.number().min(1).optional(),
  completedSteps: z.array(z.number().min(1)).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
  aiProvider: z.enum(["ollama", "gemini", "claude"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    const assemblySession = await getSessionById(params.id, session.user.id);
    
    if (!assemblySession) {
      return err("Session not found", 404);
    }

    return ok({ 
      session: assemblySession,
      project: assemblySession.project 
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    // Verify session exists and user owns it
    const existingSession = await getSessionById(params.id, session.user.id);
    if (!existingSession) {
      return err("Session not found", 404);
    }

    const body = await req.json();
    const data = updateSessionSchema.parse(body);
    
    // Add completion timestamp if status is being set to completed
    const updateData = {
      ...data,
      ...(data.status === "completed" && { completedAt: new Date() }),
    };

    const updatedSession = await updateSession(params.id, session.user.id, updateData);
    
    return ok({ session: updatedSession });
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

    // Verify session exists and user owns it
    const existingSession = await getSessionById(params.id, session.user.id);
    if (!existingSession) {
      return err("Session not found", 404);
    }

    await deleteSession(params.id, session.user.id);
    
    return ok({ message: "Session deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}