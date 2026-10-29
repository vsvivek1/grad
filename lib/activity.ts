import "server-only";
import { headers } from "next/headers";

/**
 * Activity log stored in Supabase. The table is closed to direct access;
 * the server goes through functions that check SUPABASE_LOG_TOKEN.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const token = process.env.SUPABASE_LOG_TOKEN;
export const activityEnabled = !!(url && key && token);

export type ActivityRow = {
  id: number;
  at: string;
  email: string;
  name: string | null;
  action: string;
  detail: Record<string, unknown>;
  ip: string | null;
  city: string | null;
  user_agent: string | null;
};

export type ActivityUser = {
  email: string;
  name: string | null;
  first_seen: string;
  last_seen: string;
  events: number;
  sign_ins: number;
  people_viewed: number;
};

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: token, ...args }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${fn} failed: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Record one action. Never throws: logging must not break the app. */
export async function logActivity(user: { email?: string | null; name?: string | null }, action: string, detail: Record<string, unknown> = {}) {
  if (!activityEnabled || !user.email) return;
  try {
    let ip: string | null = null;
    let city: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
      const c = h.get("x-vercel-ip-city");
      city = c ? decodeURIComponent(c) : null;
      userAgent = h.get("user-agent");
    } catch {
      // No request in scope (e.g. some auth callbacks); log without it.
    }
    await rpc("log_activity", {
      p_email: user.email,
      p_name: user.name ?? null,
      p_action: action,
      p_detail: detail,
      p_ip: ip,
      p_city: city,
      p_user_agent: userAgent,
    });
  } catch (e) {
    console.error("logActivity", e);
  }
}

export function readActivity(email: string | null, limit = 500) {
  return rpc<ActivityRow[]>("read_activity", { p_email: email, p_limit: limit });
}

export function activityUsers() {
  return rpc<ActivityUser[]>("activity_users", {});
}
