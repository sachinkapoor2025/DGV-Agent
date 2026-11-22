/**
 * Interim MyDGV admin client using Cognito USER_PASSWORD_AUTH.
 * Use only with gitignored local env (MYDGV_ADMIN_EMAIL / MYDGV_ADMIN_PASSWORD).
 * Prefer MYDGV_DGV_OS_API_KEY once feature/dgv-ai-os-integration is deployed.
 */

type TokenCache = { idToken: string; expiresAt: number };

let cache: TokenCache | null = null;

function cfg() {
  return {
    region: process.env.MYDGV_COGNITO_REGION || "ap-south-1",
    clientId:
      process.env.MYDGV_COGNITO_CLIENT_ID || "5q797v9k55ad1q36mol3glhecf",
    apiUrl: (
      process.env.MYDGV_API_URL ||
      "https://z0nrgtv865.execute-api.ap-south-1.amazonaws.com/prod"
    ).replace(/\/$/, ""),
    email: process.env.MYDGV_ADMIN_EMAIL || "",
    password: process.env.MYDGV_ADMIN_PASSWORD || "",
  };
}

export function isMydgvCognitoConfigured() {
  const c = cfg();
  return Boolean(c.email && c.password && c.clientId && c.apiUrl);
}

async function getIdToken(): Promise<string> {
  const c = cfg();
  if (!c.email || !c.password) {
    throw new Error("MYDGV_ADMIN_EMAIL / MYDGV_ADMIN_PASSWORD not set");
  }
  if (cache && cache.expiresAt > Date.now() + 60_000) return cache.idToken;

  const res = await fetch(`https://cognito-idp.${c.region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: c.clientId,
      AuthParameters: {
        USERNAME: c.email,
        PASSWORD: c.password,
      },
    }),
  });
  const json = (await res.json()) as {
    AuthenticationResult?: { IdToken?: string; ExpiresIn?: number };
    message?: string;
    __type?: string;
  };
  const idToken = json.AuthenticationResult?.IdToken;
  if (!idToken) {
    throw new Error(json.message || json.__type || "Cognito auth failed");
  }
  const expiresIn = json.AuthenticationResult?.ExpiresIn ?? 3600;
  cache = { idToken, expiresAt: Date.now() + expiresIn * 1000 };
  return idToken;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const c = cfg();
  const token = await getIdToken();
  const res = await fetch(`${c.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MyDGV ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function fetchMydgvUsers() {
  return api<unknown>("/admin/users");
}

export async function fetchMydgvTasks() {
  return api<unknown>("/tasks");
}

export async function fetchMydgvProjects() {
  return api<unknown>("/projects");
}

export async function fetchMydgvSkills() {
  return api<unknown>("/skills");
}

export async function probeMydgvAdmin() {
  const users = await fetchMydgvUsers();
  const tasks = await fetchMydgvTasks();
  const projects = await fetchMydgvProjects();
  const count = (v: unknown) =>
    Array.isArray(v) ? v.length : Array.isArray((v as { users?: unknown[] })?.users)
      ? (v as { users: unknown[] }).users.length
      : typeof v === "object" && v
        ? Object.keys(v as object).length
        : 0;
  return {
    ok: true,
    users: count(users),
    tasks: count(tasks),
    projects: count(projects),
  };
}
