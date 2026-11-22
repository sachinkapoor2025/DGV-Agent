import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";
import { db, ensureSchema } from "@/lib/db/client";
import { reports } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  ensureSchema();
  const rows = db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(20)
    .all();

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <h1 className="display text-3xl font-semibold">Reports</h1>
        <p className="text-[var(--muted)]">
          Morning / midday / evening briefings and Friday weekly business reviews.
        </p>
        {rows.length === 0 ? (
          <div className="panel p-5 text-[var(--muted)]">
            No reports yet. Seed the DB or run the COO from Agents.
          </div>
        ) : (
          rows.map((r) => (
            <article key={r.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="display text-xl font-semibold">{r.title}</h2>
                <span className="badge">{r.kind}</span>
              </div>
              <pre className="mt-4 whitespace-pre-wrap font-[var(--font-body)] text-sm leading-relaxed text-[var(--muted)]">
                {r.bodyMarkdown}
              </pre>
            </article>
          ))
        )}
      </div>
    </Shell>
  );
}
