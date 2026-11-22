import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  await clearSession();
  if (session) audit(session.email, "auth.logout", "session");
  return NextResponse.json({ ok: true });
}
