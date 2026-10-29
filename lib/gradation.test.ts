import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_POSTS, employees, postIndexForRank, retirementDate, snapshot, timeline, type Person } from "./gradation.ts";

const people: Person[] = JSON.parse(readFileSync(new URL("../data/ae.json", import.meta.url), "utf8"));

test("retires at end of the month the age is reached", () => {
  assert.equal(retirementDate("1980-05-17", 56), "2036-05-31");
  assert.equal(retirementDate("1980-03-01", 56), "2036-02-29");
  assert.equal(retirementDate("1980-01-01", 56), "2035-12-31");
});

test("rank maps to post by cumulative cadre strength", () => {
  assert.equal(postIndexForRank(1, DEFAULT_POSTS), 0);
  assert.equal(postIndexForRank(4, DEFAULT_POSTS), 0);
  assert.equal(postIndexForRank(5, DEFAULT_POSTS), 1);
  assert.equal(postIndexForRank(4 + 14 + 68 + 220 + 679, DEFAULT_POSTS), 4);
  assert.equal(postIndexForRank(4 + 14 + 68 + 220 + 679 + 1, DEFAULT_POSTS), 5);
});

test("snapshot ranks only people in service, in list order", () => {
  const all = employees(people, 56);
  const rows = snapshot(all, "2026-10-29", DEFAULT_POSTS);
  assert.ok(rows.length > 0);
  rows.forEach((r, i) => {
    assert.equal(r.rank, i + 1);
    assert.ok(r.retire! >= "2026-10-29");
    if (i) assert.ok(r.slno > rows[i - 1].slno);
  });
});

test("timeline is contiguous, never demotes, and ends at retirement", () => {
  const all = employees(people, 56);
  for (const slno of [706, 1403, 2000, 2600]) {
    const me = all.find((e) => e.slno === slno)!;
    const segs = timeline(all, slno, DEFAULT_POSTS);
    assert.ok(segs.length > 0, `slno ${slno}`);
    assert.equal(segs.at(-1)!.to, me.retire);
    for (let i = 1; i < segs.length; i++) {
      assert.ok(segs[i].post < segs[i - 1].post);
      assert.ok(segs[i].from > segs[i - 1].to);
    }
    // Agrees with the date snapshot at every segment start.
    for (const s of segs) {
      const row = snapshot(all, s.from, DEFAULT_POSTS).find((r) => r.slno === slno);
      assert.equal(row?.post, s.post);
    }
  }
});

test("someone marked not in service is left out of the count", () => {
  const all = employees(people, 56);
  const before = snapshot(all, "2026-10-29", DEFAULT_POSTS);
  const first = before[0];
  const changed = all.map((e) => (e.slno === first.slno ? { ...e, out: true } : e));
  const after = snapshot(changed, "2026-10-29", DEFAULT_POSTS);
  assert.ok(!after.some((r) => r.slno === first.slno));
  assert.equal(after.length, before.length - 1);
});
