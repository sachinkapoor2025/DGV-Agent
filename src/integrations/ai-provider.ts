/**
 * AI execution provider for DGV OS.
 *
 * Divit runs research/coding inside Cursor (this IDE) with an active plan.
 * We do NOT require separate OpenAI/Anthropic API keys for core autonomy.
 * Optional external LLM keys can be added later for headless cloud workers.
 */

export type AiProviderId = "cursor" | "openai" | "anthropic" | "none";

export type AiProviderStatus = {
  id: AiProviderId;
  active: boolean;
  mode: "execute" | "stub";
  description: string;
  setup: string;
};

export function getAiProvider(): AiProviderStatus {
  const forced = (process.env.DGV_AI_PROVIDER || "cursor").toLowerCase() as AiProviderId;

  if (forced === "openai" && process.env.OPENAI_API_KEY) {
    return {
      id: "openai",
      active: true,
      mode: "execute",
      description: "OpenAI API key detected (optional headless path).",
      setup: "OPENAI_API_KEY set. Prefer Cursor for interactive agent work.",
    };
  }
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return {
      id: "anthropic",
      active: true,
      mode: "execute",
      description: "Anthropic API key detected (optional headless path).",
      setup: "ANTHROPIC_API_KEY set. Prefer Cursor for interactive agent work.",
    };
  }

  // Default: Cursor is the AI provider for this workspace.
  return {
    id: "cursor",
    active: true,
    mode: "execute",
    description:
      "Cursor Agent is the primary AI execution runtime (research, coding, QA, reports).",
    setup:
      "No extra API keys required while working in Cursor. Autonomous runs are dispatched via Cursor agents/MCP in this session. Optional: set OPENAI_API_KEY / ANTHROPIC_API_KEY later for unattended cloud workers.",
  };
}

export function aiProviderBanner(): string {
  const p = getAiProvider();
  return `AI provider: ${p.id} (${p.mode}) — ${p.description}`;
}
