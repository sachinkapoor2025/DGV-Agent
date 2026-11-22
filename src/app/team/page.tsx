import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";
import { recommendReassignments } from "@/lib/capacity";
import { db, ensureSchema } from "@/lib/db/client";
import { teamMembers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  ensureSchema();
  const members = db.select().from(teamMembers).all();
  const { capacity, suggestions } = recommendReassignments();
  const capById = Object.fromEntries(capacity.map((c) => [c.memberId, c]));

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="display text-3xl font-semibold">Team management</h1>
          <p className="mt-1 text-[var(--muted)]">
            Skills, capacity, load balancing, and AI-executable surplus work.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((m) => {
            const c = capById[m.id];
            const skills = JSON.parse(m.skillsJson || "[]") as string[];
            return (
              <div key={m.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{m.name}</h2>
                    <p className="text-sm text-[var(--muted)]">
                      {m.role} · {m.email}
                    </p>
                  </div>
                  {c ? (
                    <span
                      className={`badge ${
                        c.status === "overloaded"
                          ? "danger"
                          : c.status === "underutilized"
                            ? "warn"
                            : "ok"
                      }`}
                    >
                      {Math.round(c.utilization * 100)}%
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm">
                  Capacity {m.weeklyCapacityHours}h/week
                  {c ? ` · assigned ${c.assignedHours}h · ${c.openTasks} open tasks` : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="badge">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <section className="panel p-5">
          <h2 className="display text-xl font-semibold">Reassignment suggestions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {suggestions.length === 0 ? (
              <li className="text-[var(--muted)]">Load is balanced.</li>
            ) : (
              suggestions.map((s, i) => (
                <li key={i}>
                  {s.from} → {s.to}: {s.reason}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
