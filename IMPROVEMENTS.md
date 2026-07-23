# BTC Signal Desk — QA & Improvement Plan (v1 review)

**Reviewed:** 2026-07-23 · dev server `127.0.0.1:5173/btc-dashboard/`
**Lens:** (1) QA / correctness, (2) a trader who must decide on **BTC, VOO and QQQ** and make money.

---

## 0. Verdict — what's already good

The v1 is genuinely solid and on-plan:

- Clean architecture, files under the 250-line budget, naming conventions respected, **zero console errors** on load.
- The **Decision Box** (Reduce / Add / Invalidates / Stop) is exactly the actionable, glanceable output the whole project was meant to produce. This is the strongest part of the app.
- **Operations by timeframe** (Scalping / Swing / Position / Spot) render with Long/Short cards.
- **History** reads the seeded manifest correctly (22, 21, 20, 17) with session tags and Contrast/Studies actions.
- Dark theme is polished; live BTC price + per-session "Δ vs snapshot" strip is a nice touch; InfoPopover tooltips exist.

The gaps below are about **trustable indicators**, **the calibration story**, and **covering VOO/QQQ** — not about rebuilding anything.

---

## 1. 🔴 P0 — Correctness bugs (fix first; they undermine trust)

### 1.1 MACD panel is empty & RSI line is truncated (Studies)
**Symptom:** On Studies (default `1h`), the **MACD(12,26,9) panel renders nothing** and the **RSI(14) line only covers the last ~30%** of the x-axis.
**Root cause:** `IndicatorStudiesPage` fetches klines for a **single day** via `dayBoundsEt(date)`. At `1h` that's ~24 candles; at `4h` ~6. MACD needs **26+9=35** bars of warmup → no output. RSI needs **14** → only a handful of points. Only the `1d` interval is special-cased to widen the window (`- 90 days`); `15m/1h/4h` are not. EMA50/200 cross detection needs 200 bars and can never fire intraday.
**Fix:** fetch a **warm-up lookback** before the display window. Either (a) request a fixed rolling window (`fetchKlines` with `limit: 500` ending at the day's end), or (b) extend `startTime` by `N × intervalMs` where `N ≥ 200`. Then clip the *rendered* range to the report day but compute indicators on the full series. One change in `IndicatorStudiesPage` + a small `intervalToMs` helper.
**Files:** `src/pages/IndicatorStudiesPage.tsx`, `src/hooks/useKlines.ts`.

### 1.2 Moving averages are computed but never drawn
**Symptom:** Subtitle says "RSI / MACD / **MAs** from live klines", but **no MA lines appear** on the price panel. The page computes EMA50/200 crosses and prints them as text only.
**Fix:** add a `MovingAveragesOverlay` layer to `PriceLevelsChart` (or pass MA series in) rendering MA 20/50/100/200, with golden/death-cross markers. This was in the plan (§16 charts) and the math already exists in `indicators/movingAverages.ts`.
**Files:** `src/components/charts/PriceLevelsChart.tsx` (+ new `MovingAveragesOverlay.tsx`).

### 1.3 Divergences are implemented but not wired to any UI
**Symptom:** `indicators/divergenceScan.ts` (`findSwingPivots`, `scanDivergences`) exists, but there is **no divergence overlay or toggle** anywhere. The plan's headline analytics feature (regular + hidden bullish/bearish) is invisible to the user.
**Fix:** add a `DivergenceOverlay` on the price + RSI/MACD panels with toggles by type (regular/hidden × bull/bear) and oscillator, plus the config controls (`pivotLookback`, min/max bars) from the plan §8.2. Depends on 1.1 (needs a long-enough series to find pivots).
**Files:** new `src/components/charts/DivergenceOverlay.tsx`, `IndicatorStudiesPage.tsx`.

### 1.4 Price chart y-axis compresses the candles
**Symptom:** On both the dashboard and Studies price charts, the y-domain spans **$63k–$68k** (driven by the report's support/resistance levels) while price only moved **$65.5k–$66.5k**, so the candles are squashed into a thin ribbon and intraday structure is unreadable.
**Fix:** compute the y-domain from **`[min(low, nearestLevels), max(high, nearestLevels)]`** with padding, or add a "Fit price / Fit levels" toggle. Keep far-away levels as edge markers instead of stretching the axis.
**Files:** `src/components/charts/PriceLevelsChart.tsx` (y-scale domain).

---

## 2. 🟡 P1 — Trading-value gaps (the app must serve BTC **and VOO/QQQ**)

### 2.1 VOO and QQQ have no home in the app
**Biggest functional gap vs. your goal.** The reports already carry `nonCrypto.indices` (QQQ/VOO level, bias, note) and a `stockWatchlist`, but **nothing in the UI surfaces them**. A trader who came to "decide on BTC, VOO and QQQ" currently sees BTC only.
**Fix (phased):**
- **P1a (no new data):** a **Non-crypto panel** on the dashboard + a `/markets` page rendering `nonCrypto.indices` and `stockWatchlist` from the report JSON (bias, level, note, and for stocks: key stat / valuation / analyst view / risk).
- **P1b (live):** live VOO/QQQ quotes. No keyless source exists (Binance is crypto-only). Pick per plan §9 — snapshots for now, or a referer-restricted free key. **Do not** embed a brokerage/account key in a public bundle.

### 2.2 Calibration doesn't answer "are these calls right / making me money?"
This is the section you said you don't understand — and it's genuinely unclear (see §4 for the redesign). Today it shows an **opaque composite score** that defaults to 0.5, so with one day of data the line is **flat and meaningless**, and the table's `REDUCE FIRED / ADD FIRED / HELPED` columns aren't explained.

### 2.3 Macro / news / catalysts aren't surfaced
Reports contain rich `macro` (Brent, ETF flows, liquidations, Fear & Greed, earnings) and `sources`, but the UI only shows the one-line `decisionBox.changed`. A trader needs the **why**. Add a compact **"What's moving it"** strip per session: Fear & Greed gauge, ETF-streak, liquidation skew, top 2–3 catalysts, and source links.

### 2.4 Predicted-vs-actual isn't closed into a P&L story
The candles + levels overlay is great, but it doesn't say **whether following the call would have paid**. Add a marker where each REDUCE/ADD level was actually hit during the day, and a small "would-have-worked" tag (this also feeds calibration honestly).

---

## 3. 🟢 P2 — Visual / UX polish

- **Empty/again-loading states:** the MACD panel currently just looks broken. Add "Not enough bars to compute MACD at this timeframe" until 1.1 lands, and skeleton loaders for charts.
- **Chart axes & legends:** RSI panel needs 30/50/70 zone shading; MACD needs a zero line + histogram; every chart needs a one-line "how to read this."
- **Session columns on mobile:** verify the three columns stack (`lg:` breakpoint) — responsive couldn't be confirmed in review. Test at 390 px.
- **Live price staleness:** show a "updated 12s ago" timestamp and a subtle pulse; on 429/stale, dim it rather than showing a possibly-old number confidently.
- **Color semantics:** greens/reds for bull/bear are good; make sure the purple accent doesn't collide with "Add" (currently both purple-ish) on the level legend.
- **Bias badge legend:** a tiny key for RANGE/BULLISH/BEARISH colors.
- **Keyboard/focus states** on the nav and date filter for accessibility.

---

## 4. Fixing the Calibration section (your specific question)

**What it's trying to be:** a scorecard answering *"when the report said REDUCE/ADD at a level, did price actually hit it, and would acting have beaten holding?"* — tracked over time so you learn to trust (or distrust) the signal.

**Why it's confusing today:**
1. The plotted "score" is a composite that mixes *level-hit-rate* with *acting_helped* and **defaults to 0.5** when unknown — so with sparse data the line sits flat in the middle, meaning nothing.
2. With one day loaded, **both x-axis labels read "07-22"** and there's no y-axis, no legend, no "up = good."
3. The table columns **REDUCE FIRED / ADD FIRED / HELPED** are unexplained; `HELPED = no-move / —` is cryptic.

**Redesign proposal (make it a plain scorecard, not an abstract line):**
- Replace the composite score with **three concrete, separately-labeled metrics**, each with a plain-language header:
  - **Direction hit-rate** — did the session's bias match the actual close-to-close move? (Bull call + price up = hit.)
  - **Level accuracy** — of the REDUCE/ADD levels named, how many did price actually reach that session?
  - **"Would-acting-have-helped"** — on the reports where a REDUCE fired, did selling beat holding by the next report? (This is the "did it make money" line.)
- Show each as a **rolling %** over the last N sessions with a big number + sparkline, not one opaque curve.
- Rename table columns to questions: **"Bias correct?" · "Reduce level hit?" · "Add level hit?" · "Acting beat holding?"** with ✓/✗/— and tooltips.
- Until there are ≥5 sessions, show *"Building track record — N of 5 sessions logged"* instead of a flat line.
- Populate `calibration.json` (currently empty) from the day JSONs so the page has real rows.

This turns Calibration from an abstract chart into the answer to *"should I trust today's call?"*

---

## 5. Suggested order of work

| Step | Item | Why first |
|---|---|---|
| 1 | **1.1 MACD/RSI warm-up window** | The indicators are visibly broken; nothing else matters if charts can't be trusted. |
| 2 | **1.4 y-axis fit** + **1.2 MA overlay** | Makes the price chart actually readable and completes "MAs from klines." |
| 3 | **4. Calibration redesign** | You explicitly can't read it; small data change + clearer metrics. |
| 4 | **2.1 VOO/QQQ panel (P1a, snapshots)** | Closes the biggest goal gap with data you already have. |
| 5 | **1.3 Divergences UI** | Headline analytics feature; needs step 1 done first. |
| 6 | **2.3 macro/news strip + 2.4 hit markers** | Adds the "why" and the P&L story. |
| 7 | **3. polish + responsive verify** | Final pass. |

---

## 6. Notable non-issues (don't waste time here)
- Architecture, file sizes, naming, lint/prettier config: all good.
- Data layer (manifest → reports → zod) and History filtering: working.
- Live BTC price polling and the level-overlay concept: working and valuable.

*Nothing here requires a backend or paid service except the optional live VOO/QQQ feed (§2.1b).*
