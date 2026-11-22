/**
 * Integration adapters — structure ready; credentials required for live calls.
 *
 * Manual setup required (tell Divit):
 * - Slack: SLACK_BOT_TOKEN + SLACK_DEFAULT_CHANNEL
 * - GitHub: GITHUB_TOKEN (repo scope) for PR/issue automation
 * - Google Analytics: GA4_PROPERTY_ID + GOOGLE_APPLICATION_CREDENTIALS
 * - Search Console: GSC_SITE_URL + same Google creds
 * - Ads: platform-specific OAuth (Meta/Google Ads) — never auto-spend
 * - Drive: GOOGLE_DRIVE_FOLDER_ID for plan docs sync
 * - Cursor Agents / MCP: configure in Cursor; COO can dispatch via Task tool locally
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
  return [
    {
      id: "cursor-agents",
      name: "Cursor AI Agents / MCP",
      configured: true,
      mode: "execute",
      setup: "Local Cursor session + MCP namespaces; no extra secrets for core OS.",
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
