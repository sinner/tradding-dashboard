#!/usr/bin/env python3
"""
paper_wallet.py — deterministic ledger for the BTC Paper Desk game.

The LLM (a scheduled session) only decides the trade and verifies the price;
THIS script does all the math and writes public/data/portfolio.json.

USAGE
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json \
    --intent /tmp/tradding-dashboard/morning-20261014/intent.json

  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --print      # show state, no changes
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --context    # compact session context (read-only)
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --compact    # archive old lessons
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --digest d.json  # weekly lesson digest

RISK RULES (enforced, exit 2): fut_open/flip need a stop on the right side, >= MIN_STOP_PCT away,
and size*stopDistance <= MAX_RISK_PCT * equity. Leverage <= MAX_LEVERAGE.
SPOT STOP: intent "spotStop": {"price": n, "fraction": 0..1} rests a stop on the spot book; the next
run sells that fraction at the stop if sessionLow <= stop (autoExits reason SPOT_STOP). null clears it.

INTENT JSON (produced by the session)
{
  "session":   "midnight|morning|midday|endday",   # required
  "reportId":  "2026-07-25-midnight",               # optional
  "ts":        "2026-07-25T02:05:00-04:00",         # required (snapshot time)
  "today":     "2026-07-25",                        # required (date for the expense check)
  "markPrice": 64000,                               # required, VERIFIED spot; the script never invents it
  "sessionHigh": 64500,                             # optional verified range since last snapshot (SL/TP resolution)
  "sessionLow":  63500,
  "isSeeder":  true,                                # this session may INIT the wallet if missing (midnight only)
  "rationale": "free text (English)",               # optional; auto-filled if omitted
  "message":   {"to":"morning","text":"..."},       # optional hand-off note
  "lesson":    {"pattern":"...","insight":"..."},    # optional learned pattern
  "spotStop":  {"price": 71800, "fraction": 1.0},    # optional resting spot stop (null clears)
  "decision": {
     "type": "hold|skip|spot_buy|spot_sell|fut_open|fut_reduce|fut_close|fut_flip",
     "usd":  <spot_buy: cash USD -> BTC>,
     "btc":  <spot_sell: BTC to sell>,   "fraction": <spot_sell or fut_reduce: 0..1>,
     "side": "long|short", "sizeUsd": <fut notional>, "leverage": <1..5>,
     "stop": <num|null>, "tp": [<num>...]            # fut_open / fut_flip
  }
}

OUTPUT: rewrites portfolio.json (atomic) with a new snapshot appended; prints a one-line summary.
Exit codes: 0 ok · 2 rule violation (e.g. 3rd skip in a row) · 3 bad input / missing seeder.
NO FEES, NO TAXES — net PnL only. Never runs git.
"""
import argparse, json, os, sys, tempfile, datetime as dt

SWEEP = 0.20           # 20% of realized gains -> savings
MONTHLY_EXPENSE = 30.0
PER_SESSION_QUOTA = 7.5
MAX_LEVERAGE = 5      # aggressive mode (raised from 3 on 2026-11-11 at the user's request)
MAX_RISK_PCT = 0.03   # max loss-at-stop per futures trade, as a fraction of equity
MIN_STOP_PCT = 0.006  # stops tighter than 0.6% of entry are noise (history: 0.4-0.7% stops kept getting hit)
LESSONS_KEEP = 40     # safety cap; the Sunday --digest normally archives each week's lessons
MESSAGES_DAYS = 5     # hand-off notes older than this (vs the newest snapshot) are pruned
ARCHIVE_PATH = None   # set in main(): <portfolio dir>/lessons-archive.json
# goals (2026-11-11): beat buy&hold, expectancy >= +0.3R/trade, futures participation >= 40%,
# drawdown brake: net worth >= 20% under the round's peak -> risk cap halves until recovered
GOAL_EXPECTANCY_R = 0.3
GOAL_PARTICIPATION = 0.40
DRAWDOWN_BRAKE = 0.20
GOAL_WINDOW_DAYS = 7
SESSIONS = ["midnight", "morning", "midday", "endday"]

def r2(x): return round(float(x) + 0.0, 2)
def r8(x): return round(float(x) + 0.0, 8)

# ---------- date helpers ----------
def first_of_next_month(dstr):
    d = dt.date.fromisoformat(dstr[:10])
    return (dt.date(d.year + (d.month == 12), 1 if d.month == 12 else d.month + 1, 1)).isoformat()

# ---------- books ----------
def empty_futures():
    return {"side": "flat", "sizeUsd": 0.0, "btc": None, "leverage": 1, "entryPrice": None,
            "marginUsd": 0.0, "stopPrice": None, "liquidationPrice": None,
            "takeProfit": [], "unrealizedPnlUsd": 0.0}

def liq_price(side, entry, lev):
    if not entry or lev <= 1:  # spot-like / no leverage -> effectively none for lev 1
        if lev <= 1: return None
    return r2(entry * (1 - 1/lev)) if side == "long" else r2(entry * (1 + 1/lev))

def fut_upnl(fut, mark):
    if fut["side"] == "flat" or not fut.get("entryPrice"):
        return 0.0
    btc = abs(fut["btc"] or 0.0)
    if fut["side"] == "long":
        return r2((mark - fut["entryPrice"]) * btc)
    return r2((fut["entryPrice"] - mark) * btc)

def mark(port, mp):
    s = port["_snap"]
    sp = s["spot"]
    sp["valueUsd"] = r2((sp.get("btc") or 0.0) * mp)
    f = s["futures"]
    f["unrealizedPnlUsd"] = fut_upnl(f, mp)
    equity = r2(s["cashUsd"] + sp["valueUsd"] + f["marginUsd"] + f["unrealizedPnlUsd"])
    s["equityUsd"] = equity
    s["savingsUsd"] = r2(port["savingsUsd"])
    s["netWorthUsd"] = r2(equity + port["savingsUsd"])
    return equity

def realize(port, pnl):
    """Bank realized PnL to cash; sweep 20% of positive PnL to savings. Returns dict for logging."""
    s = port["_snap"]
    swept = 0.0
    if pnl > 0:
        swept = r2(pnl * SWEEP)
        port["savingsUsd"] = r2(port["savingsUsd"] + swept)
        s["cashUsd"] = r2(s["cashUsd"] + (pnl - swept))
    else:
        s["cashUsd"] = r2(s["cashUsd"] + pnl)
    s["realizedPnlUsd"] = r2(s["realizedPnlUsd"] + pnl)
    s["sweptToSavingsUsd"] = r2((s.get("sweptToSavingsUsd") or 0.0) + swept) if swept else s.get("sweptToSavingsUsd")
    return swept

def close_futures(port, price):
    """Close the whole futures position at `price`; realize net PnL, return margin+pnl to cash."""
    s = port["_snap"]; f = s["futures"]
    if f["side"] == "flat":
        return 0.0
    btc = abs(f["btc"] or 0.0)
    pnl = r2((price - f["entryPrice"]) * btc) if f["side"] == "long" else r2((f["entryPrice"] - price) * btc)
    s["cashUsd"] = r2(s["cashUsd"] + f["marginUsd"])   # return collateral
    realize(port, pnl)                                  # bank pnl (+sweep)
    s["futures"] = empty_futures()
    return pnl

def resolve_sltp(fut, low, high):
    """Return (exit_price, reason) if the inherited position was hit within [low,high], else None.
    Worst-case: stop/liquidation take priority over take-profit."""
    if fut["side"] == "flat" or low is None or high is None:
        return None
    side, entry = fut["side"], fut["entryPrice"]
    stop, liq, tps = fut.get("stopPrice"), fut.get("liquidationPrice"), fut.get("takeProfit") or []
    if side == "long":
        if liq is not None and low <= liq: return (liq, "LIQUIDATED")
        if stop is not None and low <= stop: return (stop, "STOPPED_OUT")
        hit = [t for t in tps if high >= t]
        if hit: return (min(hit), "TP")     # first tp above entry reached
    else:
        if liq is not None and high >= liq: return (liq, "LIQUIDATED")
        if stop is not None and high >= stop: return (stop, "STOPPED_OUT")
        hit = [t for t in tps if low <= t]
        if hit: return (max(hit), "TP")
    return None

# ---------- expenses / bankruptcy ----------
def bankrupt(port, snap, owed):
    """Insolvent: FLATTEN everything to cash at mark, pay what we can, and FREEZE.
    Does NOT reset — only the next midnight session (revive) reseeds to 100 flat."""
    mp = snap["markPrice"]
    pool_before = r2(port["savingsUsd"] + snap["equityUsd"])
    close_futures(port, mp)                       # forced-close futures at mark
    sp = snap["spot"]
    if (sp.get("btc") or 0.0) > 0:                # liquidate spot to cash (no sweep on a forced exit)
        snap["cashUsd"] = r2(snap["cashUsd"] + sp["btc"] * mp)
        snap["spot"] = {"btc": 0.0, "avgEntry": None, "costBasisUsd": 0.0, "valueUsd": 0.0}
    pay_sav = min(port["savingsUsd"], owed)       # pay what we can: savings first, then cash
    port["savingsUsd"] = r2(port["savingsUsd"] - pay_sav)
    snap["cashUsd"] = r2(max(0.0, snap["cashUsd"] - (owed - pay_sav)))
    port["bankruptcies"] = int(port.get("bankruptcies", 0)) + 1
    port["status"] = "bankrupt"
    port["bankruptSince"] = snap["ts"]
    port.setdefault("hallOfShame", []).append({
        "ts": snap["ts"], "round": int(port.get("round", 1)), "session": snap["session"],
        "equityBefore": r2(snap["equityUsd"]), "shortfallUsd": r2(max(0.0, owed - pool_before)),
        "reason": "Could not cover the monthly cost of living — savings + equity fell below what was owed. Wallet flattened and FROZEN until the next midnight restart.",
        "lesson": "Keep a fatter savings buffer and cut risk before month-end; a leveraged drawdown into the 1st is what kills the wallet.",
    })

def apply_expenses(port, today):
    """Charge every due monthly expense on/after nextChargeAt. Bankruptcy if uncovered."""
    exp = port.get("expenses")
    if not exp:
        return None
    events = []
    guard = 0
    while exp.get("nextChargeAt") and today >= exp["nextChargeAt"][:10] and guard < 24:
        guard += 1
        s = port["_snap"]
        owed = float(exp.get("monthlyUsd", MONTHLY_EXPENSE))
        pool = port["savingsUsd"] + s["equityUsd"]
        if pool + 1e-9 < owed:
            bankrupt(port, s, owed)
            events.append("BANKRUPTCY")
            # advance the charge pointer so a later revive doesn't re-owe this date
            exp["lastChargeAt"] = exp["nextChargeAt"]
            exp["nextChargeAt"] = first_of_next_month(exp["nextChargeAt"])
            break
        # pay from savings first, then cash
        pay_sav = min(port["savingsUsd"], owed)
        port["savingsUsd"] = r2(port["savingsUsd"] - pay_sav)
        rest = owed - pay_sav
        s["cashUsd"] = r2(s["cashUsd"] - rest)
        exp["totalPaidUsd"] = r2(float(exp.get("totalPaidUsd", 0.0)) + owed)
        exp["lastChargeAt"] = exp["nextChargeAt"]
        exp["nextChargeAt"] = first_of_next_month(exp["nextChargeAt"])
        events.append("EXPENSE")
    return events or None

# ---------- decisions ----------
def apply_decision(port, d, mp):
    s = port["_snap"]; realized_before = s["realizedPnlUsd"]
    t = d.get("type", "hold")
    action = "HOLD"
    if t == "hold":
        action = "HOLD"
    elif t == "skip":
        action = "SKIP"
    elif t == "spot_buy":
        usd = min(float(d.get("usd", 0.0)), s["cashUsd"])
        if usd > 0:
            add_btc = usd / mp
            sp = s["spot"]
            new_btc = (sp.get("btc") or 0.0) + add_btc
            sp["costBasisUsd"] = r2((sp.get("costBasisUsd") or 0.0) + usd)
            sp["avgEntry"] = r2(sp["costBasisUsd"] / new_btc) if new_btc else None
            sp["btc"] = r8(new_btc)
            s["cashUsd"] = r2(s["cashUsd"] - usd)
            action = "ADD"
    elif t == "spot_sell":
        sp = s["spot"]; held = sp.get("btc") or 0.0
        sell = float(d["btc"]) if d.get("btc") is not None else held * float(d.get("fraction", 0))
        sell = min(sell, held)
        if sell > 0:
            avg = sp.get("avgEntry") or mp
            proceeds = sell * mp
            cost = sell * avg
            s["cashUsd"] = r2(s["cashUsd"] + cost)        # return principal (cost basis) to cash
            realize(port, r2(proceeds - cost))            # bank realized net gain (+20% sweep) to cash
            new_btc = held - sell
            sp["btc"] = r8(new_btc)
            sp["costBasisUsd"] = r2(avg * new_btc)
            sp["avgEntry"] = avg if new_btc > 0 else None
            action = "REDUCE"
    elif t in ("fut_open", "fut_flip"):
        if t == "fut_flip":
            close_futures(port, mp)
        f = s["futures"]
        if f["side"] != "flat":
            raise SystemExit("fut_open on an open position; use fut_add/fut_reduce/fut_close or fut_flip")
        side = d["side"]; size = float(d["sizeUsd"]); lev = max(1, min(MAX_LEVERAGE, int(d.get("leverage", 1))))
        stop = d.get("stop")
        if stop is None:
            print("RULE: fut_open/fut_flip requires a stop."); sys.exit(2)
        stop = float(stop)
        if (side == "long" and stop >= mp) or (side == "short" and stop <= mp):
            print(f"RULE: stop {stop} is on the wrong side of entry {mp} for a {side}."); sys.exit(2)
        dist = abs(mp - stop) / mp
        if dist < MIN_STOP_PCT:
            print(f"RULE: stop distance {dist*100:.2f}% < {MIN_STOP_PCT*100:.1f}% minimum (use >= 1x 4H ATR)."); sys.exit(2)
        rp, _dd = effective_risk_pct(port, s["netWorthUsd"] or (s["equityUsd"] + port["savingsUsd"]))
        max_risk = r2(rp * max(s["equityUsd"], 0.0))
        risk = r2(size * dist)
        if risk > max_risk + 0.01:
            print(f"RULE: risk at stop {risk} USDT > {MAX_RISK_PCT*100:.0f}% of equity ({max_risk}); size <= {r2(max_risk/dist)} notional."); sys.exit(2)
        margin = r2(size / lev)
        if margin > s["cashUsd"] + 1e-9:
            raise SystemExit(f"insufficient cash for margin {margin} (cash {s['cashUsd']})")
        s["cashUsd"] = r2(s["cashUsd"] - margin)
        btc = size / mp
        f.update({"side": side, "sizeUsd": r2(size), "btc": r8(btc if side == "long" else -btc),
                  "leverage": lev, "entryPrice": r2(mp), "marginUsd": margin,
                  "stopPrice": d.get("stop"), "liquidationPrice": liq_price(side, mp, lev),
                  "takeProfit": list(d.get("tp") or []), "riskUsd": round(size * dist, 4)})
        action = "OPEN_LONG" if side == "long" else "OPEN_SHORT"
        if t == "fut_flip":
            action = "FLIP"
    elif t == "fut_reduce":
        f = s["futures"]
        if f["side"] != "flat":
            frac = max(0.0, min(1.0, float(d.get("fraction", 0))))
            if frac >= 0.999:
                close_futures(port, mp); action = "CLOSE"
            elif frac > 0:
                btc = abs(f["btc"]); part = btc * frac
                pnl = r2((mp - f["entryPrice"]) * part) if f["side"] == "long" else r2((f["entryPrice"] - mp) * part)
                ret_margin = r2(f["marginUsd"] * frac)
                s["cashUsd"] = r2(s["cashUsd"] + ret_margin)
                realize(port, pnl)
                f["sizeUsd"] = r2(f["sizeUsd"] * (1 - frac))
                f["btc"] = r8(f["btc"] * (1 - frac))
                f["marginUsd"] = r2(f["marginUsd"] - ret_margin)
                action = "REDUCE"
    elif t == "fut_close":
        if s["futures"]["side"] != "flat":
            close_futures(port, mp); action = "CLOSE"
    else:
        raise SystemExit(f"unknown decision.type {t!r}")
    return action, r2(s["realizedPnlUsd"] - realized_before)

# ---------- main run ----------
def init_wallet(intent):
    today = intent["today"]; nx = first_of_next_month(today)
    snap = {"ts": intent["ts"], "session": intent["session"], "reportId": intent.get("reportId"),
            "markPrice": r2(intent["markPrice"]), "action": "INIT",
            "spot": {"btc": 0.0, "avgEntry": None, "costBasisUsd": 0.0, "valueUsd": 0.0},
            "futures": empty_futures(), "cashUsd": 100.0, "savingsUsd": 0.0,
            "realizedPnlUsd": 0.0, "unrealizedPnlUsd": 0.0, "equityUsd": 100.0,
            "netWorthUsd": 100.0, "sweptToSavingsUsd": None, "consecutiveSkips": 0,
            "rationale": intent.get("rationale", "Wallet seeded at 100 USDT, flat.")}
    return {"schemaVersion": "1.0.0", "baseCurrency": "USDT", "initialCapitalUsd": 100.0,
            "startedAt": intent["ts"], "updatedAt": intent["ts"], "savingsUsd": 0.0,
            "round": 1, "bankruptcies": 0, "status": "active",
            "expenses": {"monthlyUsd": MONTHLY_EXPENSE, "cadence": "monthly",
                         "perSessionQuotaUsd": PER_SESSION_QUOTA, "graceUntil": nx,
                         "nextChargeAt": nx, "lastChargeAt": None, "totalPaidUsd": 0.0, "note": ""},
            "latest": snap, "history": [snap],
            "scoreboard": [{"session": s, "decisions": 0, "attributedPnlUsd": 0.0, "wins": 0,
                            "losses": 0, "quotaUsd": PER_SESSION_QUOTA, "quotaCoveredUsd": 0.0,
                            "skips": 0, "note": None} for s in SESSIONS],
            "hallOfShame": [], "lessons": [], "messages": []}

def sb(port, session):
    for row in port["scoreboard"]:
        if row["session"] == session: return row
    row = {"session": session, "decisions": 0, "attributedPnlUsd": 0.0, "wins": 0, "losses": 0,
           "quotaUsd": PER_SESSION_QUOTA, "quotaCoveredUsd": 0.0, "skips": 0, "note": None}
    port["scoreboard"].append(row); return row

def _msg_lesson(port, snap, intent):
    if intent.get("message"):
        m = intent["message"]; port.setdefault("messages", []).append(
            {"ts": snap["ts"], "from": snap["session"], "to": m.get("to", "all"), "text": m["text"]})
    prune_messages(port, snap["ts"])
    if intent.get("lesson"):
        l = intent["lesson"]; port.setdefault("lessons", []).append(
            {"ts": snap["ts"], "session": snap["session"], "pattern": l["pattern"], "insight": l["insight"]})
    compact_lessons(port)

def prune_messages(port, now_ts):
    cutoff = dt.datetime.fromisoformat(now_ts) - dt.timedelta(days=MESSAGES_DAYS)
    port["messages"] = [m for m in port.get("messages") or [] if dt.datetime.fromisoformat(m["ts"]) >= cutoff]

def add_digest(port, dg):
    """Store a weekly digest and move that week's raw lessons to the archive (idempotent per weekStart)."""
    for k in ("weekStart", "weekEnd", "patterns"):
        if not dg.get(k): raise SystemExit(f"digest missing {k}")
    if not (1 <= len(dg["patterns"]) <= 6): raise SystemExit("digest needs 1-6 patterns")
    ws, we = dg["weekStart"][:10], dg["weekEnd"][:10]
    inweek = [l for l in port.get("lessons") or [] if ws <= l["ts"][:10] <= we]
    port["lessons"] = [l for l in port.get("lessons") or [] if not (ws <= l["ts"][:10] <= we)]
    if inweek and ARCHIVE_PATH:
        arch = json.load(open(ARCHIVE_PATH)) if os.path.exists(ARCHIVE_PATH) else []
        _write_json(ARCHIVE_PATH, arch + inweek)
    ds = [d for d in port.get("lessonDigests") or [] if d.get("weekStart", "")[:10] != ws]
    entry = {"weekStart": ws, "weekEnd": we, "title": dg.get("title"),
             "patterns": [{"pattern": p["pattern"], "insight": p["insight"]} for p in dg["patterns"]],
             "stats": dg.get("stats"), "lessonCount": dg.get("lessonCount", len(inweek)),
             "createdAt": dg.get("createdAt")}
    port["lessonDigests"] = sorted(ds + [entry], key=lambda d: d["weekStart"])
    return len(inweek)

def compact_lessons(port, keep=LESSONS_KEEP):
    """Keep the newest `keep` lessons in portfolio.json; append the overflow to lessons-archive.json."""
    ls = port.get("lessons") or []
    if len(ls) <= keep or not ARCHIVE_PATH:
        return 0
    over, port["lessons"] = ls[:-keep], ls[-keep:]
    arch = []
    if os.path.exists(ARCHIVE_PATH):
        with open(ARCHIVE_PATH) as fh: arch = json.load(fh)
    arch.extend(over)
    _write_json(ARCHIVE_PATH, arch)
    return len(over)

def _ts(x): return dt.datetime.fromisoformat(x["ts"])

def round_history(port):
    h = port.get("history") or []
    i = max((k for k, x in enumerate(h) if x.get("action") in ("INIT", "RESET")), default=0)
    return h[i:]

def _expenses_before(port, ts):
    """Monthly expenses charged on or before ts (so the drawdown measures TRADING, not cost of living)."""
    exp = port.get("expenses") or {}
    first, last, amt = exp.get("graceUntil"), exp.get("lastChargeAt"), float(exp.get("monthlyUsd") or 0)
    if not first or not last: return 0.0
    d, day, n = dt.date.fromisoformat(first[:10]), ts[:10], 0
    while d.isoformat() <= last[:10] and d.isoformat() <= day:
        n += 1; d = dt.date.fromisoformat(first_of_next_month(d.isoformat()))
    return n * amt

def effective_risk_pct(port, current_net):
    """Risk cap per trade; halves while expense-adjusted net worth is >= DRAWDOWN_BRAKE under the round's peak."""
    h = round_history(port)
    adj = [float(x.get("netWorthUsd") or 0) + _expenses_before(port, x["ts"]) for x in h]
    cur = float(current_net or 0) + (_expenses_before(port, port["latest"]["ts"]) if port.get("latest") else 0.0)
    peak = max(adj + [cur])
    dd = (1 - cur / peak) if peak > 0 else 0.0
    return (MAX_RISK_PCT / 2 if dd >= DRAWDOWN_BRAKE else MAX_RISK_PCT), {"peakNetExExpensesUsd": r2(peak), "drawdownPct": r2(dd * 100), "brakeActive": dd >= DRAWDOWN_BRAKE}

def futures_trades(history):
    """Rebuild closed futures trades from snapshots -> [{session, open_ts, close_ts, pnl, risk, r}]."""
    out, cur = [], None
    def close(px, ts, frac=1.0):
        nonlocal cur
        btc = cur["btc"] * frac
        pnl = (px - cur["entry"]) * btc if cur["side"] == "long" else (cur["entry"] - px) * btc
        cur["pnl"] += pnl; cur["btc"] -= btc
        if frac >= 0.999:
            r = cur["pnl"] / cur["risk"] if cur["risk"] else None
            out.append({"session": cur["session"], "open_ts": cur["ts"], "close_ts": ts, "pnl": r2(cur["pnl"]), "risk": cur["risk"], "r": None if r is None else round(r, 2)})
            cur = None
    for s in history:
        f = s.get("futures") or {}
        for a in s.get("autoExits") or []:
            if cur and a.get("reason") in ("TP", "STOPPED_OUT", "LIQUIDATED"):
                close(float(a["price"]), s["ts"])
        open_now = f.get("side") not in (None, "flat") and f.get("entryPrice")
        if cur and (not open_now or float(f["entryPrice"]) != cur["entry"]):
            close(float(s["markPrice"]), s["ts"])
        elif cur and open_now and abs(f.get("btc") or 0) < cur["btc"] - 1e-9:
            close(float(s["markPrice"]), s["ts"], 1 - abs(f["btc"]) / cur["btc"])
        if open_now and not cur:
            e = float(f["entryPrice"]); st = f.get("stopPrice")
            risk = f.get("riskUsd") or (abs(e - float(st)) / e * float(f["sizeUsd"]) if st else None)
            cur = {"session": s["session"], "ts": s["ts"], "side": f["side"], "entry": e, "btc": abs(f.get("btc") or 0), "risk": risk, "pnl": 0.0}
    return out

def goals(port):
    h = round_history(port); s = port["latest"]
    if not h: return {}
    now = _ts(s); since = now - dt.timedelta(days=GOAL_WINDOW_DAYS)
    win = [x for x in h if _ts(x) >= since]
    part = sum(1 for x in win if (x.get("futures") or {}).get("side") not in (None, "flat")
               or any(a.get("reason") in ("TP", "STOPPED_OUT", "LIQUIDATED") for a in x.get("autoExits") or [])) / max(1, len(win))
    tr = futures_trades(port.get("history") or [])
    rw = [t for t in tr if t["r"] is not None and dt.datetime.fromisoformat(t["close_ts"]) >= since]
    exp = round(sum(t["r"] for t in rw) / len(rw), 2) if rw else None
    by = {}
    for t in tr[-40:]:
        if t["r"] is None: continue
        b = by.setdefault(t["session"], [0, 0.0]); b[0] += 1; b[1] += t["r"]
    rp, dd = effective_risk_pct(port, s["netWorthUsd"])
    return {
        "windowDays": GOAL_WINDOW_DAYS,
        "expectancyR": {"value": exp, "trades": len(rw), "target": GOAL_EXPECTANCY_R, "met": exp is not None and exp >= GOAL_EXPECTANCY_R},
        "participation": {"value": round(part, 2), "snapshots": len(win), "target": GOAL_PARTICIPATION, "met": part >= GOAL_PARTICIPATION},
        "drawdown": dict(dd, brakeAtPct=DRAWDOWN_BRAKE * 100, effectiveRiskPct=rp * 100),
        "sessionLeague": sorted([{"session": k, "trades": v[0], "avgR": round(v[1] / v[0], 2)} for k, v in by.items()], key=lambda x: -x["avgR"]),
    }

def context(port):
    """Compact state for the sessions (~1-2 KB) so they never read the whole portfolio.json."""
    s = port["latest"]; f = s["futures"]; sp = s["spot"]; h = port.get("history") or []
    start = next((x for x in reversed(h) if x.get("action") in ("INIT", "RESET")), h[0] if h else s)
    cap0 = float(port.get("initialCapitalUsd") or 100.0); p0 = float(start["markPrice"])
    paid = float((port.get("expenses") or {}).get("totalPaidUsd") or 0.0) if start is (h[0] if h else s) else None
    bh = r2(cap0 * s["markPrice"] / p0 - (paid or 0.0))
    eq = float(s["equityUsd"])
    return {
        "status": port.get("status"), "round": port.get("round"), "bankruptcies": port.get("bankruptcies"),
        "latest": {"ts": s["ts"], "session": s["session"], "mark": s["markPrice"], "action": s["action"],
                   "cash": s["cashUsd"], "equity": eq, "net": s["netWorthUsd"],
                   "consecutiveSkips": s.get("consecutiveSkips", 0)},
        "spot": {k: sp.get(k) for k in ("btc", "avgEntry", "valueUsd", "stopPrice", "stopFraction")},
        "futures": {k: f.get(k) for k in ("side", "sizeUsd", "leverage", "entryPrice", "marginUsd",
                                          "stopPrice", "takeProfit", "liquidationPrice", "unrealizedPnlUsd")},
        "savings": port.get("savingsUsd"), "expenses": {k: (port.get("expenses") or {}).get(k) for k in ("monthlyUsd", "nextChargeAt")},
        "riskLimits": {"maxLeverage": MAX_LEVERAGE, "maxRiskUsd": r2(effective_risk_pct(port, s["netWorthUsd"])[0] * eq), "minStopPct": MIN_STOP_PCT * 100},
        "goals": goals(port),
        "benchmark": {"buyHoldNetUsd": bh, "walletNetUsd": s["netWorthUsd"], "edgeUsd": r2(s["netWorthUsd"] - bh),
                      "note": "buy&hold of the round's starting capital at its first mark, minus expenses paid"},
        "scoreboard": [{k: r.get(k) for k in ("session", "decisions", "attributedPnlUsd", "wins", "losses")} for r in port.get("scoreboard", [])],
        "messages": (port.get("messages") or [])[-3:],
        "lessons": [{"pattern": l["pattern"], "insight": l["insight"]} for l in (port.get("lessons") or [])[-5:]],
        "lastWeeklyDigest": ({k: d.get(k) for k in ("weekStart", "weekEnd", "title", "patterns")}
                             if (d := (port.get("lessonDigests") or [None])[-1]) else None),
    }

def frozen(port, intent):
    """Bankrupt wallet touched by a NON-seeder session: record a frozen no-op snapshot."""
    prev = port["latest"]; mp = float(intent["markPrice"])
    snap = {"ts": intent["ts"], "session": intent["session"], "reportId": intent.get("reportId"),
            "markPrice": r2(mp), "action": "FROZEN",
            "spot": dict(prev["spot"]), "futures": dict(prev["futures"]),
            "cashUsd": float(prev["cashUsd"]), "realizedPnlUsd": 0.0, "unrealizedPnlUsd": 0.0,
            "equityUsd": float(prev["equityUsd"]), "savingsUsd": float(port["savingsUsd"]),
            "netWorthUsd": 0.0, "sweptToSavingsUsd": None,
            "consecutiveSkips": int(prev.get("consecutiveSkips") or 0),
            "rationale": intent.get("rationale") or "Wallet is bankrupt — frozen; no trading until the next midnight restart."}
    port["_snap"] = snap
    mark(port, mp)
    _msg_lesson(port, snap, intent)
    del port["_snap"]
    port["latest"] = snap; port.setdefault("history", []).append(snap)
    port["updatedAt"] = intent["ts"]

def revive(port, intent):
    """Midnight seeder restarting a bankrupt wallet: reseed 100 flat, new round, status active.
    May also apply midnight's decision on the fresh wallet (no expenses/attribution)."""
    mp = float(intent["markPrice"])
    port["round"] = int(port.get("round", 1)) + 1
    port["status"] = "active"; port.pop("bankruptSince", None)
    port["savingsUsd"] = 0.0; port["initialCapitalUsd"] = 100.0
    snap = {"ts": intent["ts"], "session": intent["session"], "reportId": intent.get("reportId"),
            "markPrice": r2(mp), "action": "RESET",
            "spot": {"btc": 0.0, "avgEntry": None, "costBasisUsd": 0.0, "valueUsd": 0.0},
            "futures": empty_futures(), "cashUsd": 100.0, "savingsUsd": 0.0,
            "realizedPnlUsd": 0.0, "unrealizedPnlUsd": 0.0, "equityUsd": 100.0,
            "netWorthUsd": 100.0, "sweptToSavingsUsd": None, "consecutiveSkips": 0,
            "rationale": intent.get("rationale") or f"Revived from bankruptcy \u2192 round {port['round']}, reseeded 100 USDT flat."}
    port["_snap"] = snap
    d = intent.get("decision", {"type": "hold"})
    if d.get("type") not in (None, "hold", "skip"):
        action, _ = apply_decision(port, d, mp)
        if action != "HOLD": snap["action"] = action
    mark(port, mp)
    row = sb(port, snap["session"]); row["decisions"] += 1
    _msg_lesson(port, snap, intent)
    del port["_snap"]
    port["latest"] = snap; port.setdefault("history", []).append(snap)
    port["updatedAt"] = intent["ts"]

def run(portfolio_path, intent):
    exists = os.path.exists(portfolio_path)
    if not exists:
        if not intent.get("isSeeder"):
            print("SKIP: portfolio.json missing and this session is not the seeder (midnight seeds).")
            sys.exit(0)
        port = init_wallet(intent)
        _write(portfolio_path, port)
        print(f"INIT round1 · cash 100 · net 100")
        return
    with open(portfolio_path) as fh:
        port = json.load(fh)

    # bankruptcy freeze: ONLY the midnight seeder may restart the wallet
    if port.get("status") == "bankrupt":
        if intent.get("isSeeder"):
            revive(port, intent); _write(portfolio_path, port); s = port["latest"]
            print(f"{s['session']} RESET (revived) \u00b7 round {port['round']} \u00b7 cash {s['cashUsd']} \u00b7 net {s['netWorthUsd']}")
            return
        frozen(port, intent); _write(portfolio_path, port); s = port["latest"]
        print(f"{s['session']} FROZEN \u00b7 bankrupt, awaiting midnight restart \u00b7 net {s['netWorthUsd']}")
        return

    prev = dict(port["latest"])
    prev_equity = float(prev["equityUsd"])
    mp = float(intent["markPrice"])
    d = intent.get("decision", {"type": "hold"})

    # skip rule: no 3rd skip in a row
    prev_skips = int(prev.get("consecutiveSkips") or 0)
    if d.get("type") == "skip" and prev_skips >= 2:
        print("RULE: cannot skip 3 sessions in a row — must take a stance."); sys.exit(2)

    # new working snapshot inherits prev books
    snap = {"ts": intent["ts"], "session": intent["session"], "reportId": intent.get("reportId"),
            "markPrice": r2(mp), "action": "HOLD", "autoExits": [],
            "spot": dict(prev["spot"]), "futures": dict(prev["futures"]),
            "cashUsd": float(prev["cashUsd"]), "realizedPnlUsd": 0.0,
            "unrealizedPnlUsd": 0.0, "equityUsd": prev_equity,
            "savingsUsd": float(port["savingsUsd"]), "netWorthUsd": 0.0,
            "sweptToSavingsUsd": None, "consecutiveSkips": 0, "rationale": intent.get("rationale", "")}
    port["_snap"] = snap
    auto = []
    auto_exits = []  # structured record of SL/TP/liq fills for the UI (reason + exact price + side)

    # 1) resolve SL/TP/liq on the inherited futures position
    hit = resolve_sltp(snap["futures"], intent.get("sessionLow"), intent.get("sessionHigh"))
    if hit:
        price, reason = hit
        closed_side = snap["futures"].get("side")
        close_futures(port, price)
        snap["action"] = reason
        auto.append(f"{reason}@{price}")
        auto_exits.append({"reason": reason, "price": r2(price), "side": closed_side})
    sp = snap["spot"] = dict(snap["spot"])
    sstop = sp.get("stopPrice"); low = intent.get("sessionLow")
    if sstop is not None and low is not None and (sp.get("btc") or 0.0) > 0 and float(low) <= float(sstop):
        frac = float(sp.get("stopFraction") or 1.0)
        apply_decision(port, {"type": "spot_sell", "fraction": frac}, float(sstop))
        if not auto: snap["action"] = "REDUCE"
        auto.append(f"SPOT_STOP@{sstop}")
        auto_exits.append({"reason": "SPOT_STOP", "price": r2(sstop), "side": "long"})
        sp = snap["spot"]; sp.pop("stopPrice", None); sp.pop("stopFraction", None)
    snap["autoExits"] = auto_exits
    # 2) mark to market
    mark(port, mp)
    # 3) attribute the interval's move to the PREVIOUS session's decision
    if prev.get("action") != "INIT" or len(port["history"]) > 1:
        attributed = r2(snap["equityUsd"] - prev_equity)
        row = sb(port, prev["session"])
        row["attributedPnlUsd"] = r2(row["attributedPnlUsd"] + attributed)
        if attributed > 0: row["wins"] += 1
        elif attributed < 0: row["losses"] += 1
        row["quotaCoveredUsd"] = r2(row["quotaCoveredUsd"] + attributed)
    # 4) expenses (may bankrupt -> freeze this run, no trading afterwards)
    exp_events = apply_expenses(port, intent["today"])
    if exp_events: auto += exp_events
    if port.get("status") == "bankrupt":
        mark(port, mp)
        snap["action"] = "BANKRUPTCY"; snap["consecutiveSkips"] = 0
        if not snap["rationale"]:
            snap["rationale"] = ("Bankrupt: could not cover the monthly expense; wallet flattened and "
                                 "frozen until the next midnight restart.")
        _msg_lesson(port, snap, intent)
        del port["_snap"]; port["latest"] = snap; port.setdefault("history", []).append(snap)
        port["updatedAt"] = intent["ts"]; _write(portfolio_path, port)
        print(f"{snap['session']} BANKRUPTCY \u00b7 net {snap['netWorthUsd']} \u00b7 bankruptcies "
              f"{port['bankruptcies']} \u00b7 frozen until midnight")
        return
    mark(port, mp)
    # 5) apply this session's decision
    action, realized = apply_decision(port, d, mp)
    if snap["action"] in ("HOLD",) and action != "HOLD":
        snap["action"] = action
    elif not auto:
        snap["action"] = action
    # 5b) resting spot stop (intent.spotStop: {"price":n,"fraction":0..1} sets it, null clears it)
    if "spotStop" in intent:
        ss = intent["spotStop"]; sp = snap["spot"]
        if ss and ss.get("price") is not None:
            if float(ss["price"]) >= mp:
                print(f"RULE: spotStop {ss['price']} must be below mark {mp}."); sys.exit(2)
            sp["stopPrice"] = r2(ss["price"]); sp["stopFraction"] = max(0.05, min(1.0, float(ss.get("fraction", 1.0))))
        else:
            sp.pop("stopPrice", None); sp.pop("stopFraction", None)
    if not (snap["spot"].get("btc") or 0.0) > 0:
        snap["spot"].pop("stopPrice", None); snap["spot"].pop("stopFraction", None)
    # 6) re-mark + skip counter + scoreboard decisions
    mark(port, mp)
    snap["consecutiveSkips"] = prev_skips + 1 if d.get("type") == "skip" else 0
    tsb = sb(port, snap["session"]); tsb["decisions"] += 1
    if d.get("type") == "skip": tsb["skips"] = int(tsb.get("skips", 0)) + 1

    # rationale + relay message + lesson
    if not snap["rationale"]:
        snap["rationale"] = f"{action}; " + ("auto: " + ", ".join(auto) if auto else "no auto-exits") + f"; mark {r2(mp)}"
    _msg_lesson(port, snap, intent)

    del port["_snap"]
    port["latest"] = snap
    port.setdefault("history", []).append(snap)
    port["updatedAt"] = intent["ts"]
    _write(portfolio_path, port)
    print(f"{snap['session']} {snap['action']} · mark {r2(mp)} · equity {snap['equityUsd']} · "
          f"savings {port['savingsUsd']} · net {snap['netWorthUsd']} · round {port['round']} · "
          f"bankruptcies {port['bankruptcies']}" + (f" · auto[{','.join(auto)}]" if auto else ""))

def _write_json(path, obj):
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    with os.fdopen(fd, "w") as fh:
        json.dump(obj, fh, indent=2)
    os.replace(tmp, path)

def _write(path, port):
    port.pop("_snap", None)
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    with os.fdopen(fd, "w") as fh:
        json.dump(port, fh, indent=2)
    os.replace(tmp, path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--portfolio", required=True)
    ap.add_argument("--intent")
    ap.add_argument("--print", action="store_true", dest="show")
    ap.add_argument("--context", action="store_true", help="print compact JSON state for a session (read-only)")
    ap.add_argument("--compact", action="store_true", help="archive old lessons now (keeps the newest LESSONS_KEEP)")
    ap.add_argument("--digest", help="weekly digest JSON (object or list) -> lessonDigests; archives that week's lessons")
    a = ap.parse_args()
    global ARCHIVE_PATH
    ARCHIVE_PATH = os.path.join(os.path.dirname(os.path.abspath(a.portfolio)), "lessons-archive.json")
    if a.context:
        with open(a.portfolio) as fh: print(json.dumps(context(json.load(fh)), separators=(",", ":")))
        return
    if a.digest:
        with open(a.portfolio) as fh: p = json.load(fh)
        with open(a.digest) as fh: dgs = json.load(fh)
        n = sum(add_digest(p, d) for d in (dgs if isinstance(dgs, list) else [dgs]))
        if p.get("latest"): prune_messages(p, p["latest"]["ts"])
        _write(a.portfolio, p)
        print(f"digests {len(p['lessonDigests'])} · archived {n} lessons · kept {len(p.get('lessons') or [])}")
        return
    if a.compact:
        with open(a.portfolio) as fh: p = json.load(fh)
        n = compact_lessons(p)
        if n: _write(a.portfolio, p)
        print(f"archived {n} lessons; kept {len(p.get('lessons') or [])}")
        return
    if a.show:
        with open(a.portfolio) as fh: p = json.load(fh)
        s = p["latest"]
        print(json.dumps({"round": p["round"], "bankruptcies": p["bankruptcies"],
                          "cash": s["cashUsd"], "savings": p["savingsUsd"],
                          "spotBtc": s["spot"].get("btc"), "futures": s["futures"]["side"],
                          "equity": s["equityUsd"], "netWorth": s["netWorthUsd"]}, indent=2))
        return
    if not a.intent:
        ap.error("--intent required unless --print")
    with open(a.intent) as fh: intent = json.load(fh)
    for k in ("session", "ts", "today", "markPrice"):
        if k not in intent: raise SystemExit(f"intent missing required field: {k}")
    run(a.portfolio, intent)

if __name__ == "__main__":
    main()
