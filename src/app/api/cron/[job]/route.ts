import { NextResponse } from "next/server";
import {
  runEveningAutomation,
  runMiddayAutomation,
  runMorningAutomation,
  runWeeklyAutomation,
} from "@/lib/automation/scheduler";
import { notifySlack } from "@/integrations";

function authorized(req: Request) {
  const secret = process.env.DGV_CRON_SECRET || "dgv-cron-dev";
  const header = req.headers.get("x-dgv-cron-secret");
  return header === secret;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ job: string }> },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { job } = await ctx.params;
  let result: unknown;
  switch (job) {
    case "morning":
      result = runMorningAutomation();
      break;
    case "midday":
      result = runMiddayAutomation();
      break;
    case "evening":
      result = runEveningAutomation();
      break;
    case "weekly":
      result = runWeeklyAutomation();
      break;
    default:
      return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  }
  await notifySlack(`DGV automation completed: ${job}`);
  return NextResponse.json({ ok: true, job, result });
}
