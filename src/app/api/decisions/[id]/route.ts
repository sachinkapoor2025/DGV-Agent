import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { db, ensureSchema } from "@/lib/db/client";
import { decisions } from "@/lib/db/schema";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const { id } = await ctx.params;
  const body = (await req.json()) as { status?: "approved" | "rejected" };
  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }
  db.update(decisions)
    .set({ status: body.status })
    .where(eq(decisions.id, id))
    .run();
  audit(session.email, `decision.${body.status}`, "decision", id);
  return NextResponse.json({
    ok: true,
    decision: db.select().from(decisions).where(eq(decisions.id, id)).get(),
  });
}
