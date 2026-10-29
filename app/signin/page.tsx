import { redirect } from "next/navigation";
import { auth, authEnabled, signIn } from "@/auth";

const messages: Record<string, string> = {
  AccessDenied: "This Google account isn't allowed to use the site.",
};

export default async function SignIn({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = safePath(callbackUrl);
  if (!authEnabled || (await auth())?.user) redirect(redirectTo);

  return (
    <main className="signin">
      <section className="card">
        <h1>KSEB AE Gradation</h1>
        <p className="muted">Sign in to see the gradation list and career projections.</p>
        {error && <p className="error">{messages[error] ?? "Sign-in failed. Please try again."}</p>}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <button className="google" type="submit">
            Sign in with Google
          </button>
        </form>
      </section>
    </main>
  );
}

/** Only send people back to a path on this site. */
function safePath(callbackUrl?: string): string {
  if (!callbackUrl) return "/";
  try {
    const url = new URL(callbackUrl, "http://local");
    return url.pathname.startsWith("/signin") ? "/" : url.pathname + url.search;
  } catch {
    return "/";
  }
}
