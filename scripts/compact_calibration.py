#!/usr/bin/env python3
"""compact_calibration.py — keep calibration.json short: full rows for the last KEEP_MONTHS months,
older months archived (public/data/calibration/archive/<YYYY-MM>.json) and summarised per session in
public/data/calibration-monthly.json. Summaries store COUNTS (hits/known), so totals recombine exactly.
Scoring mirrors src/lib/calibrationMetrics.ts. Idempotent; dry-run by default. Never runs git.

USAGE: python3 scripts/compact_calibration.py [--data public/data] [--keep-months 2] [--apply]
"""
import argparse, collections, datetime as dt, json, os, tempfile

SESSIONS = ["midnight", "morning", "midday", "endday"]

def _write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    with os.fdopen(fd, "w") as fh: json.dump(obj, fh, indent=2)
    os.replace(tmp, path)

def bias_dir(b):
    b = (b or "").lower()
    return "bull" if "bull" in b else "bear" if "bear" in b else "range" if ("range" in b or "neutral" in b) else None

def bias_ok(r):  # == scoreBiasCorrect
    p0, p1, d = r.get("price_at_report"), r.get("price_next_report"), bias_dir(r.get("bias"))
    if p0 is None or p1 is None or d is None: return None
    mv = p1 - p0
    return abs(mv / p0) < 0.005 if d == "range" else (mv > 0 if d == "bull" else mv < 0)

def summarise(rows, month, session):
    hk = lambda: {"hits": 0, "known": 0}
    s = {"month": month, "session": session, "rows": len(rows), "bias": hk(), "levels": hk(), "acting": hk(),
         "calls": {"bull": 0, "range": 0, "bear": 0}, "avgAbsMovePct": None}
    moves = []
    for r in rows:
        d = bias_dir(r.get("bias"))
        if d: s["calls"][d] += 1
        ok = bias_ok(r)
        if ok is not None: s["bias"]["known"] += 1; s["bias"]["hits"] += int(ok)
        for lvl, fired in (("reduce_level", "reduce_fired"), ("add_level", "add_fired")):
            if r.get(lvl) is not None and r.get(fired) is not None:
                s["levels"]["known"] += 1; s["levels"]["hits"] += int(bool(r[fired]))
        if isinstance(r.get("acting_helped"), bool):
            s["acting"]["known"] += 1; s["acting"]["hits"] += int(r["acting_helped"])
        if r.get("price_at_report") and r.get("price_next_report"):
            moves.append(abs(r["price_next_report"] / r["price_at_report"] - 1) * 100)
    if moves: s["avgAbsMovePct"] = round(sum(moves) / len(moves), 3)
    return s

def keep_from(latest_month, keep):
    y, m = map(int, latest_month.split("-"))
    m -= keep - 1
    while m <= 0: m += 12; y -= 1
    return f"{y:04d}-{m:02d}"

def run(data, keep, apply, today=None):
    cal_p = os.path.join(data, "calibration.json"); mon_p = os.path.join(data, "calibration-monthly.json")
    arch_dir = os.path.join(data, "calibration", "archive")
    rows = json.load(open(cal_p))
    latest = max([r["date"][:7] for r in rows] + [(today or dt.date.today().isoformat())[:7]])
    cutoff = keep_from(latest, keep)
    old = collections.defaultdict(list)
    for r in rows:
        if r["date"][:7] < cutoff: old[r["date"][:7]].append(r)
    recent = [r for r in rows if r["date"][:7] >= cutoff]
    monthly = json.load(open(mon_p)) if os.path.exists(mon_p) else {"schemaVersion": "1.0.0", "months": []}
    report = {"cutoff": cutoff, "rowsBefore": len(rows), "rowsAfter": len(recent),
              "monthsCompacted": sorted(old), "archived": sum(map(len, old.values()))}
    if not apply or not old:
        return report
    for month, mrows in old.items():
        ap = os.path.join(arch_dir, f"{month}.json")
        arch = json.load(open(ap)) if os.path.exists(ap) else []
        seen = {(r["date"], r["session"]) for r in arch}
        arch += [r for r in mrows if (r["date"], r["session"]) not in seen]
        arch.sort(key=lambda r: (r["date"], SESSIONS.index(r["session"]) if r["session"] in SESSIONS else 9))
        _write(ap, arch)
        monthly["months"] = [x for x in monthly["months"] if x["month"] != month]
        by = collections.defaultdict(list)
        for r in arch: by[r["session"]].append(r)
        for sess in SESSIONS:
            if by.get(sess):
                monthly["months"].append(dict(summarise(by[sess], month, sess), archive=f"data/calibration/archive/{month}.json"))
    monthly["months"].sort(key=lambda x: (x["month"], SESSIONS.index(x["session"])))
    monthly.update({"keepMonths": keep, "updatedAt": dt.datetime.now(dt.timezone(dt.timedelta(hours=-5))).isoformat(timespec="seconds")})
    # integrity: every archived row is in its archive file before calibration.json shrinks
    for month, mrows in old.items():
        keys = {(r["date"], r["session"]) for r in json.load(open(os.path.join(arch_dir, f"{month}.json")))}
        assert all((r["date"], r["session"]) in keys for r in mrows), f"archive check failed for {month}"
    _write(mon_p, monthly)
    _write(cal_p, recent)
    return report

def load_all_rows(data):
    """calibration.json + every archive month (for all-time stats)."""
    rows = []
    ad = os.path.join(data, "calibration", "archive")
    if os.path.isdir(ad):
        for f in sorted(os.listdir(ad)):
            if f.endswith(".json"): rows += json.load(open(os.path.join(ad, f)))
    return rows + json.load(open(os.path.join(data, "calibration.json")))

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--data", default="public/data")
    ap.add_argument("--keep-months", type=int, default=2); ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    rep = run(a.data, a.keep_months, a.apply)
    print(("APPLY" if a.apply else "DRY-RUN") + ": " + json.dumps(rep))
