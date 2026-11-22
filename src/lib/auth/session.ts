import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionUser = {
  email: string;
  name: string;
  role: "admin" | "member";
};

const COOKIE = "dgv_session";

function secret() {
  return process.env.DGV_AUTH_SECRET || "dgv-dev-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const body = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return parseSessionToken(jar.get(COOKIE)?.value);
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Dev credentials — override with env in production. */
export function verifyLogin(email: string, password: string): SessionUser | null {
  const adminEmail = process.env.DGV_ADMIN_EMAIL || "divit@dgv.local";
  const adminPass = process.env.DGV_ADMIN_PASSWORD || "dgv-admin-change-me";
  if (email === adminEmail && password === adminPass) {
    return { email, name: "Divit", role: "admin" };
  }
  const memberPass = process.env.DGV_MEMBER_PASSWORD || "dgv-member";
  if (password === memberPass && email.endsWith("@dgv.local")) {
    return { email, name: email.split("@")[0] || "member", role: "member" };
  }
  return null;
}
