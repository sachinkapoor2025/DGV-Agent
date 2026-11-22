# Deployment

## Local

```bash
npm install
npm run seed
npm run dev
```

Login: `divit@dgv.local` / `dgv-admin-change-me`  
Override with `DGV_ADMIN_EMAIL` + `DGV_ADMIN_PASSWORD`.

Member login: any `*@dgv.local` email + `DGV_MEMBER_PASSWORD` (default `dgv-member`).

## Environment

| Variable | Purpose |
|---|---|
| `DGV_DB_PATH` | SQLite file path (default `data/dgv-os.sqlite`) |
| `DGV_AUTH_SECRET` | Session HMAC secret |
| `DGV_ADMIN_EMAIL` / `DGV_ADMIN_PASSWORD` | Admin login |
| `DGV_MEMBER_PASSWORD` | Shared member password |
| `DGV_CRON_SECRET` | Header `x-dgv-cron-secret` for `/api/cron/*` |
| `SLACK_BOT_TOKEN` / `SLACK_DEFAULT_CHANNEL` | Optional Slack notify |
| `GITHUB_TOKEN` | Optional GitHub execute |
| `GA4_PROPERTY_ID` / `GSC_SITE_URL` / `GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_DRIVE_FOLDER_ID` | Google read integrations |
| `DGV_APP_URL` | GitHub Actions scheduled cron target |

## Cron endpoints

```bash
curl -X POST -H "x-dgv-cron-secret: $DGV_CRON_SECRET" https://YOUR_HOST/api/cron/morning
curl -X POST -H "x-dgv-cron-secret: $DGV_CRON_SECRET" https://YOUR_HOST/api/cron/midday
curl -X POST -H "x-dgv-cron-secret: $DGV_CRON_SECRET" https://YOUR_HOST/api/cron/evening
curl -X POST -H "x-dgv-cron-secret: $DGV_CRON_SECRET" https://YOUR_HOST/api/cron/weekly
```

Suggested schedule (local TZ): morning 08:00, midday 13:00, evening 18:00, Friday weekly 17:00.

## Hosting notes

- Needs **Node.js** (not static export) because of SQLite + APIs.
- Persist `data/` (or set `DGV_DB_PATH` to a volume).
- For multi-instance scale, migrate SQLite → Postgres (Drizzle schemas are portable).
- GitHub Actions workflow: `.github/workflows/ci.yml` (lint, typecheck, test, seed, build; optional scheduled cron).

## Autonomy / approvals

Autonomous: research, analysis, task creation, reports, drafts, SEO/competitor work, code/tests/PRs when wired.  
Requires Divit approval: spend, ad budgets, payments, major pricing, production deploys, deleting prod data, bulk customer comms, major decisions.
