import Gradation from "./Gradation";
import people from "@/data/ae.json";
import { auth, authEnabled, signOut } from "@/auth";
import type { Person } from "@/lib/gradation";

export default async function Page() {
  const session = authEnabled ? await auth() : null;

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
              <span className="muted">{session.user.email}</span>
              <button type="submit">Sign out</button>
            </form>
          )}
        </div>
        <p>Who holds which post on a given date, and each engineer&apos;s projected career.</p>
      </header>
      {/* The list is passed from the server so it only reaches signed-in visitors, not a public JS file. */}
      <Gradation people={people as Person[]} />
      <footer className="foot">
        Projection only. Assumes promotion strictly by gradation list order and retirement at the end of the month
        the retirement age is reached. Engineers with no date of birth on record are left out.
      </footer>
    </main>
  );
}
