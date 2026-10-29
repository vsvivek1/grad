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
  type Post,
} from "@/lib/gradation";
import people from "@/data/ae.json";

type Tab = "date" | "person";

export default function Gradation() {
  const [tab, setTab] = useState<Tab>("date");
  const [posts, setPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [age, setAge] = useState(DEFAULT_RETIREMENT_AGE);
  const all = useMemo(() => employees(people, age), [age]);

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

      {tab === "date" ? <ByDate all={all} posts={posts} /> : <ByPerson all={all} posts={posts} />}
    </>
  );
}

function ByDate({ all, posts }: { all: ReturnType<typeof employees>; posts: Post[] }) {
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
              <th>Rank</th>
              <th>Sl No</th>
              <th>Name</th>
              <th>Born</th>
              <th>Retires</th>
              <th>Post on {formatDate(date)}</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 500).map((r) => (
              <tr key={r.slno}>
                <td>{r.rank}</td>
                <td>{r.slno}</td>
                <td>{r.name}</td>
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

function ByPerson({ all, posts }: { all: ReturnType<typeof employees>; posts: Post[] }) {
  const options = useMemo(() => all.filter((e) => e.retire).map((e) => ({ slno: e.slno, text: `${e.name} (#${e.slno})` })), [all]);
  const [text, setText] = useState("");
  const match = options.find((o) => o.text === text) ?? options.find((o) => String(o.slno) === text.trim());
  const me = match ? all.find((e) => e.slno === match.slno) : undefined;
  const segments = useMemo(() => (me ? timeline(all, me.slno, posts) : []), [all, me, posts]);
  const now = today();
  const current = segments.find((s) => s.from <= now && s.to >= now);

  return (
    <section className="card">
      <label>
        Name or Sl No
        <input list="people" value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing a name…" />
        <datalist id="people">
          {options.map((o) => (
            <option key={o.slno} value={o.text} />
          ))}
        </datalist>
      </label>

      {me && (
        <>
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

          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>From</th>
                <th>Until</th>
                <th>Rank</th>
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
          <p className="muted">
            {!me.serviceStart && "No joining date on record, so the timeline starts today. "}
            Rank 1 is the senior-most engineer in service. The top {posts.reduce((a, p) => a + (p.count || 0), 0)} ranks hold
            posts above {AE_LABEL}.
          </p>
        </>
      )}
      {!me && text && <p className="muted">Pick a name from the list.</p>}
    </section>
  );
}
