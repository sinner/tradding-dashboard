import json, os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import compact_calibration as cc
D = tempfile.mkdtemp(); fails = []
def row(date, sess, bias, p0, p1, red=None, rf=None, acting=None):
    return {"date": date, "session": sess, "bias": bias, "bull_pct": 30, "range_pct": 40, "bear_pct": 30,
            "reduce_level": red, "reduce_fired": rf, "add_level": None, "add_fired": None,
            "price_at_report": p0, "price_next_report": p1, "acting_helped": acting}
rows = [row("2026-08-01", "midnight", "range", 100, 100.2, 99, True, True),
        row("2026-08-02", "midnight", "bullish", 100, 99, 98, False, False),
        row("2026-08-02", "morning", "range-bear", 100, 99),
        row("2026-09-05", "midday", "range", 100, 101),
        row("2026-10-01", "endday", "bearish", 100, 99), row("2026-11-01", "midnight", "range", 100, None)]
json.dump(rows, open(os.path.join(D, "calibration.json"), "w"))
rep = cc.run(D, 2, apply=False)
if rep["rowsAfter"] != 2 or rep["monthsCompacted"] != ["2026-08", "2026-09"]: fails.append(f"dry-run {rep}")
if len(json.load(open(os.path.join(D, "calibration.json")))) != 6: fails.append("dry-run wrote")
cc.run(D, 2, apply=True); cc.run(D, 2, apply=True)  # idempotent
cal = json.load(open(os.path.join(D, "calibration.json"))); mon = json.load(open(os.path.join(D, "calibration-monthly.json")))
arch = json.load(open(os.path.join(D, "calibration", "archive", "2026-08.json")))
if [r["date"][:7] for r in cal] != ["2026-10", "2026-11"]: fails.append(f"recent {cal}")
if len(arch) != 3: fails.append(f"archive {len(arch)}")
m = {(x["month"], x["session"]): x for x in mon["months"]}
mid = m[("2026-08", "midnight")]
if mid["rows"] != 2 or mid["bias"] != {"hits": 1, "known": 2} or mid["levels"] != {"hits": 1, "known": 2} or mid["acting"] != {"hits": 1, "known": 2}: fails.append(f"summary {mid}")
if m[("2026-08", "morning")]["bias"] != {"hits": 1, "known": 1}: fails.append("range-bear scored as bear")
if len(cc.load_all_rows(D)) != 6: fails.append("load_all_rows")
if len(mon["months"]) != 3: fails.append(f"months {len(mon['months'])}")
print("ALL TESTS PASSED" if not fails else f"FAILED: {fails}"); sys.exit(1 if fails else 0)
