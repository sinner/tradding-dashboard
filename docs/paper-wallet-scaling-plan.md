# Paper Wallet — Transaction History Scaling & Migration Plan

_Status: proposal · Owner: trading-dashboard · Created: 2026-07-25_

## 1. The concern

The paper-wallet game appends one snapshot per session (4/day). Every snapshot is a
full, dated transaction record, so the log is correct and auditable — but it lives
**inside `public/data/portfolio.json`** and grows without bound. The `/paper-wallet`
page downloads and parses that whole file on every load, even though it only shows a
handful of rows. Left alone, load time and memory degrade as the history grows.

This document answers three questions and lays out a **phased plan with explicit
migration triggers**, so we act only when a measured threshold is crossed.

## 2. Are operations recorded with date + BTC price? — Yes

Each snapshot written by `scripts/paper_wallet.py` already contains everything needed
for a real ledger:

- `ts` — ISO date-time of the action.
- `markPrice` — the verified BTC price the action was booked at.
- `action` — `OPEN_LONG | OPEN_SHORT | ADD | REDUCE | CLOSE | FLIP | STOPPED_OUT | LIQUIDATED | SKIP | EXPENSE | BANKRUPTCY | RESET | HOLD | INIT`.
- `spot` + `futures` books, `cashUsd`, `savingsUsd`, `realizedPnlUsd`, `unrealizedPnlUsd`, `equityUsd`, `netWorthUsd`, `reportId`, `rationale`.

So the data model is not the problem. **Where it lives and how the UI loads it is.**

## 3. Current facts (measured 2026-07-25)

| Item | Value |
|---|---|
| Bytes per snapshot | ~867 B |
| Snapshots/day | 4 (midnight/morning/midday/endday) |
| Growth | ~3.5 KB/day ≈ **~1.27 MB/year** of history embedded in `portfolio.json` |
| UI display | `RecentHistory` already slices the **last 12** rows … |
| UI fetch | … but still **downloads the entire `portfolio.json`** (fetch `no-store`, re-fetched every 30 min while the tab is open) |
| Bounded already | `messages` capped at 20; `scoreboard` fixed at 4 rows |
| Slow-growing | `hallOfShame`, `lessons` (a handful per month at most) |
| Hosting | **Static SPA on GitHub Pages — no backend, no server-side queries** |
| Writer | `scripts/paper_wallet.py`, run by the local Mac job — the only process that mutates game state |

## 4. The binding constraint: static hosting

The app is a Vite/React SPA served as static files. The browser can only `fetch()`
static assets; there is **no API to paginate against**. This decides the architecture:

- A separate **JSON, sharded by time**, is the natural fit — the UI fetches only the
  slice it needs.
- **SQLite in the browser** (sql.js/WASM) does **not** help on its own: the browser
  would still download the whole `.sqlite` file (plus a ~1 MB WASM runtime). It only
  pays off **server-side**.
- Therefore: SQLite becomes worthwhile only when it is the **writer's** source of
  truth (the Python script) and/or when a real backend exists. For the static UI, the
  answer is always "hand it small JSON".

Guiding principles: **(a)** keep the hot path O(1) — never load all of history to
render the current wallet; **(b)** separate *current state* (small, always loaded)
from *history* (append-only, paginated); **(c)** a **single writer** (the script)
owns integrity; **(d)** every change stays backward-compatible and the scheduled job
**never runs git** (see the skill's PUBLISH rule).

## 5. Phased plan

### Phase 0 — Split state from history (do this first; small, cheap)

Goal: make `/paper-wallet` load cost independent of history length.

1. **Shrink `portfolio.json` to CURRENT STATE only**: `latest`, `scoreboard`,
   `expenses`, `savingsUsd`, `round`, `bankruptcies`, plus the *tail* of the
   slow lists (`messages` last ~20, `hallOfShame` last ~10, `lessons` last ~20).
   This file stays a few KB forever.
2. **Move `history` out** into append-only **monthly shards**, mirroring the reports
   layout the app already uses:
   `public/data/portfolio/history/YYYY-MM.json` = `[snapshot, …]`.
   Optional `public/data/portfolio/history/index.json` = `[{month, count, firstTs, lastTs}]`.
3. **`scripts/paper_wallet.py`** appends the new snapshot to the current month's shard
   (create on first write of the month), updates `index.json`, and writes the trimmed
   `portfolio.json`. It also keeps a small `history/recent.json` = the **last ~50**
   snapshots for the UI's default view (so the page fetches ONE tiny file).
4. **UI**: `/paper-wallet` loads `portfolio.json` (tiny) for everything on screen, and
   the "Recent snapshots" table loads `history/recent.json` only. A **"Load older"**
   control lazily fetches month shards on demand (newest→oldest), never all at once.
   `RecentHistory` keeps its cap (e.g. 25/page).
5. **Schema/back-compat**: make `history` in `PortfolioSchema` optional (it may be
   absent once split); add a small `PortfolioHistoryShardSchema` = array of snapshots.
   Old `portfolio.json` files that still embed `history` keep working (a one-time
   migrator moves embedded history into shards).

Outcome: O(1) page load regardless of years of history. **No SQLite yet.**

### Phase 1 — SQLite as the writer's source of truth (trigger-based)

**Migrate when ANY of these is observed (not before):**
- Total history rows > **~5,000** (~3.5 years), OR
- Any single JSON the UI must load > **~250 KB**, OR
- `/paper-wallet` data-ready time > **~300 ms** on throttled 3G (Lighthouse/Network), OR
- You want **real analytics/queries** the JSON can't answer cheaply (per-session edge
  by hour/day/month, rolling drawdown, win-rate by regime, etc.).

Design (keeps the static UI unchanged):
- The Python ledger script writes to `public/data/paper_wallet.sqlite` as the **source
  of truth**. Suggested tables:
  - `snapshots(id, ts, session, report_id, action, mark_price, cash_usd, savings_usd, equity_usd, net_worth_usd, realized_pnl_usd, unrealized_pnl_usd, spot_json, futures_json, rationale)`
  - `trades(id, snapshot_id, book, action, side, price, size_usd, leverage, realized_pnl_usd)` (normalized, for queries)
  - `expenses(id, ts, amount_usd, from_savings, from_cash, next_charge_at)`
  - `bankruptcies(id, ts, round, equity_before, shortfall_usd, reason, lesson)`
  - `messages`, `lessons`, `scoreboard` (or scoreboard as a view over `snapshots`).
- After each run the script **exports** the same small JSON the UI already consumes:
  `portfolio.json` (current) + `history/recent.json` (last N) + monthly shards on
  demand. **SQLite gives integrity + queries; JSON export keeps the frontend static
  and untouched.**
- Migration is a one-off `scripts/migrate_history_to_sqlite.py` that ingests all shards
  (or the legacy embedded history) into the DB, then the script switches to DB-first.

Explicitly **not** doing in Phase 1: shipping the `.sqlite` to the browser. It stays a
build/writer artifact; the browser never downloads it.

### Phase 2 — Real backend (only if the app stops being static)

If a backend/API is ever added, serve history straight from SQLite with **server-side
pagination/filtering**: `GET /api/wallet/history?before=<ts>&limit=<n>` and a
`GET /api/wallet/current`. The UI drops the static-JSON loaders for these endpoints.
This is the end-state only if the project outgrows a personal static dashboard.

## 6. How to measure the triggers (so we act on data, not vibes)

- File size: `wc -c public/data/portfolio.json public/data/portfolio/history/*.json`.
- Row count: `history/index.json` totals.
- Load timing: Chrome DevTools → Network (filter `data/`) and Lighthouse on
  `/paper-wallet` (throttled). Record the numbers in this doc when a trigger nears.

## 7. Recommendation

- **Now / soon:** implement **Phase 0** — it is a small, backward-compatible change
  that removes the only unbounded hot-path cost. Low risk, high payoff.
- **Later, only on a measured trigger:** move to **Phase 1 (SQLite writer + JSON
  export)**. This is the "migrate when performance becomes a problem" path you asked
  for — the source of truth gets robust and queryable while the static UI stays fast
  and unchanged.
- **Phase 2** is reserved for the day the app gains a backend.

## 8. Backward-compat & safety (applies to every phase)

- All new fields/files are **optional**; older data and the current app keep working,
  with graceful empty states.
- The scheduled Mac job remains the **single writer** and **never runs git** in the
  sandbox (avoids the stale `.git/index.lock`); it only leaves validated files on disk
  for the local publish job.
- Each run validates that every JSON still parses against the zod schema before finishing.
