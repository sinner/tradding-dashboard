---
name: "btc-paper-desk"
description: "BTC trading-dashboard session workflow: writes report + manifest + calibration JSON, and runs scripts/paper_wallet.py (Python ledger) for the 100-USDT paper-wallet game in AGGRESSIVE risk mode. FREE keyless OKX liquidation/positioning data. Use for the scheduled midnight/morning/midday/endday BTC runs."
---

# BTC Paper Desk — 4-session workflow (v2, aggressive, compact context)

You produce STRUCTURED JSON for the `tradding-dashboard` app for ONE session. The task says WHICH session (`midnight|morning|midday|endday`) and whether it is the WALLET SEEDER (midnight only). Always run `/crypto-levels BTC-USDT` and `/crypto-technical-analyst BTC-USDT` first. All free text in ENGLISH. No email, no ~/crypto-reports, no GitHub push.

PROJECT ROOT `/Users/gabrielgonzalez/workspace/jsinner/tradding-dashboard` · DATA ROOT `<PROJECT ROOT>/public/data`

## 0. CONTEXT BUDGET (read only this — saves tokens)
1. `<PROJECT ROOT>/docs/playbook.md` (~3 KB): risk profile, distilled rules, live accuracy stats. FOLLOW IT.
2. `python3 <PROJECT ROOT>/scripts/paper_wallet.py --portfolio <DATA ROOT>/portfolio.json --context` (~3 KB JSON): wallet state, risk limits (`maxRiskUsd`), benchmark vs buy&hold, last 3 messages, last 5 lessons.
3. The ONE prior report you compare against (§SESSIONS).
NEVER cat/print the whole `portfolio.json` (~1 MB), `calibration.json` (~300 KB) or `lessons-archive.json`. To merge them use a script that loads, modifies and writes — print only counts.

## 1. TIMEZONE — America/Bogota, `-05:00`, no DST
Every timestamp (`generatedAt`, `asOf`, intent `ts`) uses `-05:00`. Never `-04:00`. Session times below are COT.

## 2. SESSIONS
| session | ~time COT | compare against | title |
|---|---|---|---|
| midnight | 02:00 | yesterday `-endday` | BTC Midnight Analysis |
| morning | 06:50 | today `-midnight` else yesterday `-endday` | BTC Morning Analysis |
| midday | 12:40 | today `-morning` | BTC Midday Analysis |
| endday | 19:30 | today `-midday` | BTC End Day Analysis |
midnight = first session + WALLET SEEDER (`isSeeder:true`, revives a bankrupt wallet) and usually creates the day's manifest entry. endday only: `overnightRisk`, §OVERNIGHT, may backfill today's `price_next_report`, and regenerates the playbook (`python3 scripts/build_playbook.py` from PROJECT ROOT).

## 3. OUTPUTS + CHECKLIST (all required)
1. Report → `<DATA ROOT>/<YYYY>/<MM>/<YYYY-MM-DD>-<session>.json` (only file you overwrite).
2. `manifest.json` MERGE: set this session's pointer + `latest` + `updatedAt`, days newest-first. A NEW day entry ALWAYS has all four keys: `{"date":"…","sessions":{"midnight":…,"morning":…,"midday":…,"endday":…}}` with `null` for not-run sessions (a missing key blanks the whole dashboard).
3. `calibration.json` APPEND one row (never rewrite rows; endday may backfill today's `price_next_report`).
4. `portfolio.json` ONLY via the ledger script (§5).
5. Narrative → `<DATA ROOT>/reports/<YYYY>/<MM>/<id>.md` (NOT `<PROJECT ROOT>/reports/`).
6. `nonCrypto.indices` has QQQ, VOO and JPXN every run.
7. Liquidations: OKX first, CoinGlass browser fallback before nulling (§6).
8. grep outputs for `-04:00`; validate every JSON parses and still holds prior data.
9. Local test (§9). Never `git`, never `pnpm data:publish`.
Append one line to `<DATA ROOT>/RUN_HISTORY.md` (date-time COT, what was written, ledger summary, data sources, tabs closed).

## 4. RISK PROFILE — AGGRESSIVE (the user chose this on 2026-11-11)
The history showed a too-timid wallet: futures open in only 7% of snapshots, ~0.2%-of-equity risk per trade, 0.4-0.7% stops hit by noise, 190+ tiny DCA ticks, and net worth BELOW buy&hold. Trade like a real risk-taking trader:
- **Futures are the main weapon.** Each session either holds a futures position, opens one, or writes the specific reason neither range edge offers a setup. Flat futures 3 sessions running needs a strong written reason.
- **Size by risk:** risk 2-3% of equity per trade (`riskLimits.maxRiskUsd` from `--context`). `sizeUsd = riskUsd / stopDistance%`. Leverage up to 5x — leverage only sets margin; the risk cap is what limits loss.
- **Stops:** ≥ 1× 4H ATR beyond the level (ledger floor 0.6%), never at the level itself. TP ≥ 1.5R, first TP at range mid / magnet.
- **Main edge = RANGE FADE** (range calls hit ~80%, bear calls ~3%, bull ~31% — see playbook stats). When range ≥ 40%: long near support / short into resistance. Directional breakout trades only after a 4H CLOSE beyond the level.
- **Spot core:** fewer, larger decisions. No 5-20 USDT DCA ticks unless the playbook stats change. Keep ≥ 25% of equity as free cash for margin/gates.
- **Resting spot stop:** pass `spotStop` in the intent (endday ALWAYS; others when levels change). The ledger fills it from `sessionLow` next run.
- **Month-end:** from the 25th, cash + savings must cover the next expense before opening new leverage.
- The ledger rejects (exit 2) a futures open with no stop, a stop on the wrong side, a stop < 0.6% away or risk > 3% of equity — resize and re-run.
- `hold`/`skip` are last resorts; never 3 skips in a row (ledger enforces).

**GOALS** (read `goals` from `--context`; report them in the narrative's Paper wallet section):
- Performance: beat buy&hold (`benchmark.edgeUsd` > 0 and rising).
- Behaviour, 7-day window: expectancy ≥ +0.3R per closed futures trade; futures in play in ≥ 40% of snapshots.
- Drawdown brake: expense-adjusted net worth ≥ 20% under the round's peak → risk cap halves to 1.5% (ledger enforces; `riskLimits.maxRiskUsd` already reflects it).
- Session league: sessions ranked by avg R of the trades they opened. Win it with good trades, not more trades.
- A missed goal is fine; a forced trade with no edge is not.
Keep `decisionBox.position`, `operations[]` and the ledger `decision` consistent.

## 5. LEDGER — `scripts/paper_wallet.py` (never hand-edit portfolio.json)
The script does SL/TP/liquidation + spot-stop resolution from the session range, mark-to-market, 20% sweep of realized gains to savings, 30 USDT expense on the 1st, bankruptcy → FREEZE (non-midnight runs record `FROZEN`), midnight revive (100 flat, `round += 1`), scoreboard, messages (pruned to the last 5 days), lessons (the Sunday "Weekly lessons digest" task summarises each week into `lessonDigests` and archives the raw lessons; safety cap 40). `--context` includes `lastWeeklyDigest`.
Steps: verify `markPrice` + `sessionHigh`/`sessionLow` since the last snapshot (if spot can't be verified, SKIP the ledger and say so) → write intent to a UNIQUE fresh file (outside the repo, e.g. `$HOME/work/intent-<id>.json`; never reuse an old one) → run ONCE:
`python3 <PROJECT ROOT>/scripts/paper_wallet.py --portfolio <DATA ROOT>/portfolio.json --intent <file>`
Exit 0 ok · 2 rule violation (fix, re-run) · 3 bad input. Check the printed `mark` equals your markPrice and the action matches; if not, restore the pre-run portfolio (keep a copy before running) and re-run once.
INTENT: `{"session","reportId","ts":"<-05:00>","today","markPrice","sessionHigh","sessionLow","isSeeder":<bool>,"rationale":"","message":{"to","text"}?,"lesson":{"pattern","insight"}?,"spotStop":{"price","fraction"}|null?,"decision":{…}}`
DECISIONS: `hold` · `skip` · `spot_buy{usd}` · `spot_sell{btc|fraction}` · `fut_open{side,sizeUsd,leverage≤5,stop,tp[]}` · `fut_reduce{fraction}` · `fut_close` · `fut_flip{side,sizeUsd,leverage,stop,tp[]}`.
Only add a `lesson` when it is NEW versus the playbook and the 5 recent lessons (one line each, concrete numbers).

## 6. LIQUIDATIONS / POSITIONING (free, keyless)
OKX public API (curl from sandbox is usually 403 → use an in-page `fetch` from a Chrome tab on okx.com):
OI `public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP` → `openInterestUsd` · funding `public/funding-rate?instId=BTC-USDT-SWAP` · L/S `rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=1H` → `skew` · realized liqs `public/liquidation-orders?instType=SWAP&uly=BTC-USDT&state=filled&limit=100` (bucket `bkPx×sz×0.01` USD). Candles `market/candles?instId=BTC-USDT&bar=15m|1H|4H|1Dutc&limit=300` → compute EMA20/50/100/200, Wilder RSI14, MACD 12-26-9, ATR14 (4H).
FRESHNESS GUARD: convert every `ts`; discard stale feeds (OKX sometimes serves weeks-old cache).
`levels.liquidation`: fresh realized clusters, else LABELLED leverage-bracket estimates (long ≈ P×(1−1/L), short ≈ P×(1+1/L), L∈{25,50,100}) with note "Estimated leverage-bracket magnet — not exchange resting-order data".
Fallback if OKX is blocked: CoinGlass `https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair` screenshot (yellow = extreme, magnet on the brightest; header OI / 24h liq / L-S%). If both fail: null the fields, say so in the narrative + `sources`, and carry on.
Macro: Fear & Greed `https://api.alternative.me/fng/?limit=2`; ETF flows Farside `https://farside.co.uk/btc/`; Brent/DXY/US10Y CNBC `https://www.cnbc.com/quotes/@LCO.1,.DXY,US10Y`.

## 7. RULE 1 — DATA INTEGRITY
Never invent a number. Sourced (name + time) or computed with the math shown, else `null`. Weekend/holiday closes may be reused ONLY labelled "last close, market closed". A blocked feed is not permission to fake data — finish the rest of the report.

## 8. SCHEMA CONTRACT (zod — any mismatch blanks the report)
Enums: `session` midnight|morning|midday|endday · `overallBias` bullish|range|bearish · `biasTilt` bullish|bearish|null · `decisionBox.position` HOLD|REDUCE|ADD|TAKE_PROFIT|EXIT. Numbers are numbers (unknown → `null`). Probabilities sum 100.00.
```
{"schemaVersion":"1.0.0","id":"<date>-<session>","date","session","generatedAt","asset":"BTC-USDT",
 "overallBias","biasTilt","confidence":<0-10>,
 "priceSnapshot":{"value","currency":"USD","changePct","source","asOf","note","sessionRange":{"low","high"}},
 "decisionBox":{"position","reduceIf":{"price","confirmation"},"addIf":{"price","confirmation"},"invalidatesAt","stopOrder":{"recommended":<bool>,"price"},"changed"},
 "overnightRisk":"<endday only>",
 "probabilities":{"bullish","range","bearish"},
 "levels":{"support":[n],"resistance":[n],"liquidation":[{"price","side":"above|below","intensity":"low|medium|high|extreme","magnet":<bool>,"note"}],
   "liquidityMagnet":{"nearestAbove","nearestBelow","pull":"up|down|balanced","source","asOf","note"}},
 "atr":{"value","period":14,"pct","source","asOf"},
 "timeframes":[{"tf":"15m|1h|4h|daily","rsi","macd":{"line","signal","hist"},"emas":{"ema20","ema50","ema100","ema200"},"structure","bias","source","asOf"}],
 "operations":[
  {"horizon":"swing","market":"futures","action":"long|short|wait","entry":[n]|null,"stop","tp":[n],"rr","confidence","hold":"days-weeks"},
  {"horizon":"position","market":"spot","action":"hold|reduce|add","entry":null,"stop","tp":[n],"rr":null,"confidence","hold":"weeks-months"},
  {"horizon":"spot_core","market":"spot","action":"HOLD|REDUCE|ADD","entry":null,"stop","tp":[],"rr":null,"confidence","hold":"long-term"}],
 "scalpContext":{"intradayBias","longAbove","shortBelow","invalidates","note":"Scalp only the edges — live signals come from the chart, not this report."},
 "macro":{"brent":{"value","changePct"},"dxy":{"value"},"us10y":{"value"},"etfFlows":{"streakDays","note"},
   "liquidations":{"longsUsd","shortsUsd","skew","traders","openInterestUsd","note"},"fearGreed","earnings":[]},
 "nonCrypto":{"indices":[<QQQ>,<VOO>,<JPXN>],"stockWatchlist":[]},
 "divergences":[] | [{"type","oscillator","tf","priceFrom","priceTo","oscFrom","oscTo","note"}],
 "calibration":{"priorReduceFired","actingHelped","rollingRecord","note"},
 "sources":[{"title","url"}]}
```
NON-CRYPTO entry: `{"ticker","price","changePct","bias","note","dcaSignal":{percentileInMonth,pctVs20dAvg,pctFromHigh,rsi14,zone,note},"source":{"title":"<T> — StockAnalysis","url":"https://stockanalysis.com/etf/<t>/"}}`. Closes from `https://stockanalysis.com/etf/<t>/history/` (read the table via JS). dcaSignal from ≥15 of the last 21 closes: percentile=round((last−min21)/(max21−min21)×100); pctVs20dAvg=round2((last/mean20−1)×100); pctFromHigh=round2((last/max21−1)×100); rsi14 Wilder; zone very-cheap (pct≤10 or pct≤20 & rsi<35) | cheap ≤30 | fair ≤70 | rich; note "Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call." Unverifiable → price/changePct null, note why, omit dcaSignal.
CALIBRATION ROW: `{"date","session","bias":"<e.g. range-bear>","bull_pct","range_pct","bear_pct","reduce_level","reduce_fired":null,"add_level","add_fired":null,"price_at_report","price_next_report":null,"acting_helped":null}`.

## 9. NARRATIVE + LOCAL TEST
Narrative (English, prose, concise): title + bias/confidence; Bias review; What changed; Technical read (15m/1h/4h/daily); Liquidation map (state the source); Macro & flows (+VOO/QQQ/JPXN DCA); Paper wallet (quote the ledger one-liner, both books, auto-exits, benchmark edge vs buy&hold); The trade (endday: Overnight plan); Key risks; then `_Educational quantitative analysis, not individualized financial advice._`
Local test from PROJECT ROOT: `python3 scripts/test_paper_wallet.py` if the ledger changed; `node_modules/.bin/tsc -b` (or `pnpm build` + `pnpm lint` if pnpm exists) if `src/**` changed. Optional zod check: transpile `src/lib/types.ts` with tsc to a temp dir and `safeParse` the new report, manifest, portfolio and calibration.

## 10. OVERNIGHT (endday)
Next report ~02:00. Always set a ledger `spotStop` under the key support and `decisionBox.stopOrder.recommended=true` with that exact price; open futures must carry a stop. Fill `overnightRisk` with specific catalysts (liquidation magnets into thin Asian liquidity, ETF prints, macro events).

## 11. HARD RULES
Never run ANY `git` command (a stale `.git/index.lock` blocks the user's commits; if one ran: `rm -f <PROJECT ROOT>/.git/index.lock`). Never `pnpm data:publish`. Browser hygiene: close every tab/tab group this run opened (`tabs_context_mcp` → `tabs_close_mcp`), never touch pre-existing tabs, and state it in the summary.
