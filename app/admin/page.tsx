import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import { activityEnabled, activityUsers, readActivity, type ActivityRow } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · KSEB AE Gradation" };

const ACTION_LABELS: Record<string, string> = {
  sign_in: "Signed in",
  sign_out: "Signed out",
  open_app: "Opened the app",
  view_person: "Viewed person",
  change_date: "Changed date",
  change_settings: "Changed post counts",
  search: "Searched",
};

const IST = "Asia/Kolkata";
function when(ts: string) {
  return new Date(ts).toLocaleString("en-IN", { timeZone: IST, dateStyle: "medium", timeStyle: "short" });
}

function describe(row: ActivityRow): string {
  const d = row.detail as Record<string, string | number>;
  switch (row.action) {
    case "view_person":
      return `${d.name ?? ""} (#${d.slno ?? "?"})`;
    case "change_date":
      return String(d.date ?? "");
    case "search":
      return `“${d.query ?? ""}”`;
    case "change_settings":
      return Object.entries(d)
        .map(([k, v]) => `${k} ${v}`)
        .join(", ");
    default:
      return "";
  }
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) notFound();
  const { user } = await searchParams;

  if (!activityEnabled) {
    return (
      <main>
        <p>The activity log isn&apos;t connected. Set SUPABASE_URL, SUPABASE_KEY and SUPABASE_LOG_TOKEN.</p>
      </main>
    );
  }

  const [users, rows] = await Promise.all([activityUsers(), readActivity(user ?? null, user ? 2000 : 500)]);
  const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: IST });
  const activeToday = users.filter((u) => new Date(u.last_seen).toLocaleDateString("en-CA", { timeZone: IST }) === todayIST).length;

  return (
    <main>
      <header className="top">
        <div className="topbar">
          <h1>Admin</h1>
          <Link href="/">← Back to app</Link>
        </div>
        <p>Everyone who signed in, and what they did. Times are IST.</p>
      </header>

      <section className="facts card">
        <div>
          <span>Users</span>
          {users.length}
        </div>
        <div>
          <span>Active today</span>
          {activeToday}
        </div>
        <div>
          <span>Total events</span>
          {users.reduce((a, u) => a + Number(u.events), 0)}
        </div>
      </section>

      <section className="card">
        <h2>Users</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>First seen</th>
                <th>Last seen</th>
                <th>Sign-ins</th>
                <th>People viewed</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className={u.email === user ? "current" : ""}>
                  <td>
                    <Link href={`/admin?user=${encodeURIComponent(u.email)}`}>{u.name || u.email}</Link>
                    {u.name && <div className="muted small">{u.email}</div>}
                  </td>
                  <td>{when(u.first_seen)}</td>
                  <td>{when(u.last_seen)}</td>
                  <td>{u.sign_ins}</td>
                  <td>{u.people_viewed}</td>
                  <td>{u.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="muted">No activity yet.</p>}
        </div>
      </section>

      <section className="card">
        <div className="topbar">
          <h2>{user ? `Activity of ${user}` : "Latest activity"}</h2>
          {user && <Link href="/admin">Show everyone</Link>}
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                {!user && <th>User</th>}
                <th>Action</th>
                <th>Details</th>
                <th>Where</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{when(r.at)}</td>
                  {!user && (
                    <td>
                      <Link href={`/admin?user=${encodeURIComponent(r.email)}`}>{r.name || r.email}</Link>
                    </td>
                  )}
                  <td>{ACTION_LABELS[r.action] ?? r.action}</td>
                  <td>{describe(r)}</td>
                  <td className="muted" title={r.user_agent ?? ""}>
                    {[r.city, r.ip].filter(Boolean).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
