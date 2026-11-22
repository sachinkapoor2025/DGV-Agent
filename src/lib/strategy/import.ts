import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { audit } from "@/lib/audit";
import { db, ensureSchema, sqlite } from "@/lib/db/client";
import { strategies } from "@/lib/db/schema";
import {
  StrategyDocumentSchema,
  type StrategyDocument,
} from "@/lib/strategy/schema";

function sectionAfter(text: string, headings: string[], max = 1200): string | undefined {
  const lower = text.toLowerCase();
  for (const h of headings) {
    const i = lower.indexOf(h.toLowerCase());
    if (i >= 0) {
      const slice = text.slice(i, i + max).replace(/\s+/g, " ").trim();
      if (slice.length > 40) return slice;
    }
  }
  return undefined;
}

function bulletsNear(text: string, headings: string[], limit = 8): string[] {
  const block = sectionAfter(text, headings, 2500);
  if (!block) return [];
  const lines = block
    .split(/(?<=[.!?])\s+|\n||•|- /)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220);
  return [...new Set(lines)].slice(0, limit);
}

function computeMissing(doc: StrategyDocument): string[] {
  const requiredKeys: Array<keyof StrategyDocument> = [
    "profile",
    "existingPosition",
    "strategicObjectives",
    "growthStrategy",
    "revenueOpportunities",
    "marketingStrategy",
    "seoStrategy",
    "productStrategy",
    "competitorResearch",
    "advertisingStrategy",
    "executionRoadmap",
    "dailyActivities",
    "weeklyMilestones",
    "kpis",
    "deadlines",
    "dependencies",
    "risks",
    "expectedOutcomes",
  ];
  const missing: string[] = [];
  for (const k of requiredKeys) {
    const v = doc[k];
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) missing.push(k);
  }
  return missing;
}

/** Extract only what is clearly present in plan text — no invention. */
export function extractStrategyFromPlanText(input: {
  businessSlug: string;
  title: string;
  sourceFile: string;
  text: string;
}): StrategyDocument {
  const text = input.text;
  const draft: StrategyDocument = StrategyDocumentSchema.parse({
    businessSlug: input.businessSlug,
    title: input.title,
    sourceFile: input.sourceFile,
    sourceFormat: "pdf_text",
    status: "pending_review",
    profile: sectionAfter(text, ["Mission:", "Core positioning:", "Core decision:", "Executive strategy", "Executive recommendation"]),
    existingPosition: sectionAfter(text, [
      "Website audit",
      "current assets",
      "Why UsaRakhi is positioned",
      "Website and positioning audit",
      "what you already have",
    ]),
    strategicObjectives: bulletsNear(text, ["Primary outcome", "Mission:", "Recommended priority offers", "The winning product thesis"]),
    growthStrategy: sectionAfter(text, ["Executive strategy", "Executive recommendation", "growth plan", "sales sprint"]),
    revenueOpportunities: bulletsNear(text, ["Revenue engines", "Revenue paths", "Three revenue engines"]),
    marketingStrategy: sectionAfter(text, ["Marketing", "outreach", "buyer acquisition", "client acquisition"]),
    seoStrategy: sectionAfter(text, ["SEO", "organic", "keyword"]),
    productStrategy: sectionAfter(text, ["Product strategy", "Product-category ranking", "Focus markets and products", "product shortlist"]),
    competitorResearch: sectionAfter(text, ["Competitor", "competitive"]),
    advertisingStrategy: sectionAfter(text, ["Advertising", "ad tests", "paid"]),
    executionRoadmap: bulletsNear(text, ["45-Day", "30-Day", "90-Day", "Execution", "Week 1", "roadmap"]),
    dailyActivities: bulletsNear(text, ["Daily", "daily execution", "Day 1"]),
    weeklyMilestones: bulletsNear(text, ["Week 1", "Week 2", "weekly", "milestone"]),
    kpis: bulletsNear(text, ["KPI", "metrics", "measurable", "Primary outcome"]),
    deadlines: bulletsNear(text, ["Day 30", "45-Day", "90 days", "deadline", "by Day"]),
    dependencies: bulletsNear(text, ["Depend", "requires", "supplier", "partner"]),
    risks: bulletsNear(text, ["Risk", "Important reality", "Do not", "Critical gaps"]),
    expectedOutcomes: bulletsNear(text, ["Primary outcome", "goal is", "controllable goals", "prove"]),
    rawExcerpt: text.slice(0, 4000),
  });
  draft.missingFields = computeMissing(draft);
  return draft;
}

export function saveStrategyDraft(doc: StrategyDocument, actor = "system") {
  ensureSchema();
  const parsed = StrategyDocumentSchema.parse(doc);
  const id = nanoid();
  db.insert(strategies)
    .values({
      id,
      businessSlug: parsed.businessSlug,
      title: parsed.title,
      status: parsed.status,
      sourceFile: parsed.sourceFile ?? null,
      sourceFormat: parsed.sourceFormat,
      payloadJson: JSON.stringify(parsed),
      missingFieldsJson: JSON.stringify(parsed.missingFields),
    })
    .run();
  audit(actor, "strategy.import_draft", "strategy", id, {
    businessSlug: parsed.businessSlug,
    missing: parsed.missingFields,
  });
  return { id, ...parsed };
}

export function listStrategies(status?: string) {
  ensureSchema();
  const rows = db.select().from(strategies).all();
  return status ? rows.filter((r) => r.status === status) : rows;
}

export function reviewStrategy(
  id: string,
  decision: "approved" | "rejected",
  reviewer: string,
) {
  ensureSchema();
  const row = db.select().from(strategies).where(eq(strategies.id, id)).get();
  if (!row) throw new Error("Strategy not found");
  const payload = JSON.parse(row.payloadJson) as StrategyDocument;
  payload.status = decision;
  payload.reviewedBy = reviewer;
  payload.reviewedAt = new Date().toISOString();
  // Explicit better-sqlite3 write — drizzle update was not persisting reliably here.
  const result = sqlite
    .prepare(
      `UPDATE strategies
       SET status = ?, payload_json = ?, reviewed_by = ?, reviewed_at = ?
       WHERE id = ?`,
    )
    .run(
      decision,
      JSON.stringify(payload),
      reviewer,
      payload.reviewedAt,
      id,
    );
  if (!result.changes) {
    throw new Error(`Strategy update failed for id=${id}`);
  }
  try {
    sqlite.pragma("wal_checkpoint(TRUNCATE)");
  } catch {
    /* ignore */
  }
  audit(reviewer, `strategy.${decision}`, "strategy", id);
  return payload;
}

export function importPlansFromRawDir(
  rawDir = path.join(process.cwd(), "data/strategy-imports/raw"),
) {
  const mapping: Array<{ file: string; slug: string; title: string }> = [
    {
      file: "UsaRakhi_Product_Research_and_45_Day_Execution_Playbook.txt",
      slug: "usaraki",
      title: "UsaRakhi Product Research & 45-Day Execution Playbook",
    },
    {
      file: "BlossomPot_30_Day_Business_Growth_Plan.txt",
      slug: "blossompot",
      title: "BlossomPot 30-Day Business Growth Plan",
    },
    {
      file: "SpicyCenter_90_Day_Business_Growth_Plan.txt",
      slug: "spicycenter",
      title: "SpicyCenter 90-Day Business Growth Plan",
    },
    {
      file: "OccasionFun_30_Day_Business_Growth_and_Tender_Winning_Plan.txt",
      slug: "occasionfun",
      title: "OccasionFun 30-Day Growth & Tender-Winning Plan",
    },
  ];

  const created = [];
  for (const m of mapping) {
    const full = path.join(rawDir, m.file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    const doc = extractStrategyFromPlanText({
      businessSlug: m.slug,
      title: m.title,
      sourceFile: m.file,
      text,
    });
    created.push(saveStrategyDraft(doc, "import:pdf"));
  }
  return created;
}
