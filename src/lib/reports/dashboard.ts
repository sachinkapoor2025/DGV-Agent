import { desc, eq, ne, sql } from "drizzle-orm";
import { recommendReassignments } from "@/lib/capacity";
import { db, ensureSchema } from "@/lib/db/client";
import {
  agentRuns,
  businesses,
  decisions,
  reports,
  tasks,
  teamMembers,
} from "@/lib/db/schema";
import { scanTaskRisks } from "@/lib/eta";

export function getDashboardData() {
  ensureSchema();
  const biz = db.select().from(businesses).all();
  const allTasks = db.select().from(tasks).orderBy(desc(tasks.score)).all();
  const team = db.select().from(teamMembers).where(eq(teamMembers.active, true)).all();
  const capacity = recommendReassignments();
  const risks = scanTaskRisks();
  const pendingDecisions = db
    .select()
    .from(decisions)
    .where(eq(decisions.status, "pending"))
    .orderBy(desc(decisions.createdAt))
    .limit(20)
    .all();
  const recentRuns = db
    .select()
    .from(agentRuns)
    .orderBy(desc(agentRuns.createdAt))
    .limit(20)
    .all();
  const latestReports = db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(10)
    .all();

  const byBusiness = biz.map((b) => {
    const bt = allTasks.filter((t) => t.businessId === b.id);
    return {
      ...b,
      goals: JSON.parse(b.goalsJson || "[]") as string[],
      kpis: JSON.parse(b.kpisJson || "{}") as Record<string, string[]>,
      tasksCompleted: bt.filter((t) => t.status === "completed").length,
      tasksPending: bt.filter((t) => t.status !== "completed").length,
      overdue: risks.filter(
        (r) => r.risk === "overdue" && bt.some((t) => t.id === r.taskId),
      ).length,
      topTask: bt.find((t) => t.status !== "completed") ?? null,
    };
  });

  const completed =
    db
      .select({ c: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "completed"))
      .all()[0]?.c ?? 0;
  const pending =
    db
      .select({ c: sql<number>`count(*)` })
      .from(tasks)
      .where(ne(tasks.status, "completed"))
      .all()[0]?.c ?? 0;

  return {
    company: {
      businesses: biz.length,
      team: team.length,
      tasksCompleted: completed,
      tasksPending: pending,
      overdue: risks.filter((r) => r.risk === "overdue").length,
      blockers: risks.filter((r) => r.risk === "blocked").length,
      decisionsRequired: pendingDecisions.length,
    },
    byBusiness,
    capacity: capacity.capacity,
    reassignments: capacity.suggestions,
    risks: risks.slice(0, 30),
    topTasks: allTasks.filter((t) => t.status !== "completed").slice(0, 10),
    pendingDecisions,
    recentRuns,
    latestReports,
    opportunities: byBusiness
      .map((b) => b.topTask)
      .filter(Boolean)
      .slice(0, 5),
  };
}
