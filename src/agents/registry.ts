export type AgentId =
  | "coo"
  | "usaraki"
  | "blossompot"
  | "spicycenter"
  | "occasionfun"
  | "halloweenready";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  businessSlug?: string;
  role: string;
  primary?: boolean;
  archived?: boolean;
  canAutonomously: string[];
  requiresApproval: string[];
};

export const AGENTS: AgentDefinition[] = [
  {
    id: "coo",
    name: "DGV AI COO",
    role: "Central operating officer across primary businesses",
    canAutonomously: [
      "prioritize-tasks",
      "capacity-analysis",
      "risk-scan",
      "daily-briefing",
      "create-tasks",
      "draft-reports",
      "recommend-reassignments",
      "ai-execution",
    ],
    requiresApproval: [
      "spend-money",
      "ad-budget-increase",
      "production-deploy",
      "bulk-customer-comms",
      "major-pricing",
      "mydgv-hr-mutations",
    ],
  },
  {
    id: "usaraki",
    name: "UsaRakhi Growth Agent",
    businessSlug: "usaraki",
    primary: true,
    role: "Growth, product research, ads, SEO for UsaRakhi.com",
    canAutonomously: [
      "product-research",
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
    primary: true,
    role: "Growth, conversion, corporate gifting, reminders for Blossompot.com",
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
    primary: true,
    role: "B2B buyer acquisition, sourcing desk, export coordination for SpicyCenter.com",
    canAutonomously: [
      "market-research",
      "outreach-briefs",
      "content-drafts",
      "experiment-design",
      "kpi-review",
    ],
    requiresApproval: ["ad-spend", "pricing", "production-deploy"],
  },
  {
    id: "occasionfun",
    name: "OccasionFun Growth Agent",
    businessSlug: "occasionfun",
    primary: true,
    role: "UK BD, tenders, partner pipeline for OccasionFun.co.uk",
    canAutonomously: [
      "bd-research",
      "proposal-drafts",
      "case-study-drafts",
      "tender-fit-analysis",
      "kpi-review",
    ],
    requiresApproval: ["tender-submission", "pricing", "production-deploy", "client-comms"],
  },
  {
    id: "halloweenready",
    name: "HalloweenReady Growth Agent (archived)",
    businessSlug: "halloweenready",
    primary: false,
    archived: true,
    role: "Seasonal agent retained; not in daily primary COO focus",
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

export function primaryGrowthAgentIds(): Exclude<AgentId, "coo" | "halloweenready">[] {
  return ["usaraki", "blossompot", "spicycenter", "occasionfun"];
}
