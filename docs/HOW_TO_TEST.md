# How to test DGV AI OS + agents

## 1. Confirm code is on GitHub

- AI OS: branch `dev` → https://github.com/sachinkapoor2025/DGV-Agent/tree/dev  
- MyDGV integration: branch `feature/dgv-ai-os-integration` → https://github.com/sachinkapoor2025/employee-portal/tree/feature/dgv-ai-os-integration  

## 2. Local credentials (already prepared)

File: `.env.local` (gitignored — never commit)

Includes:
- DGV OS admin login
- MyDGV Cognito admin (`dgv@mydgv.com`) for sync
- `DGV_AI_PROVIDER=cursor`

## 3. Start the OS

```bash
cd /Users/sachinkapoor/Desktop/HR_EC/DGV-Agent
npm install
npm run seed
npm run dev
```

Open: http://localhost:3000  
Login: `divit@dgv.local` / `dgv-admin-change-me`

## 4. Verify agents are running

### In the UI
1. **Agents** → click **COO morning**, then **All growth agents**  
   - Expect JSON with `reportId` / created task counts  
2. **Reports** → latest morning briefing appears  
3. **Tasks** → scored tasks for UsaRakhi, Blossompot, SpicyCenter, OccasionFun  
4. **Strategies** → import/approve the 4 plans (`pending_review` until you Approve)  
5. **Team** → capacity view  
6. **Integrations** → AI provider = Cursor (execute); MyDGV shows stub until API key deploy  

### Via API (after browser login cookie, or from UI flows)
- Agents dispatch: UI on `/agents`  
- Cron (no UI login):  

```bash
curl -X POST -H "x-dgv-cron-secret: dgv-cron-dev" http://localhost:3000/api/cron/morning
```

### MyDGV employee sync
With `.env.local` loaded and app running, as admin call:

```bash
# after logging in via browser (cookie), from DevTools console or a cookie-aware curl:
# Prefer UI later; for now use seed + Agents page.
```

Or from terminal with env loaded:

```bash
set -a && source .env.local && set +a
npx tsx -e 'import { syncEmployeesFromMydgv } from "./src/lib/sync/mydgv-employees.ts"; console.log(await syncEmployeesFromMydgv("manual"))'
```

## 5. What “agents up” means

These are **in-process agents** (not separate daemons):
- They run when you click **Dispatch** on `/agents`, or when cron hits `/api/cron/*`, or during `npm run seed`.
- AI “brain” for research/coding is **Cursor** (this chat / Agent mode) — no separate OpenAI key.
- MyDGV human tasks sync needs either Cognito env (interim) or deployed `MYDGV_DGV_OS_API_KEY`.

## 6. Quick health checklist

| Check | Pass looks like |
|---|---|
| `npm run seed` | prints businesses + strategy drafts + COO report id |
| Login | dashboard loads |
| Agents → COO morning | report on `/reports` |
| Agents → All growth | tasks for 4 primary businesses |
| Strategies | 4 drafts; Approve keeps COO using approved plans |
| MyDGV login | https://login.mydgv.com Admin dashboard (already verified) |
