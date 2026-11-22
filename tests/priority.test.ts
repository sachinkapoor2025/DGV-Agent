import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { priorityFromScore, scoreTask } from "../src/lib/scoring/priority";

describe("priority scoring", () => {
  it("scores higher impact and urgency above low-effort noise", () => {
    const high = scoreTask({
      revenuePotential: 80,
      businessImpact: 5,
      urgency: 5,
      strategicImportance: 5,
      confidence: 0.9,
      effort: 2,
    });
    const low = scoreTask({
      revenuePotential: 5,
      businessImpact: 2,
      urgency: 1,
      strategicImportance: 2,
      confidence: 0.4,
      effort: 5,
    });
    assert.ok(high > low);
    assert.equal(priorityFromScore(high), "critical");
    assert.equal(priorityFromScore(low), "low");
  });

  it("penalizes effort", () => {
    const easy = scoreTask({
      revenuePotential: 40,
      businessImpact: 4,
      urgency: 4,
      strategicImportance: 4,
      confidence: 0.8,
      effort: 1,
    });
    const hard = scoreTask({
      revenuePotential: 40,
      businessImpact: 4,
      urgency: 4,
      strategicImportance: 4,
      confidence: 0.8,
      effort: 5,
    });
    assert.ok(easy > hard);
  });
});
