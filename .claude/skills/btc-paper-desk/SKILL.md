---
name: "btc-paper-desk"
description: "BTC trading-dashboard session workflow: writes report + manifest + calibration JSON, and runs scripts/paper_wallet.py (Python ledger) for the 100-USDT paper-wallet game. FREE keyless OKX liquidation/positioning data. Use for the scheduled midnight/morning/midday/endday BTC runs."
---

# BTC Paper Desk — 4-session trading-dashboard workflow

You produce STRUCTURED JSON files for the `tradding-dashboard` app for ONE session of the day. The invoking task tells you WHICH session (`midnight`, `morning`, `midday`, `endday`) and whether it is the WALLET SEEDER. Always run `/crypto-levels BTC-USDT` and `/crypto-technical-analyst BTC-USDT` first.

OUTPUT LANGUAGE: the app is English — write ALL free-text (report notes, narrative, portfolio `rationale`/`message`/`lesson`) in English.

Do NOT send email, do NOT write to ~/crypto-reports, do NOT push to GitHub.

PROJECT ROOT: `/Users/gabrielgonzalez/workspace/jsinner/tradding-dashboard`
DATA ROOT: `<PROJECT ROOT>/public/data`
SCRATCH ROOT (ephemeral only): `/tmp/tradding-dashboard/<session>-YYYYMMDD>/`
  fallback if `/tmp` is not writable: `<PROJECT ROOT>/.agent-scratch/<session>-YYYYMMDD>/`

## 🛑 WRITE PATHS (hard — also in `<PROJECT ROOT>/CLAUDE.md`)
Durable writes ONLY under `DATA ROOT` (report JSON, narrative MD, merged manifest/calibration, portfolio via the ledger, RUN_HISTORY).
Ephemeral files (intent JSON, zod harnesses, build helpers) ONLY under `SCRATCH ROOT`.
NEVER create files at `<PROJECT ROOT>/` root (`val*`, `zcheck*`, `.intent_*`, `.gen_*`, `.tmp_*`, `_val*`, …), NEVER under `scripts/_build_*` / `scripts/_intent_*`, NEVER scratch beside real data in `public/data/`.
Prefer `npx tsx -e '…'` / `node -e '…'` for one-off validation so no harness file is left behind. Unattended runs often cannot delete repo files — that is why scratch must live in `/tmp` (or `.agent-scratch/`).

## 🕐 TIMEZONE — America/Bogota (COT, UTC−5, NO daylight saving)
The user is in Bogotá. Stamp EVERY timestamp — report `generatedAt`, every `asOf`, intent `ts`, and anything the ledger writes (`updatedAt`) — with the **`-05:00`** offset. NEVER use `-04:00` (that is US Eastern EDT and shifts the whole dashboard an hour early; the app renders times in the viewer's local zone). Session clock times in this skill are Bogotá local (COT). When you compute "now", use Bogotá wall-clock with `-05:00`.

## ✅ END-OF-RUN CHECKLIST (do ALL of these every run — these are the recurring misses)
1. Report JSON written AND parses.
2. manifest.json + calibration.json MERGED (prior days/rows intact). **A new manifest day entry MUST carry ALL FOUR session keys (`midnight`, `morning`, `midday`, `endday`) — set any not-yet-run session to `null`, never omit a key. A partial `sessions` object fails the app's zod validation and blanks the WHOLE dashboard.**
3. portfolio.json updated via the ledger script with a REAL stance (see §PORTFOLIO — do not default to HOLD/skip when a defensible low-risk action exists).
4. **Narrative Markdown written to the EXACT app path `<DATA ROOT>/reports/<YYYY>/<MM>/<id>.md`** (NOT `<PROJECT ROOT>/reports/…`). The app loads it from `data/reports/<YYYY>/<MM>/<id>.md`; a missing/misplaced file shows "Narrative unavailable". This is REQUIRED, not optional.
5. **`nonCrypto.indices` populated with ALL THREE of QQQ, VOO, JPXN** (see §NON-CRYPTO) — never ship an empty or partial indices array; the dashboard shows "No non-crypto snapshot" otherwise.
6. **Liquidation data attempted via the browser fallback** if the OKX API is blocked (see §LIQUIDATIONS) — don't ship empty `levels.liquidation` without trying the CoinGlass heatmap screenshot first.
7. **Every timestamp uses the `-05:00` (Bogotá) offset** — grep your outputs for `-04:00` and fix any before finishing (see §TIMEZONE).
8. Validate every JSON parses and still contains prior data. No `git`. Confirm no new files at `<PROJECT ROOT>/` root (scratch must be under SCRATCH ROOT only).
9. **TEST LOCALLY in the app (see §LOCAL TEST)** — if you changed any app code under `src/**`, or want to confirm the report/wallet renders, run the build/lint/ledger gates (and, when a person is present, the dev-server render check) BEFORE finishing.

## §LOCAL TEST — verify changes in the app before finishing
Run from PROJECT ROOT. The package manager is **pnpm** (npm/yarn are blocked by a preinstall guard).
- **Always after editing app code (`src/**`, schema in `src/lib/types.ts`, components, hooks, pages):**
  - `pnpm build` — runs `tsc -b` (typecheck) then `vite build`; must exit 0. This is the primary "does it compile & bundle" gate.
  - `pnpm lint` — ESLint over the repo; must be clean.
  - (fast inner loop, optional) `npx tsc -p tsconfig.app.json --noEmit` for a quick typecheck without bundling. (If `pnpm`/native `rollup` is missing in a sandbox, `node_modules/.bin/tsc -b` still typechecks the whole project.)
- **After editing the ledger (`scripts/paper_wallet.py`):**
  - `python3 scripts/test_paper_wallet.py` (or `python3 -m pytest scripts/test_paper_wallet.py`) — must pass.
  - `python3 scripts/paper_wallet.py --portfolio public/data/portfolio.json --print` — sanity-print state without mutating.
- **Confirm the data actually renders (every run is cheap to check):** after writing the JSON, `pnpm build` also fails if a report violates the zod schema in a way that breaks the build path, so a green build is your signal the new report is consumable. For a stronger check when a PERSON is present/interactive, start the dev server and look at the affected page:
  - `pnpm dev` (Vite, default http://localhost:5173) → open the page you touched (`/markets`, `/wallet`, the report route, etc.) and confirm it renders with the new data; stop the server when done.
  - Headless scheduled runs cannot view the UI — for those, the green `pnpm build` + `pnpm lint` + ledger tests ARE the local test; do not skip them.
- If any gate fails, FIX before finishing; never leave the tree broken. Still NEVER run `git` and never `pnpm data:publish` (publishing is the Mac job's, §PUBLISH).

## SESSION PARAMETERS
| session | approx time (Bogotá / COT) | compare against | narrative title |
|---|---|---|---|
| midnight | 02:00 COT | yesterday's `-endday.json` | BTC Midnight Analysis |
| morning | 06:50 COT | today's `-midnight.json` if present, else yesterday's `-endday.json` | BTC Morning Analysis |
| midday | 12:40 COT | today's `-morning.json` | BTC Midday Analysis |
| endday | 19:30 COT | today's `-midday.json` | BTC End Day Analysis |
Chronological order: midnight → morning → midday → endday. **midnight is the day's first session and the WALLET SEEDER** (it passes `isSeeder:true`; it also revives a bankrupt wallet). It is also the session that USUALLY CREATES the day's manifest entry — so it is the one most on the hook for writing all four session keys (§MERGE RULE). endday ONLY: emit `overnightRisk` (string), honour §OVERNIGHT GAP, and MAY backfill this day's earlier `price_next_report` in calibration.json.

## OUTPUTS
1. Report JSON → `<DATA ROOT>/<YYYY>/<MM>/<YYYY-MM-DD>-<session>.json` (ONLY file written fresh/overwritten by you).
2. MERGE into `manifest.json` — add/replace ONLY this session's pointer; keep every other day/session. On a NEW day, seed all four session keys (§MERGE RULE).
3. APPEND to `calibration.json` — add this run's row; never rewrite existing rows.
4. UPDATE `portfolio.json` via the Python ledger script — see §PORTFOLIO. You NEVER hand-edit portfolio.json.
5. **REQUIRED** narrative Markdown → `<DATA ROOT>/reports/<YYYY>/<MM>/<id>.md` (i.e. `public/data/reports/…`, which the app serves as `data/reports/…`). Do NOT write it to `<PROJECT ROOT>/reports/…` — that path is not served and produces "Narrative unavailable".
6. Do NOT push — leave validated files on disk for the local Mac job.

## 🔒 SCHEMA CONTRACT — STRICT (zod; any type/shape mismatch blanks the whole report)
- Use ONLY documented fields; keep every field's EXACT type. Numbers are JSON numbers; unknown number → `null`, never a sentence.
- Enums: `session` ∈ midnight|morning|midday|endday · `overallBias` ∈ bullish|range|bearish · `biasTilt` ∈ bullish|bearish|null · `decisionBox.position` ∈ HOLD|REDUCE|ADD|TAKE_PROFIT|EXIT.
- `divergences` = `[]` OR array of {type,oscillator,tf,priceFrom,priceTo,oscFrom,oscTo,note}.
- Arrays stay arrays: `levels.support/resistance` = numbers; `levels.liquidation` = {price,side,intensity,magnet,note}; `operations`/`timeframes`/`sources`/`nonCrypto.indices` = the objects shown.
- Uncertainty ONLY as `null` or a short string inside a string field. Never fabricate, never re-type a field.

## ⚠️ MERGE RULE — NEVER OVERWRITE manifest.json / calibration.json
Read → modify parsed structure → write back old+new. Never write from scratch or drop prior days/sessions/rows.
- manifest.json: `days[].sessions` has keys midnight|morning|midday|endday. Set THIS session's pointer, plus `latest` + `updatedAt`; keep days newest-first. **When you CREATE a new day entry, ALWAYS write all four keys — `midnight`, `morning`, `midday`, `endday` — with any session that has not run yet set to `null` (never leave a key out). Omitting morning/midday/endday fails the app's `ManifestDaySchema` and blanks the ENTIRE dashboard ("No data yet / Could not load manifest.json"). Preserve the four keys on existing days. Template for a fresh day: `{"date":"<YYYY-MM-DD>","sessions":{"midnight":<path|null>,"morning":<path|null>,"midday":<path|null>,"endday":<path|null>}}`.**
- calibration.json: append this run's row; keep existing rows (endday may backfill this day's `price_next_report`).
- portfolio.json is owned by the ledger script (§PORTFOLIO) — do not edit it directly.
- Validate each file parses AND still contains prior data after writing.

## 🚫 PUBLISH — never run git
Never run ANY `git` command. A git call leaves a stale `<PROJECT ROOT>/.git/index.lock` that blocks the user's local commits; if one ran, `rm -f <PROJECT ROOT>/.git/index.lock`. Do NOT `pnpm data:publish`. Publishing is owned by `scripts/auto-push-data.sh` on the user's Mac.

## ⚠️ RULE 1 — DATA INTEGRITY
Never invent/estimate a number (except an EXPLICITLY-LABELLED estimate where allowed). Sourced (name + timestamp) or computed-with-math-shown, else `null`. Blocked exchange APIs are NOT permission to fake numbers. Never carry a value forward without re-verifying — EXCEPT a genuine last-close when the market is closed (weekend/holiday), which you MAY reuse if you label it "Friday/last close, market closed". For EMAs print 20/50/100/200 and check price against each. Prefer OKX public API (free, keyless) / Cryptonomist / Investing.com / StockAnalysis; CoinGlass only if a key is configured. If OKX and other primary feeds are blocked, still complete the REST of the report from the allowed web tools (search/fetch) — a blocked liquidation feed does not excuse skipping price, macro, ETFs, narrative, or the wallet trade.

## 🛑 OVERNIGHT GAP (endday only)
Next report is ~02:00 tomorrow; the overnight gap is where the worst moves happen. A resting stop is the only overnight protection. If BTC is near the reduce level set `decisionBox.stopOrder.recommended` = true with the exact price and fill `overnightRisk` with specific catalysts. A big liquidation magnet just below into thin liquidity makes the stop matter more.

## REPORT JSON SHAPE (schemaVersion "1.0.0")
```
{
  "schemaVersion":"1.0.0","id":"<YYYY-MM-DD>-<session>","date":"<YYYY-MM-DD>","session":"<session>",
  "generatedAt":"<ISO -05:00>","asset":"BTC-USDT",
  "overallBias":"bullish|range|bearish","biasTilt":"bullish|bearish or null","confidence":<0-10,2dp>,
  "priceSnapshot":{"value":<num>,"currency":"USD","changePct":<num|null>,"source":"","asOf":"<ISO -05:00>","note":"","sessionRange":{"low":<num|null>,"high":<num|null>}},
  "decisionBox":{"position":"HOLD|REDUCE|ADD|TAKE_PROFIT|EXIT","reduceIf":{"price":<num>,"confirmation":""},"addIf":{"price":<num>,"confirmation":""},"invalidatesAt":<num>,"stopOrder":{"recommended":<bool>,"price":<num>},"changed":""},
  "overnightRisk":"<endday only; omit otherwise>",
  "probabilities":{"bullish":<x.xx>,"range":<x.xx>,"bearish":<x.xx>},   // sum 100.00
  "levels":{"support":[...],"resistance":[...],"liquidation":[{"price":<num>,"side":"above|below","intensity":"low|medium|high|extreme","magnet":<bool>,"note":""}],"liquidityMagnet":{"nearestAbove":<num|null>,"nearestBelow":<num|null>,"pull":"up|down|balanced","source":"","asOf":"<ISO -05:00>","note":""}},
  "atr":{"value":<num|null>,"period":14,"pct":<num|null>,"source":"","asOf":""},
  "timeframes":[{"tf":"15m|1h|4h|daily","rsi":<num|null>,"macd":{"line":<num|null>,"signal":<num|null>,"hist":<num|null>},"emas":{"ema20":<num|null>,"ema50":<num|null>,"ema100":<num|null>,"ema200":<num|null>},"structure":"","bias":"","source":"","asOf":"<ISO -05:00>"}],
  "operations":[
    {"horizon":"swing","market":"futures","action":"long|short|wait","entry":[<num>]|null,"stop":<num|null>,"tp":[<num>...],"rr":<num|null>,"confidence":<num|null>,"hold":"days-weeks"},
    {"horizon":"position","market":"spot","action":"hold|reduce|add","entry":null,"stop":<num|null>,"tp":[<num>...],"rr":null,"confidence":<num|null>,"hold":"weeks-months"},
    {"horizon":"spot_core","market":"spot","action":"HOLD|REDUCE|ADD","entry":null,"stop":<num|null>,"tp":[],"rr":null,"confidence":<num|null>,"hold":"long-term"}
  ],
  "scalpContext":{"intradayBias":"","longAbove":<num>,"shortBelow":<num>,"invalidates":<num>,"note":"Scalp only the edges — live signals come from the chart, not this report."},
  "macro":{"brent":{"value":<num>,"changePct":<num>},"dxy":{"value":<num>},"us10y":{"value":<num>},"etfFlows":{"streakDays":<num>,"note":""},"liquidations":{"longsUsd":<num|null>,"shortsUsd":<num|null>,"skew":<num|null>,"traders":<num|null>,"openInterestUsd":<num|null>,"note":""},"fearGreed":<num|null>,"earnings":[{"ticker":"","reaction":"","note":""}]},
  "nonCrypto":{"indices":[<QQQ, VOO, JPXN — see §NON-CRYPTO>],"stockWatchlist":[]},
  "divergences":[],
  "calibration":{"priorReduceFired":<bool|null>,"actingHelped":<bool|null>,"rollingRecord":"","note":""},
  "sources":[{"title":"","url":""}]
}
```

## §LIQUIDATIONS + derivatives positioning — FREE / no-account by default (OKX public API)
DEFAULT (free, keyless — no account/API key; Binance & Bybit are geo-blocked from some hosts, OKX works):
- Open interest: `https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP` → `data[0].oiUsd` → `macro.liquidations.openInterestUsd`.
- Funding: `https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP` → `data[0].fundingRate` (positive = longs pay = crowded longs).
- Long/short account ratio: `https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=1H` → newest → `macro.liquidations.skew` (ratio>1 = longs crowded, downside-vulnerable; explain in `note`).
- Realized liquidations: `https://www.okx.com/api/v5/public/liquidation-orders?instType=SWAP&uly=BTC-USDT&state=filled&limit=100` → bucket `details[].bkPx`×`sz`. FRESHNESS GUARD: if newest `bkPx`/`ts` is far from current spot/old (this feed is sometimes delayed), DISCARD it.
NOTE ON SANDBOX ACCESS: `curl` from the sandbox shell is often blocked (connection reset). Use the `web_fetch` tool for the OKX endpoints instead. FRESHNESS GUARD (critical): OKX has repeatedly returned STALE month-old cached values through the run proxy (e.g. a `ts` weeks in the past, price ~$78k when spot is ~$64k) — always convert the `ts` and DISCARD any feed whose timestamp is not close to "now"; do not build levels or positioning from a stale feed.
Build `levels.liquidation` from VERIFIED data: fresh realized-liq clusters (bucket USD→intensity, magnet=true on the largest, side vs spot); if none fresh, a LABELLED leverage-bracket ESTIMATE: long-liq ≈ price×(1−1/L), short-liq ≈ price×(1+1/L) for L∈{10,25,50,100} anchored to support/resistance, `note`="Estimated leverage-bracket magnet — not exchange resting-order data". Never present an estimate as measured. `levels.liquidityMagnet`: nearestAbove/nearestBelow + `pull` toward the crowded side; `source` = OKX endpoints used; `asOf` = now (`-05:00`).
OPTIONAL UPGRADE: if the `coinglass` skill (COINGLASS_API_KEY) is installed, prefer its `api/futures/liquidation/aggregated-heatmap/model1` (true forward heatmap).
🌐 BROWSER FALLBACK (do this BEFORE nulling — it works and is the preferred fallback): if the OKX API path is blocked (proxy 403 / TLS interception) AND the Claude-in-Chrome browser tools are available with a connected browser, read CoinGlass directly:
  1. `tabs_context_mcp{createIfEmpty:true}` → `navigate` to `https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair`.
  2. `wait` ~2-3s for the canvas to render, then `screenshot`; `scroll` the chart into view and `zoom` the region around the current price + right-hand price axis so you can read the exact levels.
  3. Read the MAGNETS from band brightness (yellow = strongest → `intensity:"extreme"`, green = high/medium, blue = low; `magnet:true` on the single brightest), each with its price from the axis and `side` vs current spot. Read the HEADER aggregates (exact text): Open Interest → `openInterestUsd`; 24h Liquidation total → `note` (header rarely splits long/short USD, so leave `longsUsd`/`shortsUsd` null); 24h Long/Short % → `skew` = long%/short% (>1 longs crowded, <1 shorts crowded).
  4. Set `source` = "CoinGlass Liquidation Heatmap Model 3 (Binance BTC/USDT perp, 48h), read via browser screenshot" with the COT `asOf`. Reading a heatmap is qualitative for USD magnitude — price LEVELS and the header aggregates are solid; don't invent precise USD per band.
⚠️ FEASIBILITY NOTICE: only if BOTH the OKX API AND the browser fallback are unavailable, DO NOT fabricate — set affected fields to `null`/`[]`, AND alert the user: say it plainly in the narrative "Liquidation map" section and add a `sources` note like "OKX free liquidation feed unavailable/stale this run; browser fallback also unavailable — consider a keyed CoinGlass source". Then CARRY ON with the rest of the report (price, macro, ETFs, narrative, wallet).

## §PORTFOLIO — paper-wallet relay, computed by `scripts/paper_wallet.py` (DO NOT do the math yourself)
The wallet accounting is deterministic and handled ENTIRELY by a Python script — you never hand-edit `portfolio.json`, never compute equity/PnL/expenses. Your only job: decide the trade and hand the script VERIFIED inputs. The script does: SL/TP/liquidation auto-resolution from the session range, mark-to-market of BOTH books, 20% sweep of realized gains to savings, the 30 USDT cost-of-living debit on the 1st (first month is grace), **bankruptcy → FREEZE** (flatten to cash + hall-of-shame + `status:"bankrupt"`; the wallet stops trading), **and revival by the midnight seeder only** (reset to 100 flat, `round += 1`, `status:"active"`), scoreboard attribution, hand-off messages/lessons, net worth. Model: ONE relayed wallet (not real money), TWO books — SPOT (BTC outright, long-only) + FUTURES (one perp, long/short, leverage ≤3, margined by cash) — plus free cash and an untouchable savings bucket. NO FEES / NO TAXES, net only.

**⚠️ BE A TRADER, NOT A SPECTATOR — avoid passive no-ops.** The dashboard is a trading game; a wall of `HOLD`/`skip` marks looks broken and defeats the point. Take a real stance every run:
- Prefer an actual position change whenever a defensible LOW-RISK action exists. A small, direction-agnostic **spot DCA** into the long-term core (e.g. deploy 15-40 USDT of idle cash near support/on a reclaim) is legitimate even in low conviction and even when the directional bias is only mild — it is NOT the "forced bad trade" the next line warns against.
- Still avoid a FORCED BAD *leveraged* trade: don't open futures mid-range with no edge just to be active. When you genuinely have no edge for leverage, express the stance in spot instead of sitting idle.
- **The midnight SEEDER must put some cash to work** — deploy at least a small starter tranche rather than leave 100 USDT fully idle, unless price is right at the invalidation with a clear reduce signal.
- `hold` (mark only) and `skip` are LAST resorts, reserved for when the wallet is already positioned as you want OR the setup is genuinely poor. Never chain them: the script caps skips at 2 in a row, but you should rarely reach even 1.
- Keep `decisionBox.position`, the `operations[]` actions, and the ledger `decision.type` CONSISTENT with each other and with the trade you actually run.

STEPS each run:
1. READ `<DATA ROOT>/portfolio.json` for CONTEXT ONLY (prior position, `status`, `expenses.nextChargeAt`, `lessons`, recent `hallOfShame`, `messages`) — let it inform your decision.
2. VERIFY from the chart/data: current spot `markPrice`, plus the session `sessionHigh`/`sessionLow` SINCE the last snapshot (for SL/TP resolution). These MUST be verified numbers. If you cannot verify a fresh spot, SKIP the portfolio step (do not run the script) and say so in the narrative.
3. CHOOSE exactly ONE `decision` per the "BE A TRADER" guidance above. When opening futures ALWAYS set `stop` and `tp`. Leverage ≤3. Tie it to the report's levels + liquidity magnet.
4. WRITE the intent JSON to a FRESH temp file under SCRATCH ROOT (stamp `ts` with `-05:00`), then RUN (bash):
   ```bash
   SCRATCH=/tmp/tradding-dashboard/<session>-YYYYMMDD
   mkdir -p "$SCRATCH" || SCRATCH=<PROJECT ROOT>/.agent-scratch/<session>-YYYYMMDD && mkdir -p "$SCRATCH"
   # write intent to $SCRATCH/intent.json (unique per run — include HHMM if re-running)
   python3 <PROJECT ROOT>/scripts/paper_wallet.py --portfolio <DATA ROOT>/portfolio.json --intent "$SCRATCH/intent.json"
   ```
   midnight passes `"isSeeder": true`; morning/midday/endday pass `false`. Run the script EXACTLY ONCE per session (a second run appends a duplicate snapshot for the same session — avoid it; get the decision right the first time).
   ⚠️ INTENT-FILE HYGIENE: write the intent to a UNIQUE path under SCRATCH ROOT and CONFIRM the write succeeded before running. Prefer `/tmp/tradding-dashboard/…`. If `/tmp` is NON-writable, use `<PROJECT ROOT>/.agent-scratch/…` ONLY — NEVER the repo root, NEVER `scripts/`, NEVER `public/data/`. NEVER reuse a stale filename from a prior day: a leftover intent will silently run the ledger with WRONG mark/decision. After the run, verify the printed summary's `mark` equals THIS run's `markPrice` and the `action` matches your decision; if not, you ran a stale/wrong intent — restore `portfolio.json` to its pre-run state (pop the bad snapshot, restore `latest`/`updatedAt`, revert the scoreboard count) and re-run once with the correct intent.
5. CHECK exit code: 0 = done; 2 = rule violation (e.g. 3rd skip in a row → pick a real stance, re-run); 3 = bad input (fix, re-run). Then confirm `portfolio.json` still parses. NEVER edit it by hand (except to UNDO a bad/stale-intent run as in step 4). Quote the script's one-line summary in the narrative's "Paper wallet" section (including `FROZEN`/`BANKRUPTCY`/`RESET` if it printed one).

**Bankruptcy freeze / midnight revive:** once bankrupt, the wallet is frozen. A NON-midnight session's run just records a `FROZEN` no-op (it cannot trade) — report it in the narrative. The NEXT **midnight** session (isSeeder) revives it to 100 USDT flat and starts a new round. You still run the script the same way every session; it auto-detects and handles freeze/revive.

INTENT JSON (stamp `ts` with the Bogotá `-05:00` offset):
`{"session":"<session>","reportId":"<id>","ts":"<ISO -05:00, e.g. 2026-07-25T02:05:00-05:00>","today":"<YYYY-MM-DD>","markPrice":<num>,"sessionHigh":<num|null>,"sessionLow":<num|null>,"isSeeder":<bool>,"rationale":"<English, why>","message":{"to":"<session|all>","text":""}?,"lesson":{"pattern":"","insight":""}?,"decision":{ ...see below... }}`
DECISION types (pick one):
- `{"type":"hold"}` — mark only, keep books. (Last resort — see "BE A TRADER".)
- `{"type":"skip"}` — no trade (poor setup); ≤2 in a row. (Last resort.)
- `{"type":"spot_buy","usd":<cash→BTC>}` · `{"type":"spot_sell","btc":<amt>}` or `{"type":"spot_sell","fraction":0..1}`.
- `{"type":"fut_open","side":"long|short","sizeUsd":<notional>,"leverage":1..3,"stop":<num>,"tp":[<num>...]}`.
- `{"type":"fut_reduce","fraction":0..1}` · `{"type":"fut_close"}` · `{"type":"fut_flip","side":..,"sizeUsd":..,"leverage":..,"stop":..,"tp":[..]}`.
Rules (sweep %, expense amount/cadence, quota, leverage cap, freeze/revive) live IN the script — if the user changes them, edit `scripts/paper_wallet.py`, not this skill. After editing the script, run its tests (§LOCAL TEST).

## §NON-CRYPTO — QQQ, VOO, JPXN monthly-DCA signal (ALL THREE, EVERY RUN)
`nonCrypto.indices` MUST contain an entry for EACH of QQQ, VOO, and JPXN on every run — never an empty or partial array. For EACH: `{"ticker","price":<last close>,"changePct":<num>,"bias":"","note":"","dcaSignal":{...},"source":{"title":"… — StockAnalysis","url":"https://stockanalysis.com/etf/<ticker>/"}}`.
- Get the latest daily close from StockAnalysis / Yahoo / Investing (via the allowed web tools). US ETFs (QQQ, VOO) and JPXN do NOT trade on weekends/holidays — on those days reuse the LAST verified close and label it in `note` ("Friday/last close, market closed; no new session"). That labelled reuse is allowed under RULE 1.
- If after honest effort a ticker's close is truly unverifiable, still EMIT the entry with `price`/`changePct` = `null`, a `note` saying why, and omit `dcaSignal` — but do this only as a genuine last resort, and never for more than the one feed that failed.
- Compute `dcaSignal` from the last ~21 daily closes (only if ≥15 verified, else OMIT it): percentileInMonth=round((last−min21)/(max21−min21)×100); pctVs20dAvg=round2((last/mean20−1)×100); pctFromHigh=round2((last/max21−1)×100); rsi14=Wilder RSI(14) last; zone ∈ very-cheap|cheap|fair|rich (very-cheap if pct≤10 or (pct≤20 & rsi<35); cheap ≤30; fair ≤70; else rich); note:"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call." On a market-closed day you MAY carry the prior session's computed dcaSignal, labelled "carried from last close".

## §NARRATIVE MD (REQUIRED) → `<DATA ROOT>/reports/<YYYY>/<MM>/<id>.md`
Write the narrative to `public/data/reports/<YYYY>/<MM>/<id>.md` (the app serves it as `data/reports/<YYYY>/<MM>/<id>.md`). Do NOT use `<PROJECT ROOT>/reports/…`. A missing/misplaced file renders "Narrative unavailable" in the app. English, concise, prose only. Sections: title + bias/confidence; Bias review; What changed; Technical read (15m/1h/4h/daily); Liquidation map — where the magnets are (state the data source; if the free feed was unavailable/stale and you used the browser fallback, say so); Macro & flows (+VOO/QQQ/JPXN DCA); Paper wallet — quote the ledger script's summary (spot vs futures books, what auto-resolved, expenses/savings, and any FROZEN/BANKRUPTCY/RESET); The trade / (endday: Overnight plan); Key risks; then `_Educational quantitative analysis, not individualized financial advice._`

## §CALIBRATION (row to APPEND)
`{"date","session","bias":"<e.g. range-bear>","bull_pct":<x.xx>,"range_pct":<x.xx>,"bear_pct":<x.xx>,"reduce_level":<num|null>,"reduce_fired":<bool|null>,"add_level":<num|null>,"add_fired":<bool|null>,"price_at_report":<num|null>,"price_next_report":null,"acting_helped":<bool|string|null>}`

Validate every JSON parses AND matches the SCHEMA CONTRACT before finishing, confirm all timestamps use `-05:00`, and run §LOCAL TEST if any app code changed. Thin data → smaller honest report, never fabricate.

