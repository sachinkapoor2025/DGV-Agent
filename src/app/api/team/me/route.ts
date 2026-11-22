import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { recommendReassignments } from "@/lib/capacity";
import { db, ensureSchema } from "@/lib/db/client";
import { tasks, teamMembers } from "@/lib/db/schema";
import { updateTask } from "@/lib/tasks/service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const member = db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.email, session.email))
    .get();
  const myTasks = member
    ? db.select().from(tasks).where(eq(tasks.ownerId, member.id)).all()
    : [];
  const next = myTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => b.score - a.score)[0];
  const capacity = recommendReassignments().capacity.find(
    (c) => c.memberId === member?.id,
  );
  return NextResponse.json({
    member,
    myTasks,
    nextRecommended: next ?? null,
    capacity,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    action?: string;
    taskId?: string;
    blockers?: string[];
    actualHours?: number;
    status?: "in_progress" | "blocked" | "review" | "completed";
    bandwidthNote?: string;
  };

  if (body.action === "update_task" && body.taskId) {
    const task = updateTask({
      id: body.taskId,
      status: body.status,
      blockers: body.blockers,
      actualHours: body.actualHours,
      actor: session.email,
      allowDeadlineChange: false,
      note: body.bandwidthNote,
    });
    return NextResponse.json({ ok: true, task });
  }

  return NextResponse.json({
    ok: true,
    message:
      body.bandwidthNote ||
      "Update received. Use action=update_task with taskId for status changes.",
  });
}
