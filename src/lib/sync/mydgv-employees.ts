import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { audit } from "@/lib/audit";
import { db, ensureSchema } from "@/lib/db/client";
import { teamMembers } from "@/lib/db/schema";
import {
  fetchMydgvUsers,
  isMydgvCognitoConfigured,
} from "@/integrations/mydgv/cognito-admin";
import { isMydgvConfigured, listEmployees } from "@/integrations/mydgv/client";

type NormalizedEmployee = {
  email: string;
  name: string;
  role: string;
  skills: string[];
  department?: string;
  designation?: string;
};

function normalizeUsersPayload(raw: unknown): NormalizedEmployee[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { users?: unknown[] })?.users)
      ? (raw as { users: unknown[] }).users
      : Array.isArray((raw as { employees?: unknown[] })?.employees)
        ? (raw as { employees: unknown[] }).employees
        : [];

  return list
    .map((item) => {
      const u = item as Record<string, unknown>;
      const email = String(u.email || u.PK || "").toLowerCase();
      if (!email || !email.includes("@")) return null;
      const skill = u.skill ? [String(u.skill)] : [];
      const skills = Array.isArray(u.skills)
        ? (u.skills as unknown[]).map(String)
        : skill;
      return {
        email,
        name: String(u.name || u.fullName || email.split("@")[0]),
        role: String(u.role || u.designation || "EMPLOYEE"),
        skills,
        department: u.department ? String(u.department) : undefined,
        designation: u.designation ? String(u.designation) : undefined,
      } satisfies NormalizedEmployee;
    })
    .filter(Boolean) as NormalizedEmployee[];
}

/**
 * Pull MyDGV employees into local team_members.
 * Prefer API-key integration; fall back to Cognito admin env.
 */
export async function syncEmployeesFromMydgv(actor = "system") {
  ensureSchema();
  let employees: NormalizedEmployee[] = [];
  let mode: "api_key" | "cognito" | "none" = "none";

  if (isMydgvConfigured()) {
    const res = await listEmployees();
    if (res.ok) {
      employees = normalizeUsersPayload(res.data.employees);
      mode = "api_key";
    }
  }

  if (!employees.length && isMydgvCognitoConfigured()) {
    const raw = await fetchMydgvUsers();
    employees = normalizeUsersPayload(raw);
    mode = "cognito";
  }

  if (!employees.length) {
    return {
      ok: false as const,
      mode,
      synced: 0,
      error:
        "No MyDGV employees loaded. Set MYDGV_DGV_OS_API_KEY or MYDGV_ADMIN_EMAIL/PASSWORD.",
    };
  }

  let upserted = 0;
  for (const e of employees) {
    const id = `tm_${e.email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
    const existing = db.select().from(teamMembers).where(eq(teamMembers.id, id)).get();
    const skillsJson = JSON.stringify(e.skills);
    const availabilityJson = JSON.stringify({
      department: e.department || null,
      designation: e.designation || null,
      source: "mydgv",
    });
    if (existing) {
      db.update(teamMembers)
        .set({
          name: e.name,
          email: e.email,
          role: e.role,
          skillsJson,
          availabilityJson,
          active: true,
        })
        .where(eq(teamMembers.id, id))
        .run();
    } else {
      db.insert(teamMembers)
        .values({
          id,
          name: e.name,
          email: e.email,
          role: e.role,
          skillsJson,
          availabilityJson,
          weeklyCapacityHours: 40,
          active: true,
        })
        .run();
    }
    upserted += 1;
  }

  audit(actor, "mydgv.sync_employees", "team", undefined, {
    mode,
    synced: upserted,
  });

  return { ok: true as const, mode, synced: upserted };
}
