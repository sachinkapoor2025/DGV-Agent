import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/reports/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = getDashboardData();

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <div className="rise">
          <h1 className="display text-3xl font-semibold md:text-4xl">
            Company command
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            AI COO view across UsaRakhi, Blossompot, SpicyCenter, HalloweenReady.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rise rise-delay-1">
          {[
            ["Pending tasks", data.company.tasksPending],
            ["Completed", data.company.tasksCompleted],
            ["Overdue", data.company.overdue],
            ["Decisions needed", data.company.decisionsRequired],
          ].map(([label, value]) => (
            <div key={String(label)} className="panel p-4">
              <div className="text-sm text-[var(--muted)]">{label}</div>
              <div className="display mt-1 text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 rise rise-delay-2">
          <section className="panel p-5">
            <h2 className="display text-xl font-semibold">Businesses</h2>
            <ul className="mt-4 space-y-3">
              {data.byBusiness.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-[var(--line)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                        {b.mission}
                      </p>
                    </div>
                    <span className="badge">
                      {b.tasksPending} open · {b.overdue} overdue
                    </span>
                  </div>
                  {b.topTask ? (
                    <p className="mt-2 text-sm">
                      Next: <span className="text-[var(--accent)]">{b.topTask.title}</span>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <h2 className="display text-xl font-semibold">Top impact work</h2>
            <ol className="mt-4 space-y-2">
              {data.topTasks.map((t, i) => (
                <li
                  key={t.id}
                  className="flex gap-3 rounded-xl border border-[var(--line)] p-3 text-sm"
                >
                  <span className="text-[var(--muted)]">{i + 1}.</span>
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="mt-1 text-[var(--muted)]">
                      score {t.score} · {t.status} · {t.priority}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 rise rise-delay-3">
          <section className="panel p-5 lg:col-span-1">
            <h2 className="display text-xl font-semibold">Team capacity</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {data.capacity.map((c) => (
                <li key={c.memberId} className="flex items-center justify-between gap-2">
                  <span>{c.name}</span>
                  <span
                    className={`badge ${
                      c.status === "overloaded"
                        ? "danger"
                        : c.status === "underutilized"
                          ? "warn"
                          : "ok"
                    }`}
                  >
                    {Math.round(c.utilization * 100)}% · {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5 lg:col-span-1">
            <h2 className="display text-xl font-semibold">Risks / blockers</h2>
            <ul className="mt-4 max-h-72 space-y-2 overflow-auto text-sm">
              {data.risks.length === 0 ? (
                <li className="text-[var(--muted)]">No active risks.</li>
              ) : (
                data.risks.map((r) => (
                  <li key={`${r.taskId}-${r.risk}`} className="border-b border-[var(--line)] pb-2">
                    <span className={`badge ${r.risk === "overdue" || r.risk === "blocked" ? "danger" : "warn"}`}>
                      {r.risk}
                    </span>{" "}
                    {r.title}
                    <div className="mt-1 text-[var(--muted)]">{r.reason}</div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="panel p-5 lg:col-span-1">
            <h2 className="display text-xl font-semibold">Decisions for Divit</h2>
            <ul className="mt-4 max-h-72 space-y-2 overflow-auto text-sm">
              {data.pendingDecisions.length === 0 ? (
                <li className="text-[var(--muted)]">No pending approvals.</li>
              ) : (
                data.pendingDecisions.map((d) => (
                  <li key={d.id} className="rounded-lg border border-[var(--line)] p-2">
                    <div className="font-medium">{d.title}</div>
                    <p className="mt-1 text-[var(--muted)]">{d.recommendation}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}
