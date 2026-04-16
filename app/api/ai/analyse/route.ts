import { auth } from "@/lib/auth";
import { analyseSchema } from "@/lib/validators";
import { analyseFrame, buildPrompt, validateImageSize } from "@/lib/ai";
import { getSessionById, updateSession, logAiCall } from "@/lib/db/queries/sessions";
import { getProjectById } from "@/lib/db/queries/projects";
import { ok, err, handleError } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const body = await req.json();
    const { imageBase64, projectId, stepNumber, sessionId, userPrompt } = body;

    // Validate required fields
    if (!imageBase64 || !projectId || !stepNumber || !sessionId) {
      return err("Missing required fields", 400);
    }

    // Validate image size
    const { valid, sizeKb } = validateImageSize(imageBase64);
    if (!valid) return err(`Image too large. Max ${process.env.MAX_IMAGE_SIZE_KB ?? 2048}KB.`, 413);

    // Verify session ownership
    const assemblySession = await getSessionById(sessionId, session.user.id);
    if (!assemblySession) return err("Session not found", 404);
    if (assemblySession.status === "completed") return err("Session already completed", 400);

    // Fetch project + step context
    const project = await getProjectById(projectId);
    if (!project) return err("Project not found", 404);
    if (stepNumber > project.totalSteps) return err("Step out of range", 400);

    const step = (project.steps as any[])[stepNumber - 1];
    if (!step) return err("Step not found", 404);

    // Run AI analysis with optional user prompt
    const prompt = buildPrompt(step, project.totalSteps, userPrompt);
    const aiResult = await analyseFrame(imageBase64, prompt);

    // Log to DB (non-blocking)
    logAiCall({
      sessionId,
      stepNumber,
      provider: aiResult.meta.provider,
      promptTokens: aiResult.meta.promptTokens,
      imageSizeKb: sizeKb,
      responseMs: aiResult.meta.responseMs,
      confidence: aiResult.confidence,
      stepDetected: aiResult.stepDetected ?? undefined,
    }).catch(console.error);

    return ok({
      guidance: aiResult.guidance,
      confidence: aiResult.confidence,
      stepDetected: aiResult.stepDetected,
      provider: aiResult.meta.provider,
      responseMs: aiResult.meta.responseMs,
    });
  } catch (error) {
    return handleError(error);
  }
}
