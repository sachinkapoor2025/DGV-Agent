import { nanoid } from "nanoid";
import { db } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema";

export function audit(
  actor: string,
  action: string,
  entityType: string,
  entityId?: string,
  detail?: Record<string, unknown>,
) {
  db.insert(auditLogs)
    .values({
      id: nanoid(),
      actor,
      action,
      entityType,
      entityId,
      detailJson: JSON.stringify(detail ?? {}),
    })
    .run();
}
