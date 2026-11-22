import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createTask, listTasks, TaskCreateSchema } from "@/lib/tasks/service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ tasks: listTasks() });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const task = createTask(
      TaskCreateSchema.parse({ ...body, actor: session.email }),
    );
    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid task" },
      { status: 400 },
    );
  }
}
