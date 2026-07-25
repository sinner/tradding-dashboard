#!/usr/bin/env python3
"""
paper_wallet.py — deterministic ledger for the BTC Paper Desk game.

The LLM (a scheduled session) only decides the trade and verifies the price;
THIS script does all the math and writes public/data/portfolio.json.

USAGE
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --intent /tmp/intent.json
  python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --print      # show state, no changes

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
  "decision": {
     "type": "hold|skip|spot_buy|spot_sell|fut_open|fut_reduce|fut_close|fut_flip",
     "usd":  <spot_buy: cash USD -> BTC>,
     "btc":  <spot_sell: BTC to sell>,   "fraction": <spot_sell or fut_reduce: 0..1>,
     "side": "long|short", "sizeUsd": <fut notional>, "leverage": <1..3>,
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
def hall_of_shame(port, snap, shortfall):
    port["bankruptcies"] = int(port.get("bankruptcies", 0)) + 1
    port["round"] = int(port.get("round", 1)) + 1
    port.setdefault("hallOfShame", []).append({
        "ts": snap["ts"], "round": port["round"] - 1, "session": snap["session"],
        "equityBefore": r2(snap["equityUsd"]), "shortfallUsd": r2(shortfall),
        "reason": "Could not cover the monthly cost of living — savings + equity fell below what was owed.",
        "lesson": "Keep a fatter savings buffer and cut risk before month-end; a leveraged drawdown into the 1st is what kills the wallet.",
    })
    # reset: both books flat, cash 100, savings 0, new baseline
    snap["spot"] = {"btc": 0.0, "avgEntry": None, "costBasisUsd": 0.0, "valueUsd": 0.0}
    snap["futures"] = empty_futures()
    snap["cashUsd"] = 100.0
    port["savingsUsd"] = 0.0
    port["initialCapitalUsd"] = 100.0
    snap["realizedPnlUsd"] = 0.0

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
            hall_of_shame(port, s, owed - pool)
            events.append("BANKRUPTCY")
            # after reset advance charge pointer so we don't loop on the same date
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
            realize(port, r2(proceeds - cost))            # spot realized net gain
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
        side = d["side"]; size = float(d["sizeUsd"]); lev = max(1, min(3, int(d.get("leverage", 1))))
        margin = r2(size / lev)
        if margin > s["cashUsd"] + 1e-9:
            raise SystemExit(f"insufficient cash for margin {margin} (cash {s['cashUsd']})")
        s["cashUsd"] = r2(s["cashUsd"] - margin)
        btc = size / mp
        f.update({"side": side, "sizeUsd": r2(size), "btc": r8(btc if side == "long" else -btc),
                  "leverage": lev, "entryPrice": r2(mp), "marginUsd": margin,
                  "stopPrice": d.get("stop"), "liquidationPrice": liq_price(side, mp, lev),
                  "takeProfit": list(d.get("tp") or [])})
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
            "round": 1, "bankruptcies": 0,
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
            "markPrice": r2(mp), "action": "HOLD",
            "spot": dict(prev["spot"]), "futures": dict(prev["futures"]),
            "cashUsd": float(prev["cashUsd"]), "realizedPnlUsd": 0.0,
            "unrealizedPnlUsd": 0.0, "equityUsd": prev_equity,
            "savingsUsd": float(port["savingsUsd"]), "netWorthUsd": 0.0,
            "sweptToSavingsUsd": None, "consecutiveSkips": 0, "rationale": intent.get("rationale", "")}
    port["_snap"] = snap
    auto = []

    # 1) resolve SL/TP/liq on the inherited futures position
    hit = resolve_sltp(snap["futures"], intent.get("sessionLow"), intent.get("sessionHigh"))
    if hit:
        price, reason = hit
        close_futures(port, price)
        snap["action"] = reason
        auto.append(f"{reason}@{price}")
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
    # 4) expenses (may bankrupt+reset)
    exp_events = apply_expenses(port, intent["today"])
    if exp_events: auto += exp_events
    mark(port, mp)
    # 5) apply this session's decision
    action, realized = apply_decision(port, d, mp)
    if snap["action"] in ("HOLD",) and action != "HOLD":
        snap["action"] = action
    elif not auto:
        snap["action"] = action
    # 6) re-mark + skip counter + scoreboard decisions
    mark(port, mp)
    snap["consecutiveSkips"] = prev_skips + 1 if d.get("type") == "skip" else 0
    tsb = sb(port, snap["session"]); tsb["decisions"] += 1
    if d.get("type") == "skip": tsb["skips"] = int(tsb.get("skips", 0)) + 1

    # rationale + relay message + lesson
    if not snap["rationale"]:
        snap["rationale"] = f"{action}; " + ("auto: " + ", ".join(auto) if auto else "no auto-exits") + f"; mark {r2(mp)}"
    if intent.get("message"):
        m = intent["message"]; port.setdefault("messages", []).append(
            {"ts": snap["ts"], "from": snap["session"], "to": m.get("to", "all"), "text": m["text"]})
        port["messages"] = port["messages"][-20:]
    if intent.get("lesson"):
        l = intent["lesson"]; port.setdefault("lessons", []).append(
            {"ts": snap["ts"], "session": snap["session"], "pattern": l["pattern"], "insight": l["insight"]})

    del port["_snap"]
    port["latest"] = snap
    port.setdefault("history", []).append(snap)
    port["updatedAt"] = intent["ts"]
    _write(portfolio_path, port)
    print(f"{snap['session']} {snap['action']} · mark {r2(mp)} · equity {snap['equityUsd']} · "
          f"savings {port['savingsUsd']} · net {snap['netWorthUsd']} · round {port['round']} · "
          f"bankruptcies {port['bankruptcies']}" + (f" · auto[{','.join(auto)}]" if auto else ""))

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
    a = ap.parse_args()
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
