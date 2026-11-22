/**
 * MyDGV (employee-portal) server-to-server client.
 * Works in stub mode when MYDGV_API_URL / MYDGV_DGV_OS_API_KEY are unset —
 * AI OS remains fully functional offline.
 */

export type MydgvEmployee = {
  email: string;
  name?: string;
  department?: string;
  designation?: string;
  skills?: string[];
  role?: string;
  active?: boolean;
};

export type MydgvTask = {
  taskId: string;
  projectId?: string;
  title: string;
  description?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  eta?: string | null;
  blockers?: string[];
  dgvTaskId?: string;
  source?: string;
};

export type MydgvClientResult<T> =
  | { ok: true; data: T; mode: "live" | "stub" }
  | { ok: false; error: string; mode: "live" | "stub"; retryable?: boolean };

function config() {
  return {
    baseUrl: (process.env.MYDGV_API_URL || "").replace(/\/$/, ""),
    apiKey: process.env.MYDGV_DGV_OS_API_KEY || "",
  };
}

export function isMydgvConfigured() {
  const { baseUrl, apiKey } = config();
  return Boolean(baseUrl && apiKey);
}

async function request<T>(
  path: string,
  init?: RequestInit & { idempotencyKey?: string },
): Promise<MydgvClientResult<T>> {
  const { baseUrl, apiKey } = config();
  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      error: "MyDGV not configured (set MYDGV_API_URL + MYDGV_DGV_OS_API_KEY)",
      mode: "stub",
      retryable: false,
    };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-dgv-os-key": apiKey,
    };
    if (init?.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string>) },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: `Auth failed (${res.status})`, mode: "live", retryable: false };
    }
    if (res.status >= 500) {
      return {
        ok: false,
        error: `MyDGV server error (${res.status})`,
        mode: "live",
        retryable: true,
      };
    }
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `HTTP ${res.status}`, mode: "live", retryable: false };
    }
    const data = (await res.json()) as T;
    return { ok: true, data, mode: "live" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network failure",
      mode: "live",
      retryable: true,
    };
  }
}

export function listEmployees() {
  return request<{ employees: MydgvEmployee[] }>("/integrations/dgv-os/employees");
}

export function listTasks(params?: { assignee?: string }) {
  const qs = params?.assignee
    ? `?assignee=${encodeURIComponent(params.assignee)}`
    : "";
  return request<{ tasks: MydgvTask[] }>(`/integrations/dgv-os/tasks${qs}`);
}

export function createTask(
  task: Omit<MydgvTask, "taskId"> & { idempotencyKey: string },
) {
  return request<MydgvTask>("/integrations/dgv-os/tasks", {
    method: "POST",
    body: JSON.stringify(task),
    idempotencyKey: task.idempotencyKey,
  });
}

export function updateTask(
  taskId: string,
  patch: Partial<MydgvTask> & { idempotencyKey?: string },
) {
  return request<MydgvTask>(`/integrations/dgv-os/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    idempotencyKey: patch.idempotencyKey,
  });
}

export function getCapacity() {
  return request<{
    employees: Array<{
      email: string;
      openTasks: number;
      status: "underutilized" | "balanced" | "overloaded";
    }>;
  }>("/integrations/dgv-os/capacity");
}

/** Safe retry helper — exponential backoff, no silent duplicate creates (use idempotency keys). */
export async function withRetries<T>(
  fn: () => Promise<MydgvClientResult<T>>,
  attempts = 3,
): Promise<MydgvClientResult<T>> {
  let last: MydgvClientResult<T> | null = null;
  for (let i = 0; i < attempts; i++) {
    last = await fn();
    if (last.ok || !last.retryable) return last;
    await new Promise((r) => setTimeout(r, 200 * Math.pow(2, i)));
  }
  return last!;
}
