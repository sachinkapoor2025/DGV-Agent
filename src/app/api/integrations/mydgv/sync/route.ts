import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { probeMydgvAdmin, isMydgvCognitoConfigured } from "@/integrations/mydgv/cognito-admin";
import { isMydgvConfigured } from "@/integrations/mydgv/client";
import { syncEmployeesFromMydgv } from "@/lib/sync/mydgv-employees";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    apiKeyConfigured: isMydgvConfigured(),
    cognitoConfigured: isMydgvCognitoConfigured(),
    preferred: isMydgvConfigured() ? "api_key" : "cognito_admin",
    note:
      "MyDGV has no native blockers API; capacity is derived from open tasks. Prefer API key after deploying feature/dgv-ai-os-integration.",
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { action?: string };

  if (body.action === "probe") {
    if (!isMydgvCognitoConfigured() && !isMydgvConfigured()) {
      return NextResponse.json(
        { error: "Configure MYDGV_DGV_OS_API_KEY or MYDGV_ADMIN_EMAIL/PASSWORD in .env.local" },
        { status: 400 },
      );
    }
    if (isMydgvCognitoConfigured()) {
      try {
        const probe = await probeMydgvAdmin();
        return NextResponse.json({ ok: true, via: "cognito", probe });
      } catch (e) {
        return NextResponse.json(
          { ok: false, error: e instanceof Error ? e.message : "probe failed" },
          { status: 502 },
        );
      }
    }
    return NextResponse.json({ ok: true, via: "api_key", note: "Use employee sync for full check" });
  }

  try {
    const result = await syncEmployeesFromMydgv(session.email);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "sync failed" },
      { status: 502 },
    );
  }
}
