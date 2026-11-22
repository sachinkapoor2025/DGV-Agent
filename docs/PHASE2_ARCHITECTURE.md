# Phase 2 Architecture — DGV AI OS ↔ MyDGV (employee-portal)

## Confirmed systems

| System | Repo / path | Role |
|---|---|---|
| DGV AI Business OS | `sachinkapoor2025/DGV-Agent` (`dev`) | Brain: strategies, AI agents, prioritization, AI execution |
| MyDGV portal | `sachinkapoor2025/employee-portal` (`feature/dgv-ai-os-integration` from `main`) | Workforce: employees, attendance, human tasks |
| mydgv.com | Astro marketing site | **Not** the portal — ignore for task APIs |

## MyDGV facts (from code)

- Stack: React frontend + AWS SAM/Lambda + DynamoDB + Cognito
- Auth: Cognito JWT (`Authorization: Bearer`) for humans; Admin/Employee groups
- Tasks: `/tasks`, `/projects` via `backend/lambda/projects/handler.js` (WorkTasks table)
- Users: `/admin/users`, profiles with `department`, `designation`
- Attendance: `/attendance`
- Skills: `/skills` + training endpoints
- Domain: `@mydgv.com` emails

## Ownership (single source of truth)

**MyDGV owns:** employees, attendance/availability, human task assignment & progress  
**DGV AI OS owns:** strategies, KPIs, AI execution, recommendations, approvals, prioritization  

Synced human tasks carry `dgvTaskId` ↔ `mydgvTaskId` with idempotent keys to prevent loops.

## Integration auth

Server-to-server only:

- Header: `x-dgv-os-key: <MYDGV_DGV_OS_API_KEY>`
- Routes under `/integrations/dgv-os/*` with API Gateway authorizer **NONE** + custom key check
- Never expose key to browser or prompts

## Failure mode

If MyDGV is down, AI OS continues: research, planning, AI tasks, reports. Human sync queues/retries.

## MyDGV capability gaps (from portal inspection)

| Need | Portal reality |
|---|---|
| Employees / profiles / skills | Yes (`/admin/users`, profile, `/skills`) |
| Tasks / projects / dueDate / statuses | Yes (Kanban + zones) |
| Departments | Profile string only — no `/departments` entity |
| Blockers | **Not in portal** — store in AI OS / sync as task comments later |
| Capacity | **No FTE model** — derive from open tasks + time entries |
| Machine auth | Added on `feature/dgv-ai-os-integration` (`x-dgv-os-key`); until deployed, interim Cognito admin env is supported in OS only |

## Forbidden without explicit approval

Attendance edits, payroll, employee record mutation, payments, uncontrolled production deploys.
