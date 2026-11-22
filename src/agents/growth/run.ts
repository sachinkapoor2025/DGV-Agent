import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { AGENTS, primaryGrowthAgentIds, type AgentId } from "@/agents/registry";
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
    project: "SpicyCenter 90-day buyer acquisition",
    experiments: [
      {
        title: "UK/UAE/Canada buyer outreach list design",
        outcome:
          "Produce segment lists and messaging angles for grocers, importers and food-service buyers.",
        ai: true,
      },
      {
        title: "Enquiry-to-quote workflow checklist",
        outcome:
          "Document assignment, SLA, quote pack and follow-up steps for wholesale enquiries.",
        ai: true,
      },
      {
        title: "Trust-proof content brief (company profile + sample process)",
        outcome:
          "Draft company-profile outline, sample process and response-time promise for site.",
        ai: true,
      },
    ],
  },
  occasionfun: {
    project: "OccasionFun 30-day BD & tender pipeline",
    experiments: [
      {
        title: "Priority offer one-pagers (5 offers)",
        outcome:
          "Draft Cloud/DevOps, API squad, QA, data and AI PoV one-pagers with entry deliverables.",
        ai: true,
      },
      {
        title: "Case study evidence cards (4–6)",
        outcome:
          "Create evidence-rich project cards from approved internal outcomes (no invented clients).",
        ai: true,
      },
      {
        title: "Week-1 outreach target list + partner intro script",
        outcome:
          "List UK SME/agency/MSP targets and a partner intro script for subcontracting conversations.",
        ai: true,
      },
    ],
  },
  halloweenready: {
    project: "HalloweenReady archived seasonal engine",
    experiments: [
      {
        title: "Archive: preserve seasonal playbook index",
        outcome:
          "Index prior seasonal assets for reactivation; do not prioritize in daily COO focus.",
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
  return primaryGrowthAgentIds().map((id) => ({
    agentId: id,
    ...runGrowthAgent(id),
  }));
}
