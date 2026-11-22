/**
 * Foundation business profiles for DGV.
 * Replace/extend goals & KPIs with Divit's ChatGPT growth plans when provided.
 */
export const BUSINESS_SEED = [
  {
    id: "biz_usaraki",
    slug: "usaraki",
    name: "UsaRakhi",
    mission:
      "Grow USA/Canada rakhi & festive gifting ecommerce with SEO, conversion, and seasonal campaigns.",
    goals: [
      "Increase organic traffic for high-intent rakhi keywords",
      "Improve conversion rate on PDP and cart",
      "Build repeatable seasonal playbooks",
    ],
    kpis: {
      primary: ["revenue", "orders", "organic_sessions", "cvr"],
      secondary: ["aov", "email_list", "ad_roas"],
    },
  },
  {
    id: "biz_blossompot",
    slug: "blossompot",
    name: "Blossompot",
    mission:
      "Scale flower/gift ecommerce with product research, SEO content, and paid acquisition efficiency.",
    goals: [
      "Expand catalog with validated demand products",
      "Strengthen local + occasion SEO",
      "Reduce CAC while protecting margin",
    ],
    kpis: {
      primary: ["revenue", "orders", "organic_sessions", "cac"],
      secondary: ["margin", "repeat_rate", "ad_roas"],
    },
  },
  {
    id: "biz_spicycenter",
    slug: "spicycenter",
    name: "SpicyCenter",
    mission:
      "Grow spice/grocery ecommerce through assortment, content SEO, and retention loops.",
    goals: [
      "Improve category SEO coverage",
      "Increase subscription/repeat purchase",
      "Ship high-confidence product descriptions at scale",
    ],
    kpis: {
      primary: ["revenue", "orders", "organic_sessions", "repeat_rate"],
      secondary: ["aov", "review_velocity", "ad_roas"],
    },
  },
  {
    id: "biz_halloweenready",
    slug: "halloweenready",
    name: "HalloweenReady",
    mission:
      "Maximize seasonal Halloween ecommerce revenue via assortment timing, ads, and conversion.",
    goals: [
      "Pre-season assortment and content readiness",
      "Aggressive but approved paid testing",
      "Post-season learning capture for next year",
    ],
    kpis: {
      primary: ["revenue", "orders", "ad_roas", "cvr"],
      secondary: ["sell_through", "organic_sessions", "returns"],
    },
  },
] as const;

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
    skills: [
      "research",
      "seo",
      "content",
      "analysis",
      "coding",
      "reporting",
    ],
    weeklyCapacityHours: 80,
  },
] as const;
