import { redirect } from "next/navigation";
import { listIntegrations } from "@/integrations";
import { Shell } from "@/components/Shell";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const integrations = listIntegrations();

  return (
    <Shell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="display text-3xl font-semibold">Integrations</h1>
          <p className="mt-1 text-[var(--muted)]">
            Prefer execute-capable connectors. Stubs document exact setup when credentials are missing.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((i) => (
            <div key={i.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{i.name}</h2>
                <span className={`badge ${i.configured ? "ok" : "warn"}`}>
                  {i.mode}
                  {i.configured ? " · live" : " · needs setup"}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">{i.setup}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
