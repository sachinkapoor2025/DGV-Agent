import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { reviewStrategy } from "@/lib/strategy/import";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json()) as { decision?: "approved" | "rejected" };
  if (!body.decision) {
    return NextResponse.json({ error: "decision required" }, { status: 400 });
  }
  try {
    const strategy = reviewStrategy(id, body.decision, session.email);
    return NextResponse.json({ ok: true, strategy });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Review failed" },
      { status: 400 },
    );
  }
}
