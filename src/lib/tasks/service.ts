import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { db, ensureSchema } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { priorityFromScore, scoreTask } from "@/lib/scoring/priority";

export const TaskCreateSchema = z.object({
  businessId: z.string().min(1),
  project: z.string().min(1),
  title: z.string().min(3),
  expectedOutcome: z.string().min(20),
  ownerId: z.string().optional().nullable(),
  status: z
    .enum(["backlog", "ready", "in_progress", "blocked", "review", "completed"])
    .default("backlog"),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  eta: z.string().optional().nullable(),
  estimatedHours: z.number().positive().default(2),
  dependencies: z.array(z.string()).default([]),
  blockers: z.array(z.string()).default([]),
  kpiImpact: z.string().optional().nullable(),
  revenuePotential: z.number().min(0).max(100).default(0),
  businessImpact: z.number().min(1).max(5).default(3),
  urgency: z.number().min(1).max(5).default(3),
  strategicImportance: z.number().min(1).max(5).default(3),
  confidence: z.number().min(0).max(1).default(0.7),
  effort: z.number().min(1).max(5).default(3),
  executableByAi: z.boolean().default(false),
  createdByAgent: z.string().optional().nullable(),
  actor: z.string().default("system"),
});

export const TaskUpdateSchema = z.object({
  id: z.string(),
  status: z
    .enum(["backlog", "ready", "in_progress", "blocked", "review", "completed"])
    .optional(),
  ownerId: z.string().nullable().optional(),
  actualHours: z.number().min(0).optional(),
  blockers: z.array(z.string()).optional(),
  eta: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  note: z.string().optional(),
  actor: z.string().default("system"),
  allowDeadlineChange: z.boolean().default(false),
});

export function listTasks(limit = 100) {
  ensureSchema();
  return db.select().from(tasks).orderBy(desc(tasks.score)).limit(limit).all();
}

export function createTask(input: z.infer<typeof TaskCreateSchema>) {
  ensureSchema();
  const data = TaskCreateSchema.parse(input);
  const score = scoreTask(data);
  const id = nanoid();
  db.insert(tasks)
    .values({
      id,
      businessId: data.businessId,
      project: data.project,
      title: data.title,
      expectedOutcome: data.expectedOutcome,
      ownerId: data.ownerId ?? null,
      priority: priorityFromScore(score),
      status: data.status,
      startDate: data.startDate ?? null,
      deadline: data.deadline ?? null,
      eta: data.eta ?? null,
      estimatedHours: data.estimatedHours,
      dependenciesJson: JSON.stringify(data.dependencies),
      blockersJson: JSON.stringify(data.blockers),
      kpiImpact: data.kpiImpact ?? null,
      revenuePotential: data.revenuePotential,
      businessImpact: data.businessImpact,
      urgency: data.urgency,
      strategicImportance: data.strategicImportance,
      confidence: data.confidence,
      effort: data.effort,
      score,
      executableByAi: data.executableByAi,
      createdByAgent: data.createdByAgent ?? null,
    })
    .run();
  audit(data.actor, "task.create", "task", id, { title: data.title });
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
}

export function updateTask(input: z.infer<typeof TaskUpdateSchema>) {
  ensureSchema();
  const data = TaskUpdateSchema.parse(input);
  const existing = db.select().from(tasks).where(eq(tasks.id, data.id)).get();
  if (!existing) throw new Error("Task not found");

  if (
    data.deadline !== undefined &&
    data.deadline !== existing.deadline &&
    !data.allowDeadlineChange
  ) {
    throw new Error(
      "Deadline changes require allowDeadlineChange=true and must be explicit — never silent.",
    );
  }

  db.update(tasks)
    .set({
      status: data.status ?? existing.status,
      ownerId: data.ownerId === undefined ? existing.ownerId : data.ownerId,
      actualHours: data.actualHours ?? existing.actualHours,
      blockersJson:
        data.blockers !== undefined
          ? JSON.stringify(data.blockers)
          : existing.blockersJson,
      eta: data.eta === undefined ? existing.eta : data.eta,
      deadline: data.deadline === undefined ? existing.deadline : data.deadline,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, data.id))
    .run();

  audit(data.actor, "task.update", "task", data.id, {
    note: data.note,
    status: data.status,
  });
  return db.select().from(tasks).where(eq(tasks.id, data.id)).get();
}
