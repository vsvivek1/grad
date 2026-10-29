"""Extract the `ae` gradation list from the legacy MySQL dump into data/ae.json.

Run: python3 scripts/extract-ae.py
"""
import json, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
sql = (root / "legacy-php" / "gradation.sql").read_text(encoding="latin-1")
block = sql.split("INSERT INTO `log`")[0]

S = r"'((?:[^'\\]|\\.|'')*)'"
row_re = re.compile(r"^\((\d+), " + ", ".join([S] * 7) + r"\)[,;]$")

def text(x):
    return x.replace("''", "'").replace("\\'", "'").strip()

def date(x):
    x = text(x)
    ok = re.match(r"^\d{4}-\d\d-\d\d$", x) and not x.startswith(("0000", "1900")) and not x.endswith("-00")
    return x if ok else None

rows = []
for line in block.splitlines():
    m = row_re.match(line.strip())
    if not m:
        continue
    slno, name, dob, qual, start, _app, remarks, _psc = m.groups()
    name = text(name)
    if not name:
        continue
    r = text(remarks)
    rows.append({
        "slno": int(slno),
        "name": name,
        "dob": date(dob),
        "qual": text(qual),
        "serviceStart": date(start),
        "remarks": "" if (date(r) or r.startswith("1900")) else r,
    })

rows.sort(key=lambda r: r["slno"])
out = root / "data" / "ae.json"
out.write_text(json.dumps(rows, separators=(",", ":"), ensure_ascii=False))
print(f"wrote {len(rows)} rows to {out}")
