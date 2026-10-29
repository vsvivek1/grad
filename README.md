# KSEB AE Gradation

Next.js app for the KSEB Assistant Engineer gradation list. Deployed on Vercel.

- **On a date**: pick any date to see everyone in service and the post their seniority gives them.
- **One person**: pick an engineer to see each post they are projected to hold, from when until when, up to retirement.

Cadre strengths (Board Member, CE, Dy CE, EE, AEE) and retirement age are editable on the page.

## How the projection works

- Seniority is the order of the gradation list (`slno`).
- Retirement is on the last day of the month the retirement age (default 56) is reached.
- On any date, the people still in service are ranked in list order. The top N₁ are Board Members, the next N₂ Chief Engineers, and so on. Everyone below is an AE.
- Engineers with no date of birth on record are left out.

## Data

`data/ae.json` is extracted from the old MySQL dump with `python3 scripts/extract-ae.py`. To update the list, replace that file (same fields) and redeploy.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # projection logic tests
npm run build
```

The original PHP app is kept in `legacy-php/` for reference.


## Google login

The site asks visitors to sign in with Google once these environment variables are set (in Vercel, or `.env.local` for local work):

- `AUTH_SECRET`: a random string (`npx auth secret` makes one)
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: from a Google Cloud OAuth client (type "Web application") with redirect URI `https://<your-domain>/api/auth/callback/google`
- `ALLOWED_EMAILS` (optional): comma-separated emails allowed in. Leave it empty to let any Google account in.

Without `AUTH_GOOGLE_ID` the site is open.

## Admin and activity log

Signed-in activity (sign in/out, opening the app, people viewed, dates and searches, post-count changes) is logged to a Supabase table. Admins see it at `/admin`.

- `ADMIN_EMAILS`: comma-separated emails that can open `/admin`
- `SUPABASE_URL`, `SUPABASE_KEY` (publishable key), `SUPABASE_LOG_TOKEN`: the log table is closed to direct access; the server calls the `log_activity`, `read_activity` and `activity_users` functions, which check the token stored in `private.app_token`. See `supabase/activity_log.sql`.
