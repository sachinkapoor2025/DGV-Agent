"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("divit@dgv.local");
  const [password, setPassword] = useState("dgv-admin-change-me");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHint("First sign-in can take up to a minute while Next.js compiles…");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90_000);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        setError("Invalid credentials");
        setLoading(false);
        setHint("");
        return;
      }
      setHint("Signed in — loading dashboard…");
      window.location.href = "/dashboard";
    } catch (err) {
      clearTimeout(timer);
      setLoading(false);
      setHint("");
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Sign-in timed out. Wait for Compiling to finish, then try again."
          : "Sign-in failed. Check the server is running on this port.",
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="panel rise p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Divit Global Ventures
        </p>
        <h1 className="display mt-2 text-4xl font-semibold">DGV OS</h1>
        <p className="mt-2 text-[var(--muted)]">
          Sign in to the AI COO operating system.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {hint ? <p className="text-sm text-[var(--muted)]">{hint}</p> : null}
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <button className="btn primary w-full" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Enter OS"}
          </button>
        </form>
      </div>
    </div>
  );
}
