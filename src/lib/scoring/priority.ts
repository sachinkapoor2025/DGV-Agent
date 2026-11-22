export type ScoreInput = {
  revenuePotential: number; // 0-100 relative
  businessImpact: number; // 1-5
  urgency: number; // 1-5
  strategicImportance: number; // 1-5
  confidence: number; // 0-1
  effort: number; // 1-5 (higher = harder)
};

/**
 * Highest-value work first.
 * Score = impact * urgency * strategy * confidence * revenueWeight / effort
 */
export function scoreTask(input: ScoreInput): number {
  const revenueWeight = 1 + Math.min(Math.max(input.revenuePotential, 0), 100) / 100;
  const impact = clamp(input.businessImpact, 1, 5);
  const urgency = clamp(input.urgency, 1, 5);
  const strategy = clamp(input.strategicImportance, 1, 5);
  const confidence = clamp(input.confidence, 0.1, 1);
  const effort = clamp(input.effort, 1, 5);

  const raw =
    (impact * 2 + urgency * 1.5 + strategy * 1.5) *
    confidence *
    revenueWeight /
    effort;

  return Math.round(raw * 100) / 100;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function priorityFromScore(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 12) return "critical";
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}
