import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/** Login is switched on once the Google keys are set in the environment. */
export const authEnabled = !!process.env.AUTH_GOOGLE_ID;

/** Optional comma-separated list of emails allowed in. Empty means any Google account. */
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    signIn({ profile }) {
      if (!allowedEmails.length) return true;
      return !!profile?.email && allowedEmails.includes(profile.email.toLowerCase());
    },
    authorized({ auth, request }) {
      if (!authEnabled || request.nextUrl.pathname.startsWith("/signin")) return true;
      return !!auth?.user;
    },
  },
});
