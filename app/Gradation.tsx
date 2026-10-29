"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { logClientActivity, setServiceStatusAction } from "./actions";
import {
  AE_LABEL,
  DEFAULT_POSTS,
  DEFAULT_RETIREMENT_AGE,
  employees,
  formatDate,
  postLabel,
  snapshot,
  timeline,
  today,
  type Employee,
  type Person,
  type Post,
} from "@/lib/gradation";

type Track = (action: string, detail: Record<string, string | number | null>) => void;
type SetStatus = (slno: number, out: boolean) => void;
type Tab = "date" | "person";

/** Calls `fn` once `value` has stopped changing for `ms`, skipping the first render. */
function useSettled<T>(value: T, ms: number, fn: (v: T) => void) {
  const first = useRef(true);
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => cb.current(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
}

export default function Gradation({
  people,
  track: tracking = false,
  canEdit = false,
  outOfService = [],
}: {
  people: Person[];
  track?: boolean;
  canEdit?: boolean;
  outOfService?: number[];
}) {
  const track: Track = (action, detail) => {
    if (tracking) logClientActivity(action, detail).catch(() => {});
  };
  const [tab, setTab] = useState<Tab>("date");
  const [selected, setSelected] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [age, setAge] = useState(DEFAULT_RETIREMENT_AGE);
  const [oos, setOos] = useState<Set<number>>(() => new Set(outOfService));

  const select = (slno: number | null) => {
    setSelected(slno);
    const p = slno === null ? undefined : people.find((e) => e.slno === slno);
    if (p) track("view_person", { slno: p.slno, name: p.name });
  };
  const openPerson = (slno: number) => {
    select(slno);
    setTab("person");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const all = useMemo(
    () => employees(people, age).map((e) => ({ ...e, out: oos.has(e.slno) })),
    [people, age, oos],
  );

  useSettled(JSON.stringify([posts.map((p) => p.count), age]), 2000, () =>
    track("change_settings", { ...Object.fromEntries(posts.map((p) => [p.code, p.count])), retirementAge: age }),
  );

  /** Updates the view at once, saves in the background, and undoes it if saving fails. */
  const setStatus: SetStatus = (slno, out) => {
    const apply = (value: boolean) =>
      setOos((prev) => {
        const next = new Set(prev);
        if (value) next.add(slno);
        else next.delete(slno);
        return next;
      });
    apply(out);
    setServiceStatusAction(slno, out).catch(() => {
      apply(!out);
      window.alert("That change wasn't saved. Please sign in and try again.");
    });
  };

  return (
    <>
      <section className="card settings">
        <h2>Settings</h2>
        <div className="grid">
          {posts.map((p, i) => (
            <label key={p.code}>
              {p.label}
              <input
                type="number"
                min={0}
                value={p.count}
                onChange={(e) => {
                  const next = posts.slice();
                  next[i] = { ...p, count: Number(e.target.value) };
                  setPosts(next);
                }}
              />
            </label>
          ))}
          <label>
            Retirement age
            <input
              type="number"
              min={40}
              max={70}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || DEFAULT_RETIREMENT_AGE)}
            />
          </label>
        </div>
      </section>

      <nav className="tabs">
        <button className={tab === "date" ? "on" : ""} onClick={() => setTab("date")}>
          On a date
        </button>
        <button className={tab === "person" ? "on" : ""} onClick={() => setTab("person")}>
          One person
        </button>
      </nav>

      {/* Both stay mounted so the date view keeps its filters when you come back. */}
      <div hidden={tab !== "date"}>
        <ByDate all={all} posts={posts} onOpen={openPerson} track={track} onStatus={setStatus} canEdit={canEdit} />
      </div>
      <div hidden={tab !== "person"}>
        <ByPerson
          all={all}
          posts={posts}
          selected={selected}
          onSelect={select}
          onBack={() => setTab("date")}
          onStatus={setStatus}
          canEdit={canEdit}
        />
      </div>
    </>
  );
}

function ByDate({
  all,
  posts,
  onOpen,
  track,
  onStatus,
  canEdit,
}: {
  all: Employee[];
  posts: Post[];
  onOpen: (slno: number) => void;
  track: Track;
  onStatus: SetStatus;
  canEdit: boolean;
}) {
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState<number | null>(null);
  useSettled(date, 1500, (d) => d && track("change_date", { date: d }));
  useSettled(query.trim(), 1500, (q) => q.length >= 3 && track("search", { query: q }));

  const rows = useMemo(() => (date ? snapshot(all, date, posts) : []), [all, date, posts]);
  const outRows = useMemo(
    () => all.filter((e) => e.out && !!e.retire && e.retire >= date),
    [all, date],
  );

  const counts = useMemo(() => {
    const c = new Array(posts.length + 1).fill(0);
    rows.forEach((r) => c[r.post]++);
    return c;
  }, [rows, posts.length]);

  const q = query.trim().toLowerCase();
  const match = (name: string, slno: number) => !q || name.toLowerCase().includes(q) || String(slno) === q;
  const shownRows = rows.filter((r) => (only === null || r.post === only) && match(r.name, r.slno)).slice(0, 500);
  const shownOut = only === null ? outRows.filter((r) => match(r.name, r.slno)) : [];

  const actionButton = (slno: number, out: boolean) => (
    <td>
      <button
        className="action"
        disabled={!canEdit}
        title={canEdit ? undefined : "Sign in to change this"}
        onClick={(e) => {
          e.stopPropagation();
          onStatus(slno, !out);
        }}
      >
        {out ? "Restore" : "Not in service"}
      </button>
    </td>
  );

  return (
    <section className="card">
      <div className="row">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="grow">
          Search name or Sl No
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Vivek" />
        </label>
      </div>

      <div className="chips">
        <button className={only === null ? "on" : ""} onClick={() => setOnly(null)}>
          All <b>{rows.length}</b>
        </button>
        {counts.map((n, i) => (
          <button key={i} className={`${only === i ? "on" : ""} p${i}`} onClick={() => setOnly(only === i ? null : i)}>
            {postLabel(i, posts)} <b>{n}</b>
          </button>
        ))}
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Seniority position</th>
              <th>Sl No</th>
              <th>Name</th>
              <th>Born</th>
              <th>Retires</th>
              <th>Post on {formatDate(date)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shownRows.map((r) => (
              <tr key={r.slno} className="clickable" onClick={() => onOpen(r.slno)} title="See this person's posts">
                <td>{r.rank}</td>
                <td>{r.slno}</td>
                <td>
                  <button
                    className="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(r.slno);
                    }}
                  >
                    {r.name}
                  </button>
                </td>
                <td>{formatDate(r.dob)}</td>
                <td>{formatDate(r.retire)}</td>
                <td>
                  <span className={`tag p${r.post}`}>{postLabel(r.post, posts)}</span>
                </td>
                {actionButton(r.slno, false)}
              </tr>
            ))}
            {shownOut.map((r) => (
              <tr key={`out-${r.slno}`} className="out clickable" onClick={() => onOpen(r.slno)} title="See this person's posts">
                <td>—</td>
                <td>{r.slno}</td>
                <td>{r.name}</td>
                <td>{formatDate(r.dob)}</td>
                <td>{formatDate(r.retire)}</td>
                <td>
                  <span className="tag out-tag">Not in service</span>
                </td>
                {actionButton(r.slno, true)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 500 && (
          <p className="muted">Showing the first 500 matches. Search or pick a post to narrow it down.</p>
        )}
        {shownRows.length + shownOut.length === 0 && <p className="muted">Nobody matches.</p>}
        {outRows.length > 0 && (
          <p className="muted">
            {outRows.length} marked not in service on this date. They are left out of the seniority count.
          </p>
        )}
      </div>
    </section>
  );
}

function ByPerson({
  all,
  posts,
  selected,
  onSelect,
  onBack,
  onStatus,
  canEdit,
}: {
  all: Employee[];
  posts: Post[];
  selected: number | null;
  onSelect: (slno: number | null) => void;
  onBack: () => void;
  onStatus: SetStatus;
  canEdit: boolean;
}) {
  const [query, setQuery] = useState("");
  const me = selected === null ? undefined : all.find((e) => e.slno === selected);
  const segments = useMemo(() => (me ? timeline(all, me.slno, posts) : []), [all, me, posts]);
  const now = today();
  const current = segments.find((s) => s.from <= now && s.to >= now);

  const q = query.trim().toLowerCase();
  const results = q
    ? all.filter((e) => e.retire && (e.name.toLowerCase().includes(q) || String(e.slno) === q)).slice(0, 30)
    : [];

  return (
    <section className="card">
      <div className="row">
        <button onClick={onBack}>← Back to date view</button>
      </div>
      <label>
        Search name or Sl No
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing a name…" />
      </label>
      {q && (
        <ul className="results">
          {results.map((e) => (
            <li key={e.slno}>
              <button
                className={`link ${e.out ? "out" : ""} ${e.slno === selected ? "on" : ""}`}
                onClick={() => {
                  onSelect(e.slno);
                  setQuery("");
                }}
              >
                {e.name}{" "}
                <span className="muted">
                  #{e.slno} · born {formatDate(e.dob)}
                  {e.out ? " · not in service" : ""}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="muted">Nobody matches.</li>}
        </ul>
      )}

      {me && (
        <>
          <div className="who-row">
            <h2 className={`who ${me.out ? "out" : ""}`}>{me.name}</h2>
            <button className="action" disabled={!canEdit} title={canEdit ? undefined : "Sign in to change this"} onClick={() => onStatus(me.slno, !me.out)}>
              {me.out ? "Restore to service" : "Mark not in service"}
            </button>
          </div>
          {me.out && (
            <p className="notice">
              Marked not in service. They are left out of the seniority count for everyone else. The timeline below shows
              what would happen if they were in service.
            </p>
          )}
          <div className="facts">
            <div>
              <span>Sl No</span>
              {me.slno}
            </div>
            <div>
              <span>Born</span>
              {formatDate(me.dob)}
            </div>
            <div>
              <span>Joined</span>
              {me.serviceStart ? formatDate(me.serviceStart) : "Not on record"}
            </div>
            <div>
              <span>Retires</span>
              {formatDate(me.retire)}
            </div>
            <div>
              <span>Now</span>
              {me.out
                ? "Not in service"
                : current
                  ? postLabel(current.post, posts)
                  : me.retire! < now
                    ? "Retired"
                    : "Not yet joined"}
            </div>
            <div>
              <span>Highest post</span>
              {segments.length ? postLabel(segments[segments.length - 1].post, posts) : "—"}
            </div>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>From</th>
                  <th>Until</th>
                  <th>Seniority position</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.from} className={s === current ? "current" : s.to < now ? "past" : ""}>
                    <td>
                      <span className={`tag p${s.post}`}>{postLabel(s.post, posts)}</span>
                    </td>
                    <td>{formatDate(s.from)}</td>
                    <td>{formatDate(s.to)}</td>
                    <td>{s.rankFrom === s.rankTo ? s.rankFrom : `${s.rankFrom} → ${s.rankTo}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">
            {!me.serviceStart && "No joining date on record, so the timeline starts today. "}
            Seniority position 1 is the senior-most engineer in service. Positions 1 to{" "}
            {posts.reduce((a, p) => a + (p.count || 0), 0)} hold posts above {AE_LABEL}.
          </p>
        </>
      )}
      {!me && !q && <p className="muted">Search for a name, or click a name in the date view.</p>}
    </section>
  );
}
