/**
 * DGV primary portfolio + archived businesses.
 * Primary four: UsaRakhi, Blossompot, SpicyCenter, OccasionFun.
 * HalloweenReady retained as archived (not deleted).
 *
 * Strategy content is imported from approved plans — not invented here.
 * See data/strategy-imports/ and src/lib/strategy/
 */

export type BusinessSeed = {
  id: string;
  slug: string;
  name: string;
  website?: string;
  mission: string;
  goals: string[];
  kpis: { primary: string[]; secondary: string[] };
  primary: boolean;
  archived: boolean;
};

export const BUSINESS_SEED: BusinessSeed[] = [
  {
    id: "biz_usaraki",
    slug: "usaraki",
    name: "UsaRakhi",
    website: "https://usaraki.com",
    mission:
      "Expand from seasonal Rakhi into curated Indian gifting, personalized gifting and Indian-inspired home/lifestyle for USA delivery — evidence-based product expansion.",
    goals: [
      "Validate personalized/POD and Indian-inspired décor launches",
      "Protect USA fulfillment trust (delivery promise)",
      "Execute 45-day sales playbook from approved strategy",
    ],
    kpis: {
      primary: ["revenue", "orders", "cvr", "ad_test_learnings"],
      secondary: ["aov", "organic_sessions", "new_sku_validation"],
    },
    primary: true,
    archived: false,
  },
  {
    id: "biz_blossompot",
    slug: "blossompot",
    name: "Blossompot",
    website: "https://blossompot.com",
    mission:
      "USA gifting destination that helps customers remember occasions, choose gifts quickly and send with confidence — 30-day sales sprint focus.",
    goals: [
      "Focus hero assortment (30–50 products) by occasion/budget",
      "Drive reminder-to-purchase and corporate gifting engines",
      "Improve conversion proof and delivery clarity",
    ],
    kpis: {
      primary: ["revenue", "orders", "cvr", "reminder_signups"],
      secondary: ["corporate_enquiries", "repeat_rate", "cac"],
    },
    primary: true,
    archived: false,
  },
  {
    id: "biz_spicycenter",
    slug: "spicycenter",
    name: "SpicyCenter",
    website: "https://spicycenter.com",
    mission:
      "Buyer-generating India spice sourcing/export business — wholesale, sourcing desk and private label without speculative inventory.",
    goals: [
      "Close profitable repeatable B2B orders in 90 days",
      "Focus UK, UAE/GCC, Canada outreach",
      "Fix trust proof and enquiry-to-quote workflow",
    ],
    kpis: {
      primary: ["qualified_enquiries", "quotes_sent", "orders_won", "repeat_orders"],
      secondary: ["sample_requests", "response_time", "markets_active"],
    },
    primary: true,
    archived: false,
  },
  {
    id: "biz_occasionfun",
    slug: "occasionfun",
    name: "OccasionFun",
    website: "https://occasionfun.co.uk",
    mission:
      "UK-facing technology partner: client engagement, requirements, bidding and delivery coordination — with DGV as specialist engineering delivery partner where approved.",
    goals: [
      "Create conversations in Week 1; proposals Weeks 2–3; pipeline by Day 30",
      "Lead with focused offers (Cloud/DevOps, API squad, QA, data, AI PoV)",
      "Build tender/framework readiness without overselling certifications",
    ],
    kpis: {
      primary: ["conversations", "qualified_opportunities", "proposals", "paid_engagements"],
      secondary: ["partner_intros", "tender_submissions", "case_studies_published"],
    },
    primary: true,
    archived: false,
  },
  {
    id: "biz_halloweenready",
    slug: "halloweenready",
    name: "HalloweenReady",
    website: "https://halloweenready.com",
    mission:
      "Seasonal Halloween ecommerce (archived from primary OS portfolio — retained for historical/seasonal reactivation).",
    goals: [
      "Preserve playbooks for next seasonal window",
      "Do not prioritize in daily COO focus unless reactivated",
    ],
    kpis: {
      primary: ["revenue", "orders", "ad_roas", "cvr"],
      secondary: ["sell_through", "organic_sessions", "returns"],
    },
    primary: false,
    archived: true,
  },
];

export const PRIMARY_BUSINESS_SLUGS = BUSINESS_SEED.filter((b) => b.primary && !b.archived).map(
  (b) => b.slug,
);

export const TEAM_SEED = [
  {
    id: "tm_divit",
    name: "Divit",
    email: "divit@dgv.local",
    role: "Founder / Approver",
    skills: ["strategy", "approvals", "growth", "product"],
    weeklyCapacityHours: 20,
  },
  {
    id: "tm_ops",
    name: "Ops Lead",
    email: "ops@dgv.local",
    role: "Operations",
    skills: ["ops", "vendor", "fulfillment", "project-management"],
    weeklyCapacityHours: 40,
  },
  {
    id: "tm_marketing",
    name: "Marketing Lead",
    email: "marketing@dgv.local",
    role: "Marketing",
    skills: ["seo", "content", "ads", "email"],
    weeklyCapacityHours: 40,
  },
  {
    id: "tm_dev",
    name: "Engineering",
    email: "eng@dgv.local",
    role: "Engineering",
    skills: ["web", "shopify", "qa", "automation"],
    weeklyCapacityHours: 40,
  },
  {
    id: "tm_ai",
    name: "AI Execution Pod",
    email: "ai@dgv.local",
    role: "AI Agent Workforce",
    skills: ["research", "seo", "content", "analysis", "coding", "reporting"],
    weeklyCapacityHours: 80,
  },
] as const;
