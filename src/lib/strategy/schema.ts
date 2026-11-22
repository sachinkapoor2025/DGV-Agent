import { z } from "zod";

/** Structured strategy document — only populate fields present in source plans. */
export const StrategyDocumentSchema = z.object({
  businessSlug: z.string().min(1),
  title: z.string().min(1),
  sourceFile: z.string().optional(),
  sourceFormat: z.enum(["markdown", "json", "csv", "pdf_text", "docx_text"]).default("pdf_text"),
  status: z.enum(["draft", "pending_review", "approved", "rejected"]).default("pending_review"),
  profile: z.string().optional(),
  existingPosition: z.string().optional(),
  strategicObjectives: z.array(z.string()).default([]),
  growthStrategy: z.string().optional(),
  revenueOpportunities: z.array(z.string()).default([]),
  marketingStrategy: z.string().optional(),
  seoStrategy: z.string().optional(),
  productStrategy: z.string().optional(),
  competitorResearch: z.string().optional(),
  advertisingStrategy: z.string().optional(),
  executionRoadmap: z.array(z.string()).default([]),
  dailyActivities: z.array(z.string()).default([]),
  weeklyMilestones: z.array(z.string()).default([]),
  kpis: z.array(z.string()).default([]),
  deadlines: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  expectedOutcomes: z.array(z.string()).default([]),
  rawExcerpt: z.string().optional(),
  missingFields: z.array(z.string()).default([]),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export type StrategyDocument = z.infer<typeof StrategyDocumentSchema>;

export const STRATEGY_TEMPLATE_MARKDOWN = `# Strategy Import Template

businessSlug: usaraki | blossompot | spicycenter | occasionfun
title:
sourceFile:

## Profile
## Existing position
## Strategic objectives
- 
## Growth strategy
## Revenue opportunities
- 
## Marketing strategy
## SEO strategy
## Product strategy
## Competitor research
## Advertising strategy
## Execution roadmap
- 
## Daily activities
- 
## Weekly milestones
- 
## KPIs
- 
## Deadlines
- 
## Dependencies
- 
## Risks
- 
## Expected outcomes
-

Only fill sections present in your source plan. Leave others empty — do not invent.
`;
