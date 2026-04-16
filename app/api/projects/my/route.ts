import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/db/queries/projects";
import { ok, err, handleError } from "@/lib/response";

// GET /api/projects/my — returns projects created by the logged-in user
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "50");

    const result = await getProjects({
      page,
      limit,
      publicOnly: false,          // include private user projects
      createdBy: session.user.id, // only this user's projects
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
