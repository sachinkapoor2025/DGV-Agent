import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, before } from "node:test";

describe("capacity + seed smoke", () => {
  before(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dgv-test-"));
    process.env.DGV_DB_PATH = path.join(dir, "test.sqlite");
  });

  it("seeds businesses and surfaces capacity rows", async () => {
    // Dynamic import after DB path set
    const { ensureSchema, db } = await import("../src/lib/db/client");
    const { businesses, teamMembers } = await import("../src/lib/db/schema");
    const { BUSINESS_SEED, TEAM_SEED } = await import("../src/content/businesses");
    const { getTeamCapacity } = await import("../src/lib/capacity");
    const { eq } = await import("drizzle-orm");

    ensureSchema();
    for (const b of BUSINESS_SEED) {
      if (!db.select().from(businesses).where(eq(businesses.id, b.id)).get()) {
        db.insert(businesses)
          .values({
            id: b.id,
            slug: b.slug,
            name: b.name,
            mission: b.mission,
            goalsJson: JSON.stringify(b.goals),
            kpisJson: JSON.stringify(b.kpis),
          })
          .run();
      }
    }
    for (const m of TEAM_SEED) {
      if (!db.select().from(teamMembers).where(eq(teamMembers.id, m.id)).get()) {
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
      }
    }

    const capacity = getTeamCapacity();
    assert.ok(capacity.length >= 5);
    assert.ok(capacity.every((c) => c.weeklyCapacityHours > 0));
  });
});
