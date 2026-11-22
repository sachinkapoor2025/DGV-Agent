import { NextResponse } from "next/server";
import { runCooBriefing } from "@/agents/coo/run";
import { runAllGrowthAgents, runGrowthAgent } from "@/agents/growth/run";
import { getSession } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const body = (await req.json()) as {
    agent?: string;
    kind?: "morning" | "midday" | "evening" | "weekly";
  };

  if (!body.agent || body.agent === "coo") {
    const briefing = runCooBriefing(body.kind || "morning");
    return NextResponse.json({
      ok: true,
      agent: "coo",
      reportId: briefing.reportId,
      preview: briefing.body.slice(0, 1200),
    });
  }

  if (body.agent === "all-growth") {
    return NextResponse.json({ ok: true, results: runAllGrowthAgents() });
  }

  if (
    body.agent === "usaraki" ||
    body.agent === "blossompot" ||
    body.agent === "spicycenter" ||
    body.agent === "occasionfun" ||
    body.agent === "halloweenready"
  ) {
    return NextResponse.json({ ok: true, result: runGrowthAgent(body.agent) });
  }

  return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
}
