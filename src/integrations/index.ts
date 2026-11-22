import { getAiProvider } from "@/integrations/ai-provider";

/**
 * Integration adapters.
 * AI default = Cursor (no separate LLM API key required in this workspace).
 * MyDGV human login ≠ server integration key (do not store Cognito passwords in the OS).
 */

export type IntegrationStatus = {
  id: string;
  name: string;
  configured: boolean;
  mode: "execute" | "read" | "stub";
  setup: string;
};

function has(...keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]));
}

export function listIntegrations(): IntegrationStatus[] {
  const ai = getAiProvider();
  return [
    {
      id: "mydgv",
      name: "MyDGV (employee-portal)",
      configured: has("MYDGV_API_URL", "MYDGV_DGV_OS_API_KEY"),
      mode: has("MYDGV_API_URL", "MYDGV_DGV_OS_API_KEY") ? "execute" : "stub",
      setup:
        "Human login verified separately. For OS sync: deploy feature/dgv-ai-os-integration with DgvOsApiKey, then set MYDGV_API_URL + MYDGV_DGV_OS_API_KEY. Never put Cognito passwords in DGV OS env.",
    },
    {
      id: "ai-provider",
      name: `AI provider (${ai.id})`,
      configured: ai.active,
      mode: ai.mode,
      setup: ai.setup,
    },
    {
      id: "cursor-agents",
      name: "Cursor AI Agents / MCP",
      configured: true,
      mode: "execute",
      setup: "Primary autonomous runtime while Divit works in Cursor with an active plan.",
    },
    {
      id: "github",
      name: "GitHub",
      configured: has("GITHUB_TOKEN"),
      mode: has("GITHUB_TOKEN") ? "execute" : "stub",
      setup: "Set GITHUB_TOKEN with repo contents/PRs. Optional GITHUB_REPO=owner/name.",
    },
    {
      id: "slack",
      name: "Slack",
      configured: has("SLACK_BOT_TOKEN", "SLACK_DEFAULT_CHANNEL"),
      mode: has("SLACK_BOT_TOKEN") ? "execute" : "stub",
      setup: "Create Slack app, bot token chat:write, set SLACK_BOT_TOKEN + SLACK_DEFAULT_CHANNEL.",
    },
    {
      id: "ga4",
      name: "Google Analytics 4",
      configured: has("GA4_PROPERTY_ID", "GOOGLE_APPLICATION_CREDENTIALS"),
      mode: has("GA4_PROPERTY_ID") ? "read" : "stub",
      setup: "Service account with GA4 Viewer; GA4_PROPERTY_ID + credentials JSON path.",
    },
    {
      id: "gsc",
      name: "Google Search Console",
      configured: has("GSC_SITE_URL", "GOOGLE_APPLICATION_CREDENTIALS"),
      mode: has("GSC_SITE_URL") ? "read" : "stub",
      setup: "Verify site in GSC; grant service account; set GSC_SITE_URL.",
    },
    {
      id: "drive",
      name: "Google Drive (growth plans)",
      configured: has("GOOGLE_DRIVE_FOLDER_ID", "GOOGLE_APPLICATION_CREDENTIALS"),
      mode: has("GOOGLE_DRIVE_FOLDER_ID") ? "read" : "stub",
      setup: "Share growth-plan folder with service account; set GOOGLE_DRIVE_FOLDER_ID.",
    },
    {
      id: "ads",
      name: "Advertising platforms",
      configured: false,
      mode: "stub",
      setup:
        "OAuth per platform. Spend/budget changes always require Divit approval — never auto-execute.",
    },
  ];
}

export async function notifySlack(text: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_DEFAULT_CHANNEL;
  if (!token || !channel) {
    return { ok: false as const, reason: "Slack not configured" };
  }
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel, text }),
  });
  const json = (await res.json()) as { ok: boolean; error?: string };
  return { ok: json.ok, reason: json.error };
}
