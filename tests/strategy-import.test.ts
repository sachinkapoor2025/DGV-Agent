import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractStrategyFromPlanText } from "../src/lib/strategy/import";

describe("strategy import", () => {
  it("extracts present sections and lists missing without inventing", () => {
    const doc = extractStrategyFromPlanText({
      businessSlug: "spicycenter",
      title: "Test",
      sourceFile: "test.txt",
      text: `
Mission: Turn SpicyCenter into a buyer-generating export business.
Executive recommendation
Focus on buyer acquisition and sourcing for 90 days.
Revenue engines
A — B2B wholesale to importers.
B — Sourcing desk for product lists.
Critical gaps
Missing trust proof and response-time promise.
`,
    });
    assert.equal(doc.status, "pending_review");
    assert.ok(doc.profile || doc.growthStrategy);
    assert.ok(Array.isArray(doc.missingFields));
    assert.ok(doc.missingFields.includes("seoStrategy") || doc.missingFields.length > 0);
    assert.equal(doc.competitorResearch, undefined);
  });
});
