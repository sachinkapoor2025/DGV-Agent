# DGV AI Business OS — Build Checklist

## Completed
- [x] `dev` branch
- [x] Next.js app scaffold (App Router + TS + Tailwind)
- [x] SQLite + Drizzle schema (businesses, team, tasks, agent_runs, reports, decisions, audit_logs)
- [x] AI COO briefing engine (morning / midday / evening / weekly)
- [x] 4 business growth agents (UsaRakhi, Blossompot, SpicyCenter, HalloweenReady)
- [x] Task scoring (revenue, impact, urgency, strategy, confidence, effort)
- [x] Team capacity + reassignment suggestions
- [x] ETA / blocker / overdue / vague-deliverable risk scan
- [x] Dashboard, tasks, team, agents, reports, integrations UI
- [x] Auth (cookie session, admin + member)
- [x] APIs: auth, dashboard, tasks, agents, cron, team/me, decisions, integrations
- [x] Automation scheduler + GitHub Actions CI pipeline (one workflow)
- [x] Integration stubs with setup instructions
- [x] Seed script + unit tests
- [x] Deploy docs

## Remaining / depends on Divit
- [ ] Paste ChatGPT growth plans → replace placeholder goals/KPIs in `src/content/businesses.ts`
- [ ] Real team roster (emails, capacities, skills)
- [ ] Set production secrets (`DGV_AUTH_SECRET`, admin password, `DGV_CRON_SECRET`)
- [ ] Deploy host URL → `DGV_APP_URL` for scheduled Actions cron
- [ ] Slack / GitHub / GA4 / GSC / Drive credentials
- [ ] Ads OAuth (approval-gated spend only)
- [ ] Optional HTTPS hosting (Vercel / Fly / ECS) — SQLite needs persistent volume or migrate to Postgres later

## Blockers
- Growth plan documents not yet provided in-repo
- Workspace switch to DGV-Agent folder failed in Cursor (InstantiationService); continue from absolute path

## Deployment requirements
See `DEPLOYMENT.md`
