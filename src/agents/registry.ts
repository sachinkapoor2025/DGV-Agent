export type AgentId =
  | "coo"
  | "usaraki"
  | "blossompot"
  | "spicycenter"
  | "halloweenready";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  businessSlug?: string;
  role: string;
  canAutonomously: string[];
  requiresApproval: string[];
};

export const AGENTS: AgentDefinition[] = [
  {
    id: "coo",
    name: "DGV AI COO",
    role: "Central operating officer across all businesses",
    canAutonomously: [
      "prioritize-tasks",
      "capacity-analysis",
      "risk-scan",
      "daily-briefing",
      "create-tasks",
      "draft-reports",
      "recommend-reassignments",
    ],
    requiresApproval: [
      "spend-money",
      "ad-budget-increase",
      "production-deploy",
      "bulk-customer-comms",
      "major-pricing",
    ],
  },
  {
    id: "usaraki",
    name: "UsaRakhi Growth Agent",
    businessSlug: "usaraki",
    role: "Growth, SEO, ads, conversion, content for UsaRakhi",
    canAutonomously: [
      "seo-research",
      "competitor-research",
      "content-drafts",
      "experiment-design",
      "kpi-review",
    ],
    requiresApproval: ["ad-spend", "pricing", "production-deploy"],
  },
  {
    id: "blossompot",
    name: "Blossompot Growth Agent",
    businessSlug: "blossompot",
    role: "Growth, SEO, product research, ads for Blossompot",
    canAutonomously: [
      "product-research",
      "seo-research",
      "content-drafts",
      "experiment-design",
      "kpi-review",
    ],
    requiresApproval: ["ad-spend", "pricing", "production-deploy"],
  },
  {
    id: "spicycenter",
    name: "SpicyCenter Growth Agent",
    businessSlug: "spicycenter",
    role: "Growth, SEO, catalog content, retention for SpicyCenter",
    canAutonomously: [
      "seo-research",
      "content-drafts",
      "catalog-briefs",
      "experiment-design",
      "kpi-review",
    ],
    requiresApproval: ["ad-spend", "pricing", "production-deploy"],
  },
  {
    id: "halloweenready",
    name: "HalloweenReady Growth Agent",
    businessSlug: "halloweenready",
    role: "Seasonal growth, ads, assortment timing for HalloweenReady",
    canAutonomously: [
      "seasonal-planning",
      "competitor-research",
      "ad-test-design",
      "content-drafts",
      "kpi-review",
    ],
    requiresApproval: ["ad-spend", "pricing", "production-deploy"],
  },
];

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id);
}
