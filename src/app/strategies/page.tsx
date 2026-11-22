import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { StrategyActions } from "@/components/StrategyActions";
import { getSession } from "@/lib/auth/session";
import { listStrategies } from "@/lib/strategy/import";

export const dynamic = "force-dynamic";

export default async function StrategiesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const rows = listStrategies();

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="display text-3xl font-semibold">Business strategies</h1>
          <p className="mt-1 text-[var(--muted)]">
            Imported plans stay pending review until you approve. Missing sections are listed —
            nothing is invented.
          </p>
        </div>
        {session.role === "admin" ? <StrategyActions /> : null}
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="panel p-5 text-[var(--muted)]">
              No strategies imported yet. Run seed or Import from Agents/API.
            </div>
          ) : (
            rows.map((r) => {
              const missing = JSON.parse(r.missingFieldsJson || "[]") as string[];
              return (
                <article key={r.id} className="panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="display text-xl font-semibold">{r.title}</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {r.businessSlug} · {r.sourceFile || "manual"}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        r.status === "approved"
                          ? "ok"
                          : r.status === "rejected"
                            ? "danger"
                            : "warn"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {missing.length ? (
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      Missing from source (not invented): {missing.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--ok)]">
                      All template fields present in source extract.
                    </p>
                  )}
                  {session.role === "admin" && r.status === "pending_review" ? (
                    <StrategyActions strategyId={r.id} />
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </Shell>
  );
}
