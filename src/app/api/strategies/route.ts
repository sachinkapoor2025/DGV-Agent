import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  importPlansFromRawDir,
  listStrategies,
  saveStrategyDraft,
} from "@/lib/strategy/import";
import { StrategyDocumentSchema } from "@/lib/strategy/schema";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ strategies: listStrategies() });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body.action === "import_raw_plans") {
    const created = importPlansFromRawDir();
    return NextResponse.json({
      ok: true,
      imported: created.length,
      strategies: created.map((s) => ({
        id: s.id,
        businessSlug: s.businessSlug,
        status: s.status,
        missingFields: s.missingFields,
      })),
      note: "Imported as pending_review — approve before COO treats as active strategy.",
    });
  }
  try {
    const doc = StrategyDocumentSchema.parse({ ...body, status: "pending_review" });
    const saved = saveStrategyDraft(doc, session.email);
    return NextResponse.json({ strategy: saved }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid strategy" },
      { status: 400 },
    );
  }
}
