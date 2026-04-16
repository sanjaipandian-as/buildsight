import { auth } from "@/lib/auth";
import { getUserById, deleteUser } from "@/lib/db/queries/users";
import { ok, err, handleError } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    const user = await getUserById(session.user.id);
    
    if (!user) {
      return err("User not found", 404);
    }

    // Remove sensitive fields
    const { ...publicUser } = user;
    
    return ok({ user: publicUser });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err("Unauthorized", 401);
    }

    // GDPR compliance - delete all user data
    await deleteUser(session.user.id);
    
    return ok({ message: "Account deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}