import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../client";
import { assemblySessions, projects, aiLogs, type NewAssemblySession } from "../schema";

export async function getSessionsByUser(userId: string) {
  const rows = await db
    .select()
    .from(assemblySessions)
    .leftJoin(projects, eq(assemblySessions.projectId, projects.id))
    .where(eq(assemblySessions.userId, userId))
    .orderBy(desc(assemblySessions.updatedAt));

  return rows.map((r) => ({ ...r.assembly_sessions, project: r.projects }));
}

export async function getSessionById(id: string, userId: string) {
  const rows = await db
    .select()
    .from(assemblySessions)
    .leftJoin(projects, eq(assemblySessions.projectId, projects.id))
    .where(and(eq(assemblySessions.id, id), eq(assemblySessions.userId, userId)))
    .limit(1);

  if (rows.length === 0) return null;
  return { ...rows[0].assembly_sessions, project: rows[0].projects };
}

export async function createSession(data: NewAssemblySession) {
  const [session] = await db.insert(assemblySessions).values(data).returning();
  return session;
}

export async function updateSession(id: string, userId: string, data: Partial<NewAssemblySession>) {
  const [session] = await db
    .update(assemblySessions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(assemblySessions.id, id), eq(assemblySessions.userId, userId)))
    .returning();
  return session;
}

export async function deleteSession(id: string, userId: string) {
  await db
    .delete(assemblySessions)
    .where(and(eq(assemblySessions.id, id), eq(assemblySessions.userId, userId)));
}

export async function logAiCall(data: {
  sessionId: string;
  stepNumber: number;
  provider: string;
  promptTokens?: number;
  imageSizeKb?: number;
  responseMs?: number;
  confidence?: number;
  stepDetected?: number;
}) {
  await db.insert(aiLogs).values({
    sessionId: data.sessionId,
    stepNumber: data.stepNumber,
    promptTokens: data.promptTokens,
    imageSizeKb: data.imageSizeKb,
    responseMs: data.responseMs,
    confidence: data.confidence?.toString(),
    stepDetected: data.stepDetected,
  });

  // Increment totalAiCalls (non-critical)
  db.update(assemblySessions)
    .set({ totalAiCalls: sql`${assemblySessions.totalAiCalls} + 1` })
    .where(eq(assemblySessions.id, data.sessionId))
    .catch(() => {});
}
