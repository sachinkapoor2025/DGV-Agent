import { runCooBriefing } from "@/agents/coo/run";
import { runAllGrowthAgents } from "@/agents/growth/run";
import { ensureSchema } from "@/lib/db/client";

/**
 * Cron entrypoints — wire via GitHub Actions schedule or external cron hitting /api/cron/*.
 * Never silently changes deadlines.
 */
export function runMorningAutomation() {
  ensureSchema();
  const growth = runAllGrowthAgents();
  const briefing = runCooBriefing("morning");
  return { growth, briefing: { reportId: briefing.reportId } };
}

export function runMiddayAutomation() {
  ensureSchema();
  const briefing = runCooBriefing("midday");
  return { briefing: { reportId: briefing.reportId } };
}

export function runEveningAutomation() {
  ensureSchema();
  const briefing = runCooBriefing("evening");
  return { briefing: { reportId: briefing.reportId } };
}

export function runWeeklyAutomation() {
  ensureSchema();
  const growth = runAllGrowthAgents();
  const briefing = runCooBriefing("weekly");
  return { growth, briefing: { reportId: briefing.reportId } };
}
