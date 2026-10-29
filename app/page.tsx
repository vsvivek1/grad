import Gradation from "./Gradation";
import people from "@/data/ae.json";
import Link from "next/link";
import { auth, authEnabled, isAdmin, signOut } from "@/auth";
import { activityEnabled, listServiceStatus, logActivity } from "@/lib/activity";
import type { Person } from "@/lib/gradation";

export default async function Page() {
  const session = authEnabled ? await auth() : null;
  if (session?.user) await logActivity(session.user, "open_app");

  let outOfService: number[] = [];
  if (session?.user && activityEnabled) {
    try {
      outOfService = (await listServiceStatus()).filter((r) => r.out_of_service).map((r) => r.slno);
    } catch (e) {
      console.error("listServiceStatus", e);
    }
  }

  return (
    <main>
      <header className="top">
        <div className="topbar">
          <h1>KSEB AE Gradation</h1>
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              {isAdmin(session.user.email) && <Link href="/admin">Admin</Link>}
              <span className="muted">{session.user.email}</span>
              <button type="submit">Sign out</button>
            </form>
          )}
        </div>
        <p>Who holds which post on a given date, and each engineer&apos;s projected career.</p>
      </header>
      {/* The list is passed from the server so it only reaches signed-in visitors, not a public JS file. */}
      <Gradation
        people={people as Person[]}
        track={!!session?.user}
        canEdit={!!session?.user && activityEnabled}
        outOfService={outOfService}
      />
      <footer className="foot">
        Projection only. Assumes promotion strictly by gradation list order and retirement at the end of the month
        the retirement age is reached. Engineers with no date of birth on record are left out.
      </footer>
    </main>
  );
}
