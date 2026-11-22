import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  mission: text("mission").notNull(),
  goalsJson: text("goals_json").notNull().default("[]"),
  kpisJson: text("kpis_json").notNull().default("{}"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  skillsJson: text("skills_json").notNull().default("[]"),
  weeklyCapacityHours: real("weekly_capacity_hours").notNull().default(40),
  availabilityJson: text("availability_json").notNull().default("{}"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id),
  project: text("project").notNull(),
  title: text("title").notNull(),
  expectedOutcome: text("expected_outcome").notNull(),
  ownerId: text("owner_id").references(() => teamMembers.id),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("backlog"),
  startDate: text("start_date"),
  deadline: text("deadline"),
  eta: text("eta"),
  estimatedHours: real("estimated_hours").notNull().default(2),
  actualHours: real("actual_hours").notNull().default(0),
  dependenciesJson: text("dependencies_json").notNull().default("[]"),
  blockersJson: text("blockers_json").notNull().default("[]"),
  kpiImpact: text("kpi_impact"),
  revenuePotential: real("revenue_potential").notNull().default(0),
  businessImpact: real("business_impact").notNull().default(3),
  urgency: real("urgency").notNull().default(3),
  strategicImportance: real("strategic_importance").notNull().default(3),
  confidence: real("confidence").notNull().default(0.7),
  effort: real("effort").notNull().default(3),
  score: real("score").notNull().default(0),
  executableByAi: integer("executable_by_ai", { mode: "boolean" })
    .notNull()
    .default(false),
  createdByAgent: text("created_by_agent"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const agentRuns = sqliteTable("agent_runs", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  businessId: text("business_id").references(() => businesses.id),
  kind: text("kind").notNull(),
  inputJson: text("input_json").notNull().default("{}"),
  outputJson: text("output_json").notNull().default("{}"),
  status: text("status").notNull().default("completed"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  payloadJson: text("payload_json").notNull().default("{}"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const decisions = sqliteTable("decisions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  context: text("context").notNull(),
  recommendation: text("recommendation").notNull(),
  requiresApproval: integer("requires_approval", { mode: "boolean" })
    .notNull()
    .default(true),
  status: text("status").notNull().default("pending"),
  businessId: text("business_id").references(() => businesses.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  detailJson: text("detail_json").notNull().default("{}"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** Imported business strategies — require review before approved use. */
export const strategies = sqliteTable("strategies", {
  id: text("id").primaryKey(),
  businessSlug: text("business_slug").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending_review"),
  sourceFile: text("source_file"),
  sourceFormat: text("source_format").notNull().default("pdf_text"),
  payloadJson: text("payload_json").notNull().default("{}"),
  missingFieldsJson: text("missing_fields_json").notNull().default("[]"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** AI-only execution ledger (independent of MyDGV). */
export const aiExecutions = sqliteTable("ai_executions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  businessSlug: text("business_slug"),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("completed"),
  inputJson: text("input_json").notNull().default("{}"),
  outputJson: text("output_json").notNull().default("{}"),
  syncedToMydgv: integer("synced_to_mydgv", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** Sync map DGV task ↔ MyDGV task (idempotent). */
export const syncLinks = sqliteTable("sync_links", {
  id: text("id").primaryKey(),
  dgvTaskId: text("dgv_task_id").notNull().unique(),
  mydgvTaskId: text("mydgv_task_id").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  lastSyncAt: text("last_sync_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  lastDirection: text("last_direction").notNull().default("dgv_to_mydgv"),
  status: text("status").notNull().default("synced"),
  detailJson: text("detail_json").notNull().default("{}"),
});
