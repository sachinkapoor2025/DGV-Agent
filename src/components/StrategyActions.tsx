"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StrategyActions({ strategyId }: { strategyId?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function importRaw() {
    setBusy(true);
    const res = await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import_raw_plans" }),
    });
    const json = await res.json();
    setBusy(false);
    setMsg(JSON.stringify(json, null, 2));
    router.refresh();
  }

  async function review(decision: "approved" | "rejected") {
    if (!strategyId) return;
    setBusy(true);
    await fetch(`/api/strategies/${strategyId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusy(false);
    router.refresh();
  }

  if (strategyId) {
    return (
      <div className="mt-3 flex gap-2">
        <button className="btn primary" disabled={busy} onClick={() => review("approved")}>
          Approve
        </button>
        <button className="btn" disabled={busy} onClick={() => review("rejected")}>
          Reject
        </button>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <button className="btn primary" disabled={busy} onClick={importRaw}>
        Import plan texts from data/strategy-imports/raw
      </button>
      {msg ? (
        <pre className="mt-3 max-h-40 overflow-auto text-xs text-[var(--muted)]">{msg}</pre>
      ) : null}
    </div>
  );
}
