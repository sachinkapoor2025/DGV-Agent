import { redirect } from "next/navigation";
import { AGENTS } from "@/agents/registry";
import { RunAgentsPanel } from "@/components/RunAgentsPanel";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";
import { db, ensureSchema } from "@/lib/db/client";
import { agentRuns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  ensureSchema();
  const runs = db
    .select()
    .from(agentRuns)
    .orderBy(desc(agentRuns.createdAt))
    .limit(25)
    .all();

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="display text-3xl font-semibold">AI agents</h1>
          <p className="mt-1 text-[var(--muted)]">
            Central COO plus four business growth agents. Approvals gate spend and production.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {AGENTS.map((a) => (
            <div key={a.id} className="panel p-5">
              <h2 className="text-lg font-semibold">{a.name}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{a.role}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">
                Autonomous
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {a.canAutonomously.map((x) => (
                  <span key={x} className="badge ok">
                    {x}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide text-[var(--muted)]">
                Needs approval
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {a.requiresApproval.map((x) => (
                  <span key={x} className="badge warn">
                    {x}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {session.role === "admin" ? <RunAgentsPanel /> : null}
        <section className="panel p-5">
          <h2 className="display text-xl font-semibold">Recent agent runs</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {runs.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 border-b border-[var(--line)] pb-2">
                <span>
                  {r.agentId} · {r.kind}
                </span>
                <span className="text-[var(--muted)]">{r.createdAt}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
