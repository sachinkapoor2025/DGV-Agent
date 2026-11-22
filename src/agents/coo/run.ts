import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { recommendReassignments } from "@/lib/capacity";
import { db } from "@/lib/db/client";
import { agentRuns, decisions, reports, tasks } from "@/lib/db/schema";
import { scanTaskRisks, tasksDueOn } from "@/lib/eta";

export function runCooBriefing(kind: "morning" | "midday" | "evening" | "weekly" = "morning") {
  const today = new Date().toISOString().slice(0, 10);
  const capacity = recommendReassignments();
  const risks = scanTaskRisks();
  const dueToday = tasksDueOn(today);
  const topTasks = db
    .select()
    .from(tasks)
    .orderBy(desc(tasks.score))
    .limit(5)
    .all()
    .filter((t) => t.status !== "completed");

  const aiExecutable = db
    .select()
    .from(tasks)
    .orderBy(desc(tasks.score))
    .all()
    .filter((t) => t.executableByAi && t.status !== "completed")
    .slice(0, 8);

  const overdue = risks.filter((r) => r.risk === "overdue");
  const blocked = risks.filter((r) => r.risk === "blocked");
  const underutilized = capacity.capacity.filter((c) => c.status === "underutilized");
  const overloaded = capacity.capacity.filter((c) => c.status === "overloaded");

  const decisionsNeeded = [
    ...capacity.suggestions.map((s) => ({
      title: `Reassign work: ${s.from} → ${s.to}`,
      context: s.reason,
      recommendation: "Approve redistribution of one ready task.",
    })),
    ...overdue.slice(0, 3).map((r) => ({
      title: `Overdue: ${r.title}`,
      context: r.reason,
      recommendation: r.recommendation,
    })),
  ];

  for (const d of decisionsNeeded.slice(0, 5)) {
    db.insert(decisions)
      .values({
        id: nanoid(),
        title: d.title,
        context: d.context,
        recommendation: d.recommendation,
        requiresApproval: true,
        status: "pending",
      })
      .run();
  }

  const body = [
    `# DGV AI COO — ${kind} briefing (${today})`,
    "",
    "## Executive summary",
    `- Open high-impact focus: **${topTasks[0]?.title ?? "No scored tasks"}**`,
    `- Overdue risks: **${overdue.length}** | Blocked: **${blocked.length}**`,
    `- Underutilized: ${underutilized.map((u) => u.name).join(", ") || "none"}`,
    `- Overloaded: ${overloaded.map((u) => u.name).join(", ") || "none"}`,
    "",
    "## Top 5 highest-impact activities",
    ...topTasks.map(
      (t, i) =>
        `${i + 1}. **${t.title}** (score ${t.score}) — ${t.expectedOutcome}`,
    ),
    "",
    "## Due today",
    ...(dueToday.length
      ? dueToday.map((t) => `- ${t.title} [${t.status}]`)
      : ["- None"]),
    "",
    "## Blockers / risks",
    ...(risks.slice(0, 10).map((r) => `- (${r.risk}) ${r.title} — ${r.reason}`)),
    "",
    "## AI work that can be executed now",
    ...(aiExecutable.length
      ? aiExecutable.map((t) => `- ${t.title}`)
      : ["- None queued"]),
    "",
    "## Decisions required from Divit",
    ...decisionsNeeded.map((d) => `- ${d.title}: ${d.recommendation}`),
    "",
    "_Deadlines are never silently changed._",
  ].join("\n");

  const reportId = nanoid();
  const payload = {
    kind,
    today,
    topTasks,
    dueToday,
    risks,
    capacity: capacity.capacity,
    suggestions: capacity.suggestions,
    aiExecutable,
  };

  db.insert(reports)
    .values({
      id: reportId,
      kind,
      title: `COO ${kind} briefing ${today}`,
      bodyMarkdown: body,
      payloadJson: JSON.stringify(payload),
    })
    .run();

  db.insert(agentRuns)
    .values({
      id: nanoid(),
      agentId: "coo",
      kind: `briefing:${kind}`,
      inputJson: "{}",
      outputJson: JSON.stringify({ reportId, riskCount: risks.length }),
      status: "completed",
    })
    .run();

  return { reportId, body, payload };
}
