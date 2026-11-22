import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";
import { db, ensureSchema } from "@/lib/db/client";
import { businesses } from "@/lib/db/schema";
import { listTasks } from "@/lib/tasks/service";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  ensureSchema();
  const tasks = listTasks(200);
  const biz = Object.fromEntries(
    db
      .select()
      .from(businesses)
      .all()
      .map((b) => [b.id, b.name]),
  );

  return (
    <Shell user={session}>
      <div className="space-y-4">
        <h1 className="display text-3xl font-semibold">Task system</h1>
        <p className="text-[var(--muted)]">
          Centralized work across all four businesses. Deadlines never change silently.
        </p>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--line)] text-[var(--muted)]">
              <tr>
                <th className="p-3 font-medium">Task</th>
                <th className="p-3 font-medium">Business</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Score</th>
                <th className="p-3 font-medium">Deadline</th>
                <th className="p-3 font-medium">AI</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-[var(--line)] align-top">
                  <td className="p-3">
                    <div className="font-medium">{t.title}</div>
                    <div className="mt-1 max-w-md text-[var(--muted)]">
                      {t.expectedOutcome}
                    </div>
                  </td>
                  <td className="p-3">{biz[t.businessId] ?? t.businessId}</td>
                  <td className="p-3">
                    <span className="badge">{t.status}</span>
                  </td>
                  <td className="p-3">{t.score}</td>
                  <td className="p-3">{t.deadline ?? "—"}</td>
                  <td className="p-3">{t.executableByAi ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
