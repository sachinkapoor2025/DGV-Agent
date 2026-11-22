import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { TaskUpdateSchema, updateTask } from "@/lib/tasks/service";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    if (body.deadline !== undefined && session.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can change deadlines explicitly" },
        { status: 403 },
      );
    }
    const task = updateTask(
      TaskUpdateSchema.parse({
        ...body,
        id,
        actor: session.email,
        allowDeadlineChange:
          session.role === "admin" && Boolean(body.allowDeadlineChange),
      }),
    );
    return NextResponse.json({ task });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}
