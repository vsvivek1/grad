import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { logActivity } from "@/lib/activity";

/** Login is switched on once the Google keys are set in the environment. */
export const authEnabled = !!process.env.AUTH_GOOGLE_ID;

/** Optional comma-separated list of emails allowed in. Empty means any Google account. */
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Emails that can open /admin. Set ADMIN_EMAILS (comma-separated) in the environment. */
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email?: string | null): boolean {
  return !!email && adminEmails.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/signin", error: "/signin" },
  events: {
    async signIn({ user }) {
      await logActivity(user, "sign_in");
    },
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.email) await logActivity({ email: token.email, name: token.name }, "sign_out");
    },
  },
  callbacks: {
    signIn({ profile }) {
      if (!allowedEmails.length) return true;
      // Admins always get in, even when an allow-list is set.
      return !!profile?.email && (allowedEmails.includes(profile.email.toLowerCase()) || isAdmin(profile.email));
    },
    authorized({ auth, request }) {
      if (!authEnabled || request.nextUrl.pathname.startsWith("/signin")) return true;
      return !!auth?.user;
    },
  },
});
