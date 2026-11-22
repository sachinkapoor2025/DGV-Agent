import { eq } from "drizzle-orm";
import { runAllGrowthAgents } from "../src/agents/growth/run";
import { runCooBriefing } from "../src/agents/coo/run";
import { BUSINESS_SEED, TEAM_SEED } from "../src/content/businesses";
import { db, ensureSchema } from "../src/lib/db/client";
import { businesses, teamMembers } from "../src/lib/db/schema";
import { importPlansFromRawDir } from "../src/lib/strategy/import";

ensureSchema();

for (const b of BUSINESS_SEED) {
  const existing = db.select().from(businesses).where(eq(businesses.id, b.id)).get();
  const goalsJson = JSON.stringify(b.goals);
  const kpisJson = JSON.stringify(b.kpis);
  if (existing) {
    db.update(businesses)
      .set({
        name: b.name,
        mission: b.mission,
        goalsJson,
        kpisJson,
      })
      .where(eq(businesses.id, b.id))
      .run();
    console.log("updated business", b.slug, b.archived ? "(archived)" : "(primary)");
    continue;
  }
  db.insert(businesses)
    .values({
      id: b.id,
      slug: b.slug,
      name: b.name,
      mission: b.mission,
      goalsJson,
      kpisJson,
    })
    .run();
  console.log("seeded business", b.slug);
}

for (const m of TEAM_SEED) {
  const existing = db.select().from(teamMembers).where(eq(teamMembers.id, m.id)).get();
  if (existing) continue;
  db.insert(teamMembers)
    .values({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      skillsJson: JSON.stringify(m.skills),
      weeklyCapacityHours: m.weeklyCapacityHours,
    })
    .run();
  console.log("seeded member", m.email);
}

const imported = importPlansFromRawDir();
console.log(
  "strategy drafts pending review:",
  imported.map((s) => `${s.businessSlug}:${s.missingFields.length} missing fields`).join(", ") ||
    "none (place plan .txt files under data/strategy-imports/raw)",
);

const growth = runAllGrowthAgents();
console.log(
  "growth agents created tasks:",
  growth.map((g) => `${g.agentId}:${g.created.length}`).join(", "),
);

const briefing = runCooBriefing("morning");
console.log("COO morning report:", briefing.reportId);
console.log("Done.");
