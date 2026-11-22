import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks, teamMembers } from "@/lib/db/schema";

const ACTIVE = ["ready", "in_progress", "blocked", "review"] as const;

export type CapacityRow = {
  memberId: string;
  name: string;
  role: string;
  weeklyCapacityHours: number;
  assignedHours: number;
  utilization: number;
  status: "underutilized" | "balanced" | "overloaded";
  openTasks: number;
};

export function getTeamCapacity(): CapacityRow[] {
  const members = db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.active, true))
    .all();

  return members.map((m) => {
    const open = db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.ownerId, m.id),
          inArray(tasks.status, [...ACTIVE]),
          ne(tasks.status, "completed"),
        ),
      )
      .all();

    const assignedHours = open.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const utilization =
      m.weeklyCapacityHours > 0 ? assignedHours / m.weeklyCapacityHours : 0;

    let status: CapacityRow["status"] = "balanced";
    if (utilization < 0.55) status = "underutilized";
    if (utilization > 0.95) status = "overloaded";

    return {
      memberId: m.id,
      name: m.name,
      role: m.role,
      weeklyCapacityHours: m.weeklyCapacityHours,
      assignedHours,
      utilization: Math.round(utilization * 100) / 100,
      status,
      openTasks: open.length,
    };
  });
}

export function recommendReassignments() {
  const capacity = getTeamCapacity();
  const overloaded = capacity.filter((c) => c.status === "overloaded");
  const under = capacity.filter((c) => c.status === "underutilized");

  const suggestions: Array<{
    from: string;
    to: string;
    reason: string;
  }> = [];

  for (const o of overloaded) {
    const target = under[0];
    if (!target) break;
    suggestions.push({
      from: o.name,
      to: target.name,
      reason: `${o.name} is at ${Math.round(o.utilization * 100)}% capacity; ${target.name} is at ${Math.round(target.utilization * 100)}%. Move a ready/backlog task with matching skills.`,
    });
  }

  return { capacity, suggestions };
}

export function auditOrphanTasks() {
  return db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(
      and(
        sql`${tasks.ownerId} IS NULL`,
        inArray(tasks.status, ["backlog", "ready", "in_progress", "blocked"]),
      ),
    )
    .all()[0]?.count;
}
