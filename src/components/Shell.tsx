import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import type { SessionUser } from "@/lib/auth/session";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/team", label: "Team" },
  { href: "/agents", label: "Agents" },
  { href: "/strategies", label: "Strategies" },
  { href: "/reports", label: "Reports" },
  { href: "/integrations", label: "Integrations" },
];

export function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_80%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/dashboard"
            className="display text-xl font-semibold tracking-tight"
          >
            DGV <span className="text-[var(--accent)]">OS</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <span>
              {user.name} · {user.role}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
