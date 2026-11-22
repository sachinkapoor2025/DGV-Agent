"use client";

import { useState } from "react";

export function RunAgentsPanel() {
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(agent: string, kind?: string) {
    setBusy(true);
    setLog("Running…");
    const res = await fetch("/api/agents/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent, kind }),
    });
    const json = await res.json();
    setBusy(false);
    setLog(JSON.stringify(json, null, 2));
  }

  return (
    <section className="panel p-5">
      <h2 className="display text-xl font-semibold">Dispatch</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn primary" disabled={busy} onClick={() => run("coo", "morning")}>
          COO morning
        </button>
        <button className="btn" disabled={busy} onClick={() => run("coo", "midday")}>
          COO midday
        </button>
        <button className="btn" disabled={busy} onClick={() => run("coo", "evening")}>
          COO evening
        </button>
        <button className="btn" disabled={busy} onClick={() => run("coo", "weekly")}>
          Weekly review
        </button>
        <button className="btn" disabled={busy} onClick={() => run("all-growth")}>
          All growth agents
        </button>
      </div>
      {log ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-[var(--muted)]">
          {log}
        </pre>
      ) : null}
    </section>
  );
}
