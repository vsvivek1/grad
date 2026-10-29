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
