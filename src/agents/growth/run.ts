import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { AGENTS, type AgentId } from "@/agents/registry";
import { db, ensureSchema } from "@/lib/db/client";
import {
  agentRuns,
  businesses,
  tasks,
} from "@/lib/db/schema";
import { priorityFromScore, scoreTask } from "@/lib/scoring/priority";

const GROWTH_PLAYBOOK: Record<
  Exclude<AgentId, "coo">,
  { project: string; experiments: Array<{ title: string; outcome: string; ai: boolean }> }
> = {
  usaraki: {
    project: "UsaRakhi Q growth sprint",
    experiments: [
      {
        title: "Keyword gap: rakhi gift USA high-intent clusters",
        outcome:
          "Deliver ranked keyword list (50+) with intent, volume proxy, and page mapping recommendations.",
        ai: true,
      },
      {
        title: "PDP conversion audit for top 10 SKUs",
        outcome:
          "Ship audit report with 5 prioritized CRO fixes tied to CVR lift hypotheses.",
        ai: true,
      },
      {
        title: "Seasonal campaign brief (Raksha Bandhan)",
        outcome:
          "Produce channel plan (SEO/email/ads) with messaging, creatives outline, and KPI targets.",
        ai: true,
      },
    ],
  },
  blossompot: {
    project: "Blossompot demand expansion",
    experiments: [
      {
        title: "Product research: occasion bouquet demand validation",
        outcome:
          "Recommend 8 products with demand signals, margin notes, and go/no-go.",
        ai: true,
      },
      {
        title: "Local + occasion SEO content outline set",
        outcome:
          "Create 12 content briefs mapped to target keywords and internal links.",
        ai: true,
      },
      {
        title: "CAC efficiency review of paid funnel",
        outcome:
          "Identify waste spend patterns and 3 test proposals (approval required before budget change).",
        ai: true,
      },
    ],
  },
  spicycenter: {
    project: "SpicyCenter retention + SEO",
    experiments: [
      {
        title: "Category SEO coverage map",
        outcome:
          "Map missing category/landing pages vs competitor clusters with priority scores.",
        ai: true,
      },
      {
        title: "Bulk product description quality pass (pilot 25 SKUs)",
        outcome:
          "Rewrite 25 PDP descriptions with benefits, usage, and SEO entities; ready for review.",
        ai: true,
      },
      {
        title: "Repeat purchase loop design",
        outcome:
          "Draft retention playbook: triggers, offers, email sequence, success metrics.",
        ai: true,
      },
    ],
  },
  halloweenready: {
    project: "HalloweenReady seasonal engine",
    experiments: [
      {
        title: "Pre-season assortment readiness checklist",
        outcome:
          "Publish SKU readiness matrix (content, images, ads, stock) with owners and dates.",
        ai: true,
      },
      {
        title: "Competitor ads & creative teardown",
        outcome:
          "Document competitor angles, offers, and 5 testable creative hypotheses.",
        ai: true,
      },
      {
        title: "CVR sprint plan for peak window",
        outcome:
          "Prioritized CRO backlog for homepage/collection/PDP with expected impact.",
        ai: true,
      },
    ],
  },
};

export function runGrowthAgent(agentId: Exclude<AgentId, "coo">) {
  ensureSchema();
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent?.businessSlug) {
    throw new Error(`Unknown growth agent: ${agentId}`);
  }

  const business = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, agent.businessSlug))
    .get();

  if (!business) {
    throw new Error(`Business not seeded for ${agent.businessSlug}`);
  }

  const playbook = GROWTH_PLAYBOOK[agentId];
  const created: string[] = [];
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  for (const exp of playbook.experiments) {
    const existing = db
      .select()
      .from(tasks)
      .where(and(eq(tasks.businessId, business.id), eq(tasks.title, exp.title)))
      .get();
    if (existing) continue;

    const scoring = {
      revenuePotential: agentId === "halloweenready" ? 70 : 55,
      businessImpact: 4,
      urgency: 4,
      strategicImportance: 4,
      confidence: 0.75,
      effort: 2,
    };
    const score = scoreTask(scoring);
    const id = nanoid();

    db.insert(tasks)
      .values({
        id,
        businessId: business.id,
        project: playbook.project,
        title: exp.title,
        expectedOutcome: exp.outcome,
        ownerId: "tm_ai",
        priority: priorityFromScore(score),
        status: "ready",
        startDate: inDays(0),
        deadline: inDays(7),
        eta: inDays(5),
        estimatedHours: 4,
        kpiImpact: "growth_experiment",
        revenuePotential: scoring.revenuePotential,
        businessImpact: scoring.businessImpact,
        urgency: scoring.urgency,
        strategicImportance: scoring.strategicImportance,
        confidence: scoring.confidence,
        effort: scoring.effort,
        score,
        executableByAi: exp.ai,
        createdByAgent: agentId,
      })
      .run();
    created.push(id);
  }

  const open = db
    .select()
    .from(tasks)
    .where(eq(tasks.businessId, business.id))
    .orderBy(desc(tasks.score))
    .all()
    .filter((t) => t.status !== "completed")
    .slice(0, 5);

  const recommendations = [
    `Focus ${business.name} on: ${open[0]?.title ?? "seed growth tasks"}`,
    "Prefer AI-executable research/content before human ad spend.",
    "Escalate any pricing/ad budget changes for Divit approval.",
  ];

  const runId = nanoid();
  db.insert(agentRuns)
    .values({
      id: runId,
      agentId,
      businessId: business.id,
      kind: "growth-cycle",
      inputJson: JSON.stringify({ agentId }),
      outputJson: JSON.stringify({ created, recommendations, top: open.map((t) => t.id) }),
      status: "completed",
    })
    .run();

  return { runId, created, recommendations, topTasks: open };
}

export function runAllGrowthAgents() {
  return (["usaraki", "blossompot", "spicycenter", "halloweenready"] as const).map(
    (id) => ({ agentId: id, ...runGrowthAgent(id) }),
  );
}
