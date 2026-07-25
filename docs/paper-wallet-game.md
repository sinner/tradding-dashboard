# The Paper Wallet Game

_Status: living spec · Owner: trading-dashboard · Updated: 2026-07-25_

A paper-trading game that rides on top of the BTC report pipeline. The four daily
scheduled sessions collaboratively manage **one** simulated wallet — **not real money** —
and are scored on how well they grow it while covering a monthly cost of living. The
goal is a feedback loop: the sessions learn from wins, bankruptcies and each other, so
the prompts, the skill and the strategy keep improving over time.

> Educational simulation only. Nothing here is financial advice, and no real funds move.

---

## 1. The players — four relayed sessions

The same four scheduled tasks that write the BTC reports also play the game, in this
daily order:

| Session | ~Time (ET) | Role |
|---|---|---|
| **midnight** | 02:00 | First of the day · **wallet seeder** (creates the wallet if missing) |
| **morning** | 06:50 | relay |
| **midday** | 12:40 | relay |
| **endday** | 19:30 | Last of the day · defensive into the overnight gap |

It is a **relay**: each session inherits the exact position the previous one left,
marks it to market, and makes the next decision. They also leave **hand-off notes** for
one another.

---

## 2. Starting endowment (genesis)

The wallet was seeded once with:

- **100 USDT free cash** (liquid — usable to margin futures from day one), **plus**
- a **gift of 0.002 BTC** in the spot book: 0.001 @ 67,500 + 0.001 @ 60,300 → avg entry
  **63,900**, cost basis **127.80**.

So the total endowment / P&L baseline (`initialCapitalUsd`) is **227.80** (100 cash +
127.80 of BTC cost). Net worth at genesis ≈ 227.94 marked at ~63,968.

The cash and the BTC are **separate**: cash is liquidity, the BTC is a held position.

---

## 3. Two books + cash + savings

- **Spot book** — BTC held outright, **long-only**, no liquidation. The long-term core;
  the gifted BTC lives here.
- **Futures book** — one perp position, **long or short**, leverage **≤ 3x**, margined
  from free cash, with a liquidation price.
- **Free cash** — liquid USDT (margins futures / buys spot).
- **Savings** — an **untouchable** USDT bucket; it cannot be traded and only pays the
  cost of living.

### Accounting (no fees, no taxes — net only)
- `spot.value = btc × markPrice`
- `futures`: `margin = size / leverage`; `uPnL = ±(mark − entry) × btc`;
  `liq ≈ entry × (1 ∓ 1/leverage)`
- **equity** = `cash + spot.value + futures.margin + futures.uPnL`
- **net worth** = `equity + savings`  ← the headline number, P&L is vs `initialCapitalUsd`

---

## 4. The rules we agreed

**Trading**
- Spot + shorts + leverage allowed; **leverage capped at 3x**.
- Each session picks exactly one decision: `hold · skip · spot_buy · spot_sell ·
  fut_open · fut_reduce · fut_close · fut_flip`.
- Opening futures **must** set a `stop` and `take-profit`.

**Auto SL/TP (resolved by the NEXT session)**
- Every session, before deciding, checks the verified session **range** (high/low) since
  the last snapshot. If price crossed the **stop** or **liquidation** → the position is
  closed there (`STOPPED_OUT` / `LIQUIDATED`). Else if it reached a **take-profit** →
  closed at the TP. If both a stop and a TP sit in the range, **assume the stop hit
  first** (honest worst-case).

**Savings (20% sweep)**
- Whenever a run **realizes a gain**, 20% of it is swept into **savings** (untouchable);
  the rest goes to cash. Comfort target ≈ 45 USDT (~1.5 months of expenses).

**Cost of living**
- **30 USDT / month**, one debit on the **1st**. The **first calendar month is grace**
  (no charge). Paid from **savings first, then cash**. Per-session quota = 30 ÷ 4 =
  **7.5 USDT/month** (used only for scoreboard accountability).

**Bankruptcy → freeze, then midnight revive**
- If a due charge can't be covered (savings + equity < owed), the wallet is **flattened to
  cash**, marked **bankrupt** (`bankruptcies += 1`, `status: "bankrupt"`) and **frozen** —
  no session trades it. Any **non-midnight** session that runs meanwhile records a
  `FROZEN` no-op (it does not trade). **Only the next midnight session revives it**: reset
  to **100 USDT cash flat**, `round += 1`, `status` back to `active` (the gift is
  genesis-only). Each bankruptcy logs a **hall-of-shame** entry with *why* + *lesson*.

**Skip rule**
- A session **may skip** trading when the setup is poor (preferred over forcing a bad
  trade), but **never more than 2 skips in a row** — the third must take a stance.

**Scoreboard (who's actually good)**
- The equity change over each interval is **attributed to the session whose decision was
  live** during it. Each session tracks decisions, skips, attributed P&L, wins/losses,
  and how much of its 7.5/mo quota it covered.

**Hand-off notes & lessons**
- Sessions leave short **messages** for the next one (stop to watch, magnet, why they
  skipped). Repeatable observations become **lessons** that feed future rounds — the
  mechanism by which the game (and the skill) gets smarter.

**Liquidation "magnets"**
- Liquidation clusters act as magnets. Data comes from the **free, keyless OKX public
  API** (open interest, funding, long/short ratio; realized-liq clusters with a freshness
  guard). Forward magnets, when no fresh cluster data exists, are a **labelled
  leverage-bracket estimate** — never presented as measured. CoinGlass is an optional
  upgrade if an API key is ever configured.

---

## 5. How it runs (architecture)

The split that keeps token cost and errors low:

- **The session (LLM) is the brain**: verifies the current spot + session range, reads
  the wallet's lessons/hall-of-shame/messages for context, and **chooses one decision**.
- **`scripts/paper_wallet.py` is the accountant**: a deterministic, stdlib-only Python
  ledger that does *all* the math — SL/TP/liquidation resolution, mark-to-market, the
  20% sweep, the monthly expense, bankruptcy freeze + midnight revive + hall-of-shame, scoreboard
  attribution, messages/lessons, net worth — and writes `portfolio.json`. The LLM never
  does arithmetic or hand-edits the wallet.

**Interface**
- The session writes a small **intent JSON** and runs:
  `python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --intent <tmp>`
- Intent fields: `session, reportId, ts, today, markPrice, sessionHigh, sessionLow,
  isSeeder, decision{…}, message?, lesson?, rationale?`.
- Exit codes: `0` ok · `2` rule violation (e.g. a 3rd skip → pick a real stance and
  re-run) · `3` bad input.
- Rules (sweep %, expense amount/cadence, quota, leverage cap) live **in the script** —
  change them there, not in four prompts.

**Where it's wired**
- The reusable skill **`btc-paper-desk`** tells all four sessions to gather data, decide,
  and call the script. It also defines the report/manifest/calibration outputs.
- Writes are owned by the local Mac scheduled job; the sandbox **never runs git**.

---

## 6. Data files

| File | Contents |
|---|---|
| `public/data/portfolio.json` | Current wallet state: `latest` snapshot, `scoreboard`, `expenses`, `savingsUsd`, `round`, `bankruptcies`, `status` (`active`/`bankrupt`), `hallOfShame`, `lessons`, `messages`, `history` |
| `scripts/paper_wallet.py` | The deterministic ledger (source of truth for the math) |
| `scripts/test_paper_wallet.py` | Deterministic tests (INIT, TP/stop hits, expense, bankruptcy, skip rule) |

A snapshot records date-time (`ts`), the BTC action price (`markPrice`), the action, both
books, cash/savings/equity/net worth and a rationale — a full auditable log.

See **`docs/paper-wallet-scaling-plan.md`** for how the growing history is kept
performant (state/history split, monthly shards, UI pagination, and a SQLite migration
path gated on measured triggers).

---

## 7. Reading the `/paper-wallet` page

- **Net worth** — the headline (equity + savings), with P&L vs the 227.80 baseline.
- **Buckets** — Spot value · Futures equity · Free cash · Savings.
- **Spot book / Futures book** — the two positions in detail (entry, size, stop/liq).
- **Cost of living** — monthly amount, next charge date, total paid, bankruptcies.
- **Session scoreboard** — decisions, skips, contribution, W/L per session.
- **Hand-off notes · Hall of shame · Learned patterns · Recent snapshots** — the
  narrative and history of the game.

When the wallet is **bankrupt**, `/paper-wallet` shows a red banner and the game is frozen
until the next midnight restart. If a session can't verify a fresh price, it **skips** the
wallet update rather than guess — so the ledger never moves on fabricated data.

---

## 8. Using the Python scripts

Both scripts are stdlib-only (no `pip install`) and run the same on macOS/Linux. Run
them from the project root.

### 8.1 `scripts/paper_wallet.py` — the ledger

**Inspect current state (read-only, no changes):**
```bash
python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --print
# → {"round":1,"bankruptcies":0,"cash":100.0,"savings":0.0,"spotBtc":0.002,
#    "futures":"flat","equity":227.94,"netWorth":227.94}
```

**Apply one session's decision** — write an `intent.json`, then run it:
```bash
python3 scripts/paper_wallet.py \
  --portfolio public/data/portfolio.json \
  --intent /tmp/intent.json
```
It rewrites `portfolio.json` atomically and prints a one-line summary. Exit codes:
`0` ok · `2` rule violation (e.g. a 3rd skip in a row) · `3` bad/missing input.

**Run the tests** (deterministic, uses temp files — never touches real data):
```bash
python3 scripts/test_paper_wallet.py
# → ok  init cash 100 … ok  bankruptcy incremented …
#    ALL TESTS PASSED
```

### 8.2 Intent examples (what a session writes)

**A) Open a futures long, 60 USD notional @2x, with stop + take-profit**
```json
{
  "session": "morning", "reportId": "2026-07-25-morning",
  "ts": "2026-07-25T06:50:00-04:00", "today": "2026-07-25",
  "markPrice": 64000, "sessionHigh": 64300, "sessionLow": 63700, "isSeeder": false,
  "rationale": "Reclaim of 64k with the liquidity magnet above; small long.",
  "decision": { "type": "fut_open", "side": "long", "sizeUsd": 60, "leverage": 2,
                "stop": 62000, "tp": [70000] },
  "message": { "to": "midday", "text": "long from 64k, stop 62k, tp 70k" }
}
```
```
morning OPEN_LONG · mark 64000.0 · equity 228.0 · savings 0.0 · net 228.0 · round 1 · bankruptcies 0
```

**B) The NEXT session just marks — the script auto-resolves the TP from the range**
```json
{ "session": "midday", "ts": "2026-07-25T12:40:00-04:00", "today": "2026-07-25",
  "markPrice": 71000, "sessionHigh": 71200, "sessionLow": 63950, "isSeeder": false,
  "decision": { "type": "hold" } }
```
```
midday TP · mark 71000.0 · equity 246.5 · savings 1.12 · net 247.62 · round 1 · bankruptcies 0 · auto[TP@70000]
```
(The long closed at 70,000; net gain banked to cash, 20% swept to savings — you did no math.)

**C) Buy spot with free cash**
```json
{ "session": "endday", "ts": "2026-07-25T19:30:00-04:00", "today": "2026-07-25",
  "markPrice": 70000, "isSeeder": false, "decision": { "type": "spot_buy", "usd": 40 } }
```

**D) Skip (poor setup)** — allowed up to 2 in a row; a 3rd exits with code `2`:
```json
{ "session": "midnight", "ts": "2026-07-26T02:00:00-04:00", "today": "2026-07-26",
  "markPrice": 69000, "isSeeder": true, "decision": { "type": "skip" } }
```

**Other decision types:** `spot_sell` (`{"btc":0.001}` or `{"fraction":0.5}`),
`fut_reduce` (`{"fraction":0.5}`), `fut_close`, `fut_flip` (same fields as `fut_open`).

### 8.3 Function reference (`paper_wallet.py`)

Constants at the top are the tunable rules — change them here, nowhere else:
`SWEEP=0.20`, `MONTHLY_EXPENSE=30.0`, `PER_SESSION_QUOTA=7.5`, `SESSIONS=[…]`.

| Function | Purpose |
|---|---|
| `r2(x)` / `r8(x)` | Round to 2 dp (USD) / 8 dp (BTC). |
| `first_of_next_month(dateStr)` | Next monthly charge date (the 1st). |
| `empty_futures()` | A flat futures book. |
| `liq_price(side, entry, lev)` | Liquidation price ≈ `entry×(1∓1/lev)`; `None` at 1x. |
| `fut_upnl(fut, mark)` | Unrealized PnL of the futures book at `mark`. |
| `mark(port, mp)` | Mark both books to `mp`; recompute `equityUsd` & `netWorthUsd`. |
| `realize(port, pnl)` | Bank realized PnL to cash and sweep 20% of gains to savings. |
| `close_futures(port, price)` | Close the whole futures position at `price`; return margin + realize PnL. |
| `resolve_sltp(fut, low, high)` | Was stop/liq/TP hit in the range? Stop/liq beat TP (worst-case). |
| `hall_of_shame(port, snap, shortfall)` | Record the bankruptcy post-mortem and reset to 100 flat. |
| `apply_expenses(port, today)` | Charge every due monthly expense; bankrupt if uncovered. |
| `apply_decision(port, decision, mp)` | Execute the session's chosen trade; returns `(action, realized)`. |
| `init_wallet(intent)` | Build a fresh 100-USDT flat wallet (seeder / first run). |
| `sb(port, session)` | Get/create a session's scoreboard row. |
| `run(portfolio_path, intent)` | The pipeline: resolve SL/TP → mark → attribute → expenses → decide → append snapshot → write. |
| `_write(path, port)` | Atomic write of `portfolio.json` (temp file + `os.replace`). |
| `main()` | CLI entry (`--portfolio`, `--intent`, `--print`). |

**Order inside `run()`** (why results are deterministic): (1) resolve inherited SL/TP/liq
from the range, (2) mark to market, (3) attribute the interval's P&L to the previous
session, (4) charge due expenses (may bankrupt+reset), (5) apply this session's decision,
(6) update skip counter + scoreboard, append the snapshot, write the file.

### 8.4 Using it from Python (import) instead of the CLI

```python
import json, paper_wallet as pw   # run from scripts/, or add it to sys.path
port = json.load(open("public/data/portfolio.json"))
port["_snap"] = dict(port["latest"])          # working snapshot
pw.mark(port, 64500)                            # re-mark at a hypothetical price
print(port["_snap"]["equityUsd"], port["_snap"]["netWorthUsd"])
```
For normal operation prefer the CLI (`--intent`) — it runs the full, tested pipeline;
importing individual functions is for ad-hoc checks and unit tests.

> Rule of thumb: the scheduled session **never** edits `portfolio.json` by hand and
> never recomputes money — it only produces an `intent` and calls the script.
