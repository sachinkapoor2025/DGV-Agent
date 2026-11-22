import { NextResponse } from "next/server";
import { setSession, verifyLogin } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const user = verifyLogin(body.email || "", body.password || "");
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession(user);
  // Audit/DB init after cookie is set so first-compile login is not blocked by SQLite.
  try {
    const { ensureSchema } = await import("@/lib/db/client");
    const { audit } = await import("@/lib/audit");
    ensureSchema();
    audit(user.email, "auth.login", "session");
  } catch {
    /* non-fatal */
  }
  return NextResponse.json({ ok: true, user });
}
