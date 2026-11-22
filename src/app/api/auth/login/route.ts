import { NextResponse } from "next/server";
import { setSession, verifyLogin } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { ensureSchema } from "@/lib/db/client";

export async function POST(req: Request) {
  ensureSchema();
  const body = (await req.json()) as { email?: string; password?: string };
  const user = verifyLogin(body.email || "", body.password || "");
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession(user);
  audit(user.email, "auth.login", "session");
  return NextResponse.json({ ok: true, user });
}
