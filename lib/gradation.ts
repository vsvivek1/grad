export type Person = {
  slno: number;
  name: string;
  dob: string | null;
  qual: string;
  serviceStart: string | null;
  remarks: string;
};

export type Employee = Person & { retire: string | null };

export type Post = { code: string; label: string; count: number };

/** Cadre strength above AE, top post first. Everyone below these is an AE. */
export const DEFAULT_POSTS: Post[] = [
  { code: "BM", label: "Board Member", count: 4 },
  { code: "CE", label: "Chief Engineer", count: 16 },
  { code: "DCE", label: "Deputy Chief Engineer", count: 75 },
  { code: "EE", label: "Executive Engineer", count: 240 },
  { code: "AEE", label: "Asst. Executive Engineer", count: 741 },
];
export const AE_LABEL = "Assistant Engineer";
export const DEFAULT_RETIREMENT_AGE = 56;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/**
 * Retirement is on the last day of the month in which the person turns `age`.
 * Someone born on the 1st legally attains the age the day before, so they
 * retire at the end of the previous month.
 */
export function retirementDate(dob: string, age: number): string {
  let [y, m] = dob.split("-").map(Number);
  const d = Number(dob.slice(8, 10));
  y += age;
  if (d === 1) {
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return iso(y, m, lastDay(y, m));
}

export function addDays(date: string, days: number): string {
  const t = new Date(date + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + days);
  return t.toISOString().slice(0, 10);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  return `${d}-${m}-${y}`;
}

export function employees(people: Person[], retirementAge: number): Employee[] {
  return people.map((p) => ({
    ...p,
    retire: p.dob ? retirementDate(p.dob, retirementAge) : null,
  }));
}

/**
 * Counted on the list on `date` until they retire. Joining dates are ignored:
 * list order is the seniority order. Unknown DOB is left out.
 */
export function isActive(e: Employee, date: string): boolean {
  return !!e.retire && e.retire >= date;
}

/** Index into posts for a 1-based seniority rank; posts.length means AE. */
export function postIndexForRank(rank: number, posts: Post[]): number {
  let ceiling = 0;
  for (let i = 0; i < posts.length; i++) {
    ceiling += Math.max(0, posts[i].count || 0);
    if (rank <= ceiling) return i;
  }
  return posts.length;
}

export function postLabel(index: number, posts: Post[]): string {
  return index < posts.length ? posts[index].label : AE_LABEL;
}

export type SnapshotRow = Employee & { rank: number; post: number };

/** Everyone in service on `date`, in gradation order, with the post their rank gives them. */
export function snapshot(all: Employee[], date: string, posts: Post[]): SnapshotRow[] {
  const rows: SnapshotRow[] = [];
  for (const e of all) {
    if (!isActive(e, date)) continue;
    const rank = rows.length + 1;
    rows.push({ ...e, rank, post: postIndexForRank(rank, posts) });
  }
  return rows;
}

export type Segment = { post: number; from: string; to: string; rankFrom: number; rankTo: number };

/**
 * Career timeline for one person: the post they hold from each date until
 * the next change, ending on their retirement date. Rank changes the day
 * after a senior retires. Starts on the joining date when known.
 */
export function timeline(all: Employee[], slno: number, posts: Post[], fallbackStart: string = today()): Segment[] {
  const me = all.find((e) => e.slno === slno);
  if (!me || !me.retire) return [];
  const seniors = all.filter((e) => e.slno < slno && e.retire);
  // Most of the list has no joining date; then start from `fallbackStart` (today).
  const start = me.serviceStart ?? (fallbackStart < me.retire ? fallbackStart : me.retire);

  const changeDates = new Set<string>([start]);
  for (const s of seniors) {
    const gone = addDays(s.retire!, 1);
    if (gone > start && gone <= me.retire) changeDates.add(gone);
  }
  const dates = [...changeDates].sort();

  const segments: Segment[] = [];
  for (const date of dates) {
    const rank = 1 + seniors.filter((s) => isActive(s, date)).length;
    const post = postIndexForRank(rank, posts);
    const last = segments[segments.length - 1];
    if (last && last.post === post) {
      last.rankTo = rank;
      continue;
    }
    if (last) last.to = addDays(date, -1);
    segments.push({ post, from: date, to: me.retire, rankFrom: rank, rankTo: rank });
  }
  return segments;
}
