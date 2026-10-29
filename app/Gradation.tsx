"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_POSTS,
  DEFAULT_RETIREMENT_AGE,
  AE_LABEL,
  employees,
  formatDate,
  postLabel,
  snapshot,
  timeline,
  today,
  type Person,
  type Post,
} from "@/lib/gradation";

type Tab = "date" | "person";

export default function Gradation({ people }: { people: Person[] }) {
  const [tab, setTab] = useState<Tab>("date");
  const [selected, setSelected] = useState<number | null>(null);
  const openPerson = (slno: number) => {
    setSelected(slno);
    setTab("person");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [posts, setPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [age, setAge] = useState(DEFAULT_RETIREMENT_AGE);
  const all = useMemo(() => employees(people, age), [people, age]);

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
            <input type="number" min={40} max={70} value={age} onChange={(e) => setAge(Number(e.target.value) || DEFAULT_RETIREMENT_AGE)} />
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
        <ByDate all={all} posts={posts} onOpen={openPerson} />
      </div>
      <div hidden={tab !== "person"}>
        <ByPerson all={all} posts={posts} selected={selected} onSelect={setSelected} onBack={() => setTab("date")} />
      </div>
    </>
  );
}

function ByDate({ all, posts, onOpen }: { all: ReturnType<typeof employees>; posts: Post[]; onOpen: (slno: number) => void }) {
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState<number | null>(null);
  const rows = useMemo(() => (date ? snapshot(all, date, posts) : []), [all, date, posts]);

  const counts = useMemo(() => {
    const c = new Array(posts.length + 1).fill(0);
    rows.forEach((r) => c[r.post]++);
    return c;
  }, [rows, posts.length]);

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => (only === null || r.post === only) && (!q || r.name.toLowerCase().includes(q) || String(r.slno) === q));

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
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 500).map((r) => (
              <tr key={r.slno} className="clickable" onClick={() => onOpen(r.slno)} title="See this person's posts">
                <td>{r.rank}</td>
                <td>{r.slno}</td>
                <td>
                  <button className="link" onClick={() => onOpen(r.slno)}>
                    {r.name}
                  </button>
                </td>
                <td>{formatDate(r.dob)}</td>
                <td>{formatDate(r.retire)}</td>
                <td>
                  <span className={`tag p${r.post}`}>{postLabel(r.post, posts)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length > 500 && <p className="muted">Showing the first 500 of {shown.length}. Search or pick a post to narrow it down.</p>}
        {shown.length === 0 && <p className="muted">Nobody matches.</p>}
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
}: {
  all: ReturnType<typeof employees>;
  posts: Post[];
  selected: number | null;
  onSelect: (slno: number | null) => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const me = selected === null ? undefined : all.find((e) => e.slno === selected);
  const segments = useMemo(() => (me ? timeline(all, me.slno, posts) : []), [all, me, posts]);
  const now = today();
  const current = segments.find((s) => s.from <= now && s.to >= now);

  const q = query.trim().toLowerCase();
  const results = q ? all.filter((e) => e.retire && (e.name.toLowerCase().includes(q) || String(e.slno) === q)).slice(0, 30) : [];

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
                className={`link ${e.slno === selected ? "on" : ""}`}
                onClick={() => {
                  onSelect(e.slno);
                  setQuery("");
                }}
              >
                {e.name} <span className="muted">#{e.slno} · born {formatDate(e.dob)}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="muted">Nobody matches.</li>}
        </ul>
      )}

      {me && (
        <>
          <h2 className="who">{me.name}</h2>
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
              {current ? postLabel(current.post, posts) : me.retire! < now ? "Retired" : "Not yet joined"}
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
                <th>Seniority position (start → end)</th>
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
            Seniority position 1 is the senior-most engineer in service. Positions 1 to {posts.reduce((a, p) => a + (p.count || 0), 0)} hold
            posts above {AE_LABEL}.
          </p>
        </>
      )}
      {!me && !q && <p className="muted">Search for a name, or click a name in the date view.</p>}
    </section>
  );
}
