import { eq, and, ilike, sql } from "drizzle-orm";
import { db } from "../client";
import { projects, type NewProject } from "../schema";

export async function getProjects(opts: {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
  publicOnly?: boolean;
  createdBy?: string;
}) {
  const { category, difficulty, search, page = 1, limit = 12, publicOnly = true, createdBy } = opts;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (publicOnly) conditions.push(eq(projects.isPublic, true));
  if (category) conditions.push(eq(projects.category, category as any));
  if (difficulty) conditions.push(eq(projects.difficulty, difficulty as any));
  if (search) conditions.push(ilike(projects.title, `%${search}%`));
  if (createdBy) conditions.push(eq(projects.createdBy, createdBy));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ count }]] = await Promise.all([
    db.query.projects.findMany({
      where,
      limit,
      offset,
      columns: { steps: false },
    }),
    db.select({ count: sql<number>`count(*)` }).from(projects).where(where),
  ]);

  return { items, total: Number(count), page, limit };
}

export async function getProjectById(id: string) {
  return db.query.projects.findFirst({ where: eq(projects.id, id) });
}

export async function createProject(data: NewProject) {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function updateProject(id: string, data: Partial<NewProject>) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return project;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
}
