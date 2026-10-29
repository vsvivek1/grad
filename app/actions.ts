"use server";

import { auth } from "@/auth";
import { activityEnabled, logActivity, setServiceStatus } from "@/lib/activity";

const CLIENT_ACTIONS = new Set(["view_person", "change_date", "change_settings", "search"]);

/** Called from the page to record what a signed-in user looks at. */
export async function logClientActivity(action: string, detail: Record<string, string | number | null>) {
  if (!CLIENT_ACTIONS.has(action)) return;
  const session = await auth();
  if (!session?.user?.email) return;
  // Keep only short scalar values.
  const clean: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(detail).slice(0, 12)) {
    clean[k.slice(0, 30)] = typeof v === "string" ? v.slice(0, 200) : typeof v === "number" ? v : null;
  }
  await logActivity(session.user, action, clean);
}

/** Marks an engineer in or out of service. Any signed-in user can do it; every change is logged. */
export async function setServiceStatusAction(slno: number, out: boolean) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Sign in first");
  if (!activityEnabled) throw new Error("Storage is not connected");
  if (!Number.isInteger(slno)) throw new Error("Bad Sl No");
  await setServiceStatus(slno, !!out, { email: session.user.email, name: session.user.name });
}
