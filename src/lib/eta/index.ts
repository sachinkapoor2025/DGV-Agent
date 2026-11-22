import { and, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";

export type RiskItem = {
  taskId: string;
  title: string;
  status: string;
  deadline: string | null;
  eta: string | null;
  risk: "overdue" | "at_risk" | "blocked" | "no_owner" | "vague";
  reason: string;
  recommendation: string;
};

export function scanTaskRisks(): RiskItem[] {
  const open = db
    .select()
    .from(tasks)
    .where(
      and(
        ne(tasks.status, "completed"),
        inArray(tasks.status, [
          "backlog",
          "ready",
          "in_progress",
          "blocked",
          "review",
        ]),
      ),
    )
    .all();

  const today = new Date().toISOString().slice(0, 10);
  const risks: RiskItem[] = [];

  for (const t of open) {
    const blockers = JSON.parse(t.blockersJson || "[]") as string[];

    if (t.status === "blocked" || blockers.length > 0) {
      risks.push({
        taskId: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        eta: t.eta,
        risk: "blocked",
        reason: blockers[0] || "Marked blocked without detail",
        recommendation: "Unblock owner or reassign; escalate if >48h blocked.",
      });
    }

    if (!t.ownerId) {
      risks.push({
        taskId: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        eta: t.eta,
        risk: "no_owner",
        reason: "No owner assigned",
        recommendation: "Assign to available capacity with matching skills.",
      });
    }

    if (!t.expectedOutcome || t.expectedOutcome.length < 20) {
      risks.push({
        taskId: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        eta: t.eta,
        risk: "vague",
        reason: "Expected outcome is missing or too vague",
        recommendation: "Rewrite with a measurable deliverable before execution.",
      });
    }

    if (t.deadline && t.deadline < today) {
      risks.push({
        taskId: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        eta: t.eta,
        risk: "overdue",
        reason: `Deadline ${t.deadline} has passed`,
        recommendation:
          "Do not silently change deadline. Confirm new ETA with owner and document reason.",
      });
    } else if (t.deadline && t.eta && t.eta > t.deadline) {
      risks.push({
        taskId: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        eta: t.eta,
        risk: "at_risk",
        reason: `ETA ${t.eta} exceeds deadline ${t.deadline}`,
        recommendation: "Reduce scope, add help, or escalate for approval of timeline change.",
      });
    } else if (t.deadline) {
      const days =
        (new Date(t.deadline).getTime() - new Date(today).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days <= 2 && t.status !== "review") {
        risks.push({
          taskId: t.id,
          title: t.title,
          status: t.status,
          deadline: t.deadline,
          eta: t.eta,
          risk: "at_risk",
          reason: `Deadline within ${Math.ceil(days)} day(s)`,
          recommendation: "Daily check-in; protect focus time for owner.",
        });
      }
    }
  }

  return risks;
}

export function countOpenTasks() {
  return db
    .select({ c: sql<number>`count(*)` })
    .from(tasks)
    .where(ne(tasks.status, "completed"))
    .all()[0]?.c ?? 0;
}

export function tasksDueOn(dateIso: string) {
  return db
    .select()
    .from(tasks)
    .where(and(isNotNull(tasks.deadline), sql`${tasks.deadline} = ${dateIso}`))
    .all();
}
