# BTC Reports Dashboard — Architecture & Build Plan

**Version:** 1.2 · **Date:** 2026-07-23 · **Owner:** Jose Gabriel
**Stack:** React + TypeScript + D3.js · **Host:** GitHub Pages (static, no backend)

---

## 1. Goal

A static React web app that shows the historical BTC reports (morning / midday / end-day) and a **daily dashboard** that contrasts the three reports of a day against the **live state** of BTC, VOO and QQQ. No backend. Deployed on GitHub Pages. Reports are produced by the scheduled tasks and pushed to the repo as data files.

## 2. Constraints & core decisions

| Decision                  | Choice                                | Why                                                                                                                  |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Hosting                   | **GitHub Pages only**                 | Free, static, native CI via Actions. No server to run or pay for.                                                    |
| Backend                   | **None**                              | All dynamic data comes from public browser-callable APIs.                                                            |
| Report → app contract     | **JSON twin per report**              | The browser must never parse prose Markdown for numbers. Each run emits a machine-readable `.json` beside the `.md`. |
| Discovery                 | **`manifest.json` index**             | Static hosts can't list directories; the app reads a manifest to know what exists.                                   |
| Live BTC data             | **Binance public endpoints (no key)** | `/api/v3/klines` + `/api/v3/ticker` are keyless and CORS-enabled.                                                    |
| Live stock data (VOO/QQQ) | **Deferred** (snapshots for MVP)      | No good keyless source; a client-side key is exposed on Pages. See §9.                                               |

### 🔒 Security rule (non-negotiable)

- **Never embed a Binance _account_ API key** (or any secret) in this app. The GitHub Pages bundle is fully public and downloadable. An exposed account key — even read-only — is an account risk.
- Use only **public market-data endpoints** that require no authentication.
- Authenticated or private data would require a proxy/backend, which contradicts "GitHub Pages only." If that need ever appears, revisit hosting (Cloudflare Pages + Workers), don't smuggle a key into the client.

## 3. Data flow

```
Scheduled tasks (morning / midday / endday)
        │  write .md (human)  +  .json (machine)  +  update manifest.json + calibration.json
        ▼
   git commit + push  ──►  GitHub repo (main)
        │
        ├─► GitHub Actions: build Vite app, deploy to Pages
        │
        ▼
   GitHub Pages (static site + /data/*.json)
        │  fetch (same-origin, relative paths)
        ▼
   React app  ──► also fetches live prices/klines from Binance public API
        │
        ▼
   Dashboard: report snapshots vs. live/actual price + D3 charts
```

The app is a pure consumer. The reports and their JSON are the source of truth; live APIs only add the "what's happening right now" overlay.

## 4. The data contract (the heart of the project)

Three file types, all under `public/data/`. Everything ISO-8601 with timezone offset. Percentages to 2 decimals. Prices as numbers, not strings.

### 4.1 `report.json` — one per session per day

Path: `public/data/2026/07/2026-07-22-midday.json`

```jsonc
{
  "schemaVersion": "1.0.0",
  "id": "2026-07-22-midday",
  "date": "2026-07-22",
  "session": "midday", // morning | midday | endday
  "generatedAt": "2026-07-22T13:45:00-04:00",
  "asset": "BTC-USDT",

  "overallBias": "range", // bullish | range | bearish
  "biasTilt": "bearish", // optional nuance
  "confidence": 6.25,

  "priceSnapshot": {
    "value": 65900,
    "currency": "USD",
    "source": "Cryptonomist",
    "asOf": "2026-07-22T09:20:00-04:00",
    "sessionRange": { "low": 65557, "high": 66509 },
  },

  "decisionBox": {
    "position": "HOLD", // HOLD | REDUCE | ADD | TAKE_PROFIT | EXIT
    "reduceIf": { "price": 65380, "confirmation": "1H close below" },
    "addIf": { "price": 66114, "confirmation": "1H hold above" },
    "invalidatesAt": 66527,
    "stopOrder": { "recommended": true, "price": 65380 },
    "changed": "Both catalysts fired and cancelled",
  },

  "probabilities": { "bullish": 23.0, "range": 45.0, "bearish": 32.0 },

  "levels": {
    "support": [65488, 65380, 64350, 64062],
    "resistance": [66114, 66527, 67000],
    "liquidation": [{ "price": 61605, "note": "whale long-liq marker" }],
  },

  "atr": {
    "value": 1553.49,
    "period": 14,
    "pct": 2.36,
    "source": "Cryptonomist",
    "asOf": "2026-07-22T09:43:00Z",
  },

  "timeframes": [
    {
      "tf": "15m",
      "rsi": 40.94,
      "macd": { "line": -81.24, "signal": -98.76, "hist": 17.52 },
      "emas": { "ema20": 66020, "ema50": 66153, "ema100": null, "ema200": 65838 },
      "structure": "on EMA200",
      "bias": "stabilizing",
      "source": "Cryptonomist",
      "asOf": "2026-07-22T09:43:00Z",
    },
    // 1h, 4h, daily ...
  ],

  "operations": [
    {
      "horizon": "scalping",
      "market": "futures",
      "action": "WAIT",
      "entry": null,
      "stop": null,
      "tp": [],
      "rr": null,
      "confidence": null,
      "hold": "minutes-hours",
    },
    {
      "horizon": "swing",
      "market": "futures",
      "action": "short",
      "entry": [65380],
      "stop": 65900,
      "tp": [64350, 64062],
      "rr": 2.53,
      "confidence": 5.75,
      "hold": "days-weeks",
    },
    {
      "horizon": "position",
      "market": "spot",
      "action": "hold",
      "hold": "weeks-months",
      "confidence": 6.0,
    },
    {
      "horizon": "spot_core",
      "market": "spot",
      "action": "HOLD",
      "hold": "long-term",
      "confidence": 6.25,
    },
  ],

  "macro": {
    "brent": { "value": 94.22, "changePct": 3.53 },
    "dxy": null,
    "us10y": null,
    "etfFlows": { "streakDays": 6, "note": "6th consecutive inflow session" },
    "liquidations": {
      "longsUsd": 495000000,
      "shortsUsd": 146000000,
      "skew": 3.4,
      "traders": 199611,
    },
    "fearGreed": 33,
  },

  "nonCrypto": {
    "indices": [
      {
        "ticker": "QQQ",
        "level": "696-702",
        "bias": "cautious",
        "note": "GOOGL+TSLA after the bell",
      },
      {
        "ticker": "VOO",
        "level": "+0.16% intraday",
        "bias": "neutral",
        "note": "energy-led inflation risk",
      },
    ],
    "stockWatchlist": [
      {
        "ticker": "…",
        "company": "…",
        "whyNow": "…",
        "keyStat": "…",
        "valuation": "…",
        "analystView": "…",
        "stance": "…",
        "risk": "…",
        "source": { "title": "…", "url": "…" },
      },
    ],
  },

  "divergences": [
    // OPTIONAL: what the analyst flagged at report time, shown as annotations to
    // compare against what the app computes live from klines. App is source of truth.
    {
      "type": "regular_bullish", // regular_bullish | regular_bearish | hidden_bullish | hidden_bearish
      "oscillator": "rsi", // rsi | macd
      "tf": "4h",
      "priceFrom": { "t": "2026-07-21T08:00:00Z", "price": 64350 },
      "priceTo": { "t": "2026-07-22T00:00:00Z", "price": 64062 },
      "oscFrom": 38.1,
      "oscTo": 41.7,
      "note": "price LL, RSI HL → momentum turning up",
    },
  ],

  "calibration": {
    "priorReduceFired": false,
    "actingHelped": null,
    "rollingRecord": "n/a",
  },

  "sources": [{ "title": "…", "url": "…" }],
}
```

**Design rules**

- Missing/unverifiable value → `null`, never a fabricated placeholder (mirrors the report Data-Integrity rule).
- `schemaVersion` on every file; the app validates with **zod** and tolerates missing optional fields so old reports keep loading.
- Numbers are numbers. Format for display in the app, not in the data.

### 4.2 `manifest.json` — the index

Path: `public/data/manifest.json`

```jsonc
{
  "schemaVersion": "1.0.0",
  "updatedAt": "2026-07-22T13:45:00-04:00",
  "latest": "2026-07-22-midday",
  "days": [
    {
      "date": "2026-07-22",
      "sessions": {
        "morning": "data/2026/07/2026-07-22-morning.json",
        "midday": "data/2026/07/2026-07-22-midday.json",
        "endday": null,
      },
    },
    // newest first
  ],
}
```

### 4.3 `calibration.json` — track record (generated from `_calibration.csv`)

Array of rows: `{ date, session, bias, bull_pct, range_pct, bear_pct, reduce_level, reduce_fired, add_level, add_fired, price_at_report, price_next_report, acting_helped }`. Feeds the "was the call right?" chart.

### 4.4 Raw Markdown (optional)

Keep the `.md` under `public/data/reports/2026/07/…md` so the app can render the full narrative with `react-markdown`. The dashboard/charts read JSON; only the "Full report" tab reads MD.

## 5. Repository layout (monorepo)

```
btc-dashboard/
├─ public/
│  └─ data/                       # kebab-case JSON (see §4): manifest.json, calibration.json,
│                                 #   2026/07/2026-07-22-morning.json, reports/…md (optional)
├─ src/
│  ├─ app/                        # bootstrap: App.tsx, router, providers (QueryClient), ErrorBoundary
│  ├─ pages/                      # route-level (PascalCase): DashboardPage, HistoryPage,
│  │                              #   IndicatorStudiesPage, CalibrationPage, ReportPage
│  ├─ components/
│  │  ├─ ui/                      # design system (PascalCase): Button, TextInput, TextArea,
│  │  │                          #   Checkbox, Radio, Title, Card
│  │  ├─ layout/                  # Shell, Header, Footer, GradientBackground
│  │  └─ charts/                  # D3 components: PriceLevelsChart, RSIChart, MACDChart,
│  │                              #   MovingAveragesOverlay, DivergenceOverlay, ProbabilityBars, CalibrationTrend
│  ├─ hooks/                      # camelCase useXxx: useLivePrice, useKlines, useLatestDay, useManifest
│  ├─ services/                   # camelCase: binanceService, reportService, manifestService,
│  │                              #   stocksService (deferred), loggerService
│  ├─ indicators/                 # pure math: rsi, macd, sma, ema, swingPivots, divergenceScan
│  ├─ lib/                        # cross-cutting: cn (clsx+twMerge), formatters, types (zod schemas)
│  ├─ config/                     # constants, env, route paths, query keys
│  └─ styles/                     # index.css (Tailwind directives + Roboto @fontsource)
├─ .github/workflows/deploy.yml
├─ index.html                     # <html class="dark">
├─ tailwind.config.ts
├─ postcss.config.js
├─ vite.config.ts                 # base: '/btc-dashboard/', @/ alias
├─ tsconfig.json
├─ package.json                   # "packageManager": "pnpm@…"
└─ pnpm-lock.yaml
```

**Why monorepo for MVP:** same-origin relative `fetch('data/...')` — no CORS, no second deploy. If frequent data commits later pollute app history, split `public/data` into a dedicated `crypto-reports-data` repo with its own Pages and fetch cross-origin (raw GitHub + Pages both send permissive CORS). Deferred; not needed for MVP.

## 6. Tech stack & rationale

| Concern         | Choice                              | Rationale                                                                                                                                                                           |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build           | **Vite**                            | Fast, first-class TS, simple `base` config for Pages subpath.                                                                                                                       |
| Package manager | **pnpm**                            | Fast, disk-efficient, strict. Lockfile committed; `packageManager` field pins the version.                                                                                          |
| Language        | **TypeScript**                      | Your default; the zod-inferred report types keep the data contract honest.                                                                                                          |
| Charts          | **D3.js (hybrid)**                  | D3 for math (scales, `line`/`area` generators, axes, `brush`/`zoom`); React owns the SVG DOM. Drop to imperative D3 on a `ref` only for zoom/brush. Avoids dual-DOM-ownership bugs. |
| Server-state    | **TanStack Query**                  | Caching + polling for live prices; clean `staleTime`/`refetchInterval`. Also used for static JSON fetches.                                                                          |
| Validation      | **zod**                             | Runtime-validate every `report.json`; catch a bad file before it reaches a chart. Infer TS types from the schema — single source of truth.                                          |
| Routing         | **react-router**                    | `/` dashboard, `/history`, `/day/:date`, `/calibration`, `/report/:id`.                                                                                                             |
| Markdown        | **react-markdown**                  | Full-report narrative view only.                                                                                                                                                    |
| Styling         | **Tailwind CSS** (dark theme)       | Utility-first; palette as design tokens (§15). `cn()` = clsx + tailwind-merge composes classes DRY.                                                                                 |
| Font            | **Roboto** via `@fontsource/roboto` | Self-hosted (no external request), set as default `font-sans` (§15).                                                                                                                |

## 7. Screens (MVP → later)

1. **Daily Dashboard** (default, today): three columns morning/midday/endday. Each shows the Decision Box, bias badge, probability bars, key levels. A top strip shows **live BTC** vs each report's snapshot. A D3 chart plots the day's **actual** intraday candles (Binance klines) with the report's support/resistance and Decision-Box triggers overlaid — so you _see_ whether a REDUCE level was hit.
2. **Indicator Studies** (stacked, synced-X panels over the price chart — the "trading view"):
   - **Price + Moving Averages**: candles with MA/EMA 20/50/100/200 overlaid; golden/death-cross markers.
   - **RSI(14)** panel: line with 30/50/70 guides.
   - **MACD** panel: line, signal, histogram, crossover markers.
   - **Divergence overlay**: markers + connecting lines drawn on price _and_ on the oscillator for the four types — regular bullish/bearish and hidden bullish/bearish (see §8.2). Toggle by type, timeframe, and oscillator (RSI or MACD).
   - Timeframe selector (15m / 1h / 4h / Daily) drives all panels from one klines fetch.
3. **History**: a dedicated screen — searchable/filterable list of every past day from the manifest (by date, bias colour, whether a REDUCE fired). Click a day to open its full contrast view and its Indicator Studies at that date. This is where past reports live.
4. **Calibration**: D3 track-record chart from `calibration.json` — how often the call/levels were right, rolling record.
5. **Full Report**: the narrative `.md` rendered to HTML.
6. **Non-crypto panel**: QQQ/VOO snapshot + the long-term stock watchlist table.

## 8. Live data layer

- **BTC live price**: `GET https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT` — keyless, CORS-ok. Poll every 30–60 s via TanStack Query.
- **BTC intraday candles**: `GET https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=15m&startTime=…` — keyless. Powers the predicted-vs-actual overlay.
- **"Predicted vs actual"**: for a given day, plot klines and overlay that day's report levels + trigger prices. This is the feature that answers your original complaint ("tell me when to act") — visually, after the fact and in real time.
- **History fetch**: klines paginate at 1000 bars/request; page backwards with `endTime` to build multi-day/week series for the History screen. Cache per (symbol, interval, range) via TanStack Query.

### 8.1 Derived indicator series (RSI / MACD / MA) — computed client-side

The report JSON only holds indicator **snapshots** (one value at report time). Continuous charts need the full series, so the app **computes indicators from the klines**, not from the reports:

- Pure functions in `src/indicators/`: `sma`, `ema`, `rsi(14)`, `macd(12,26,9)`. Use the `technicalindicators` npm package for the math, or hand-roll (each is a few lines) to avoid a dependency — both fine.
- Deterministic and testable: unit-test each against known fixtures.
- **Cross-check:** the report snapshot (e.g. RSI 44.98 @ 09:20) is plotted as an anchor dot on the computed RSI line. If the computed value and the reported value diverge badly, that surfaces a data problem in the report — a free integrity check that ties the two systems together.
- Moving averages overlay on price; detect and mark **golden cross** (fast MA crosses above slow) and **death cross** (below).

### 8.2 Divergence detection (regular + hidden)

Computed client-side from price + oscillator (RSI or MACD) over the selected timeframe. Algorithm:

1. **Find swing pivots** on price with a fractal/lookback window (configurable `pivotLookback`, e.g. 3–5 bars each side). Same on the oscillator.
2. **Match pivot pairs**: compare the two most recent same-type pivots (two lows, or two highs) within a `minBars`…`maxBars` distance window so stale pivots aren't paired.
3. **Classify** by comparing the slope of price vs the slope of the oscillator between the matched pivots:

   | Type                | Price       | Oscillator  | Meaning                          |
   | ------------------- | ----------- | ----------- | -------------------------------- |
   | **Regular bullish** | Lower Low   | Higher Low  | reversal up (bottom)             |
   | **Regular bearish** | Higher High | Lower High  | reversal down (top)              |
   | **Hidden bullish**  | Higher Low  | Lower Low   | continuation up (in uptrend)     |
   | **Hidden bearish**  | Lower High  | Higher High | continuation down (in downtrend) |

4. **Render**: draw the connecting line on both the price panel and the oscillator panel, colour-coded by type, with a small legend. Emit a list the History/dashboard can badge.

**Config surfaced in the UI:** oscillator (RSI/MACD), timeframe, `pivotLookback`, `minBars`/`maxBars`, and a toggle per divergence type.

**Honesty note:** divergence detection is heuristic — pivot choice changes results and it produces false positives, especially on lower timeframes. Treat markers as _candidates_, tune the lookback, and confirm against price action. The analyst-flagged `divergences` in the report JSON (§4.1) are shown alongside so you can compare "what the report saw" vs "what the app computes."

## 9. Stock data (VOO/QQQ) — deferred decision

No keyless real-time source for ETFs. Three options, decide when you reach Phase 4:

- **A — Snapshots only (MVP default):** show VOO/QQQ from the numbers captured in each report. Zero secrets.
- **B — Client-side free key** (Finnhub / Twelve Data / Alpha Vantage): live, but the key is visible in the bundle. Acceptable only if the key is **market-data read-only** and **referer/domain-restricted**, and you accept the exposure. Never a brokerage/account key.
- **C — Proxy:** hide the key behind a serverless function — requires leaving "Pages only" (e.g., Cloudflare Pages + Workers). Cleanest, but changes hosting.

## 10. CI/CD & the report-publish pipeline

**App deploy:** `.github/workflows/deploy.yml` — on push to `main`, build Vite, deploy `dist/` to Pages.

**Report publish (automation, Phase 5):** each scheduled run, after writing `.md` + `.json`:

1. Write JSON into a local clone of the repo under `public/data/…`.
2. Update `manifest.json` (prepend/patch the day's session) and append to `calibration.json`.
3. `git add/commit/push` with a **fine-grained GitHub PAT**, scoped to _this one repo_, `contents: write` only. Stored in the task environment via a git credential helper — rotated periodically. (This PAT is not a market secret and never touches the client bundle.)
4. The push triggers Actions → Pages redeploys.

**Backfill (optional Phase 0.5):** I parse the existing `~/crypto-reports/*.md` into `report.json` once — done by me carefully at generation-side, not by the browser — to seed history.

## 11. Phased roadmap

| Phase                         | Deliverable                                                                                                                                                     | Blocks                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **0 — Data contract**         | Finalize the JSON schema (§4). No task changes yet.                                                                                                             | Everything. Do first. |
| **0.5 — Seed report**         | Hand-build one initial `report.json` + `manifest.json` from an existing report, so Phase 1 has real, schema-valid data. Optionally backfill more `.md` history. | App development       |
| **1 — MVP app**               | Vite/React/TS scaffold; load `latest`; Decision Box + probability + levels cards; one D3 chart (live BTC + report levels); deploy to Pages.                     | —                     |
| **2 — Daily contrast**        | 3-session side-by-side; bias/probability evolution; predicted-vs-actual klines overlay.                                                                         | Phase 1               |
| **3 — Indicator studies**     | Client-side RSI/MACD/MA series from klines; stacked synced-X panels; golden/death-cross markers; snapshot cross-check dots.                                     | Phase 1               |
| **4 — Divergences**           | Swing-pivot + divergence scan (regular & hidden, RSI & MACD); overlays + toggles; badge into History.                                                           | Phase 3               |
| **5 — History + calibration** | Manifest-driven date browser (filter by date/bias/REDUCE-fired); per-day studies; D3 track-record chart.                                                        | Phase 1               |
| **6 — Non-crypto**            | QQQ/VOO panel + stock watchlist; decide live-stock option A/B/C.                                                                                                | Phase 1               |
| **7 — Automation (last)**     | Only once the app is done: modify the 3 scheduled tasks to also emit `report.json` + update manifest/calibration and commit+push; Actions auto-deploy.          | Full app              |

**Suggested first slice to feel real fast:** Phase 0 → Phase 1 with a single hand-made `report.json` from today's midday report, one D3 chart, deployed. Then wire automation.

## 12. Open questions / risks

- **Stock live data (§9):** pick A/B/C at Phase 4. MVP doesn't need it.
- **Data-commit noise:** if `public/data` commits clutter app history, split into a data repo (deferred, easy migration since fetch paths are the only change).
- **Time zones:** reports normalize to ET; JSON stores ISO with offset; the app displays in the user's locale.
- **Schema evolution:** bump `schemaVersion`, keep zod tolerant of missing optional fields.
- **Rate limits:** Binance public limits are generous for one polling client; back off on 429.
- **Divergence tuning:** the scan is heuristic and timeframe-sensitive; expose `pivotLookback`/`minBars`/`maxBars`, default conservatively, and label markers as candidates. Unit-test the classifier against fixtures to prevent regressions.
- **Indicator parity:** computed indicators use standard params (RSI 14, MACD 12/26/9, MA 20/50/100/200); if a data source uses different smoothing, the snapshot cross-check dot (§8.1) will reveal the mismatch.

## 13. Cost

**$0.** GitHub repo + Pages + Actions (free minutes ample for this), Binance public API (free). Only a paid path appears if you later choose live stock data via a proxy — optional.

---

## 14. Project rules & conventions

**Package manager: pnpm only.** `pnpm install` / `pnpm dev` / `pnpm build`. Commit `pnpm-lock.yaml`. Pin with the `packageManager` field; optional `preinstall: npx only-allow pnpm` to block npm/yarn.

**Principles: SOLID · KISS · DRY — but no overengineering.**

- One responsibility per file. A component renders; a hook holds React/stateful logic; a service does IO; a `lib` util is a pure transform.
- **Extract on the _second_ repetition, not the first guess.** If the same logic appears twice → pull it into a hook (stateful/React), a service (IO), or a pure util (transform). Reach for an HOC/wrapper only for genuine cross-cutting concerns.
- Prefer composition over abstraction. Don't add a layer "just in case."

**🔑 MAIN RULE — file-size budget: ≤ 250 lines** for every hook, component, and service file. If a file crosses it, split: a big page composes small section components; a big chart separates _scales_ / _render_ / _interaction_. Base UI components should sit well under the limit (~120 lines).

**Naming conventions (one per kind, never mixed):**

| Kind              | Case                 | Pattern      | Example                                   |
| ----------------- | -------------------- | ------------ | ----------------------------------------- |
| Components        | **PascalCase**       | Noun         | `Button.tsx`, `DecisionBox.tsx`           |
| Hooks             | **camelCase**        | `useXxx`     | `useLivePrice.ts`                         |
| Services          | **camelCase**        | `xxxService` | `binanceService.ts`                       |
| Pure utils        | **camelCase**        | verb-noun    | `formatPrice.ts`                          |
| Data files (JSON) | **kebab-case**       | —            | `2026-07-22-midday.json`, `manifest.json` |
| Types / zod       | **PascalCase** types | —            | `Report`, `ReportSchema`                  |
| Folders           | lowercase            | —            | `components/ui`                           |

> Fixes the earlier slip: hooks are **camelCase `useXxx`** (e.g. `useEventHandlers.ts`), never kebab-case like `ad-event-handlers.ts`.

**TypeScript:** `strict: true`; no `any` (use `unknown` + zod at boundaries); explicit return types on **exported** functions; infer internally. Absolute imports via `@/` alias.

**Components:** typed props, `forwardRef` when wrapping a native element, variants via a small map (or `cva`), zero business logic inside UI components.

## 15. Theming & design tokens (palette from the shared image)

**Dark theme by default** (`<html class="dark">`, Tailwind `darkMode: 'class'` so a light theme can be added later). Palette sampled from the Alverse mock:

| Token                 | Hex       | Use                               |
| --------------------- | --------- | --------------------------------- |
| `bg.deep`             | `#081315` | darkest base / text-on-light      |
| `bg.DEFAULT`          | `#0B1A1F` | app background base               |
| `surface` / `bg.soft` | `#17282C` | cards, nav pills, panels          |
| `brand.DEFAULT`       | `#7FB9D6` | logo, links, primary accent       |
| `brand.light`         | `#A7D3E8` | highlighted / hovered accent      |
| `brand.pale`          | `#D0E8F2` | light pill button background      |
| `accent`              | `#E78A5B` | sparing orange highlights (robot) |
| `ink.DEFAULT`         | `#EAF2F4` | primary text on dark              |
| `ink.muted`           | `#8FA6AD` | secondary text, captions          |
| `stroke`              | `#24393E` | borders, dividers                 |

**`tailwind.config.ts` (theme.extend):**

```ts
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { deep: '#081315', DEFAULT: '#0B1A1F', soft: '#17282C' },
        surface: '#17282C',
        brand: { DEFAULT: '#7FB9D6', light: '#A7D3E8', pale: '#D0E8F2' },
        accent: '#E78A5B',
        ink: { DEFAULT: '#EAF2F4', muted: '#8FA6AD' },
        stroke: '#24393E',
      },
      fontFamily: { sans: ['Roboto', 'system-ui', 'sans-serif'] },
      backgroundImage: {
        'app-gradient': 'linear-gradient(135deg, #0d2428 0%, #0a171b 55%, #0b1a20 100%)',
      },
    },
  },
};
```

**Gradient background** applied once at the shell:

```tsx
<div className="min-h-screen bg-app-gradient font-sans text-ink antialiased">…</div>
```

**Roboto (default font)** — self-hosted, no external request:

```css
/* src/styles/index.css */
@import '@fontsource/roboto/400.css';
@import '@fontsource/roboto/500.css';
@import '@fontsource/roboto/700.css';
@import '@fontsource/roboto/900.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`pnpm add @fontsource/roboto`. Because `font-sans` maps to Roboto, the whole app inherits it.

**Responsive:** mobile-first. Use Tailwind breakpoints (`sm md lg xl`), a fluid centered container, and verify at 360 / 768 / 1280 px. The dashboard's three session columns stack vertically on mobile, side-by-side from `lg`.

## 16. Base UI components (design system)

Build these first in `components/ui/`, all consuming palette tokens (no hard-coded hex):

- **Title** — `h1`–`h4` scale (heading component with `level` prop).
- **Button** — variants `primary | secondary | ghost`, sizes, `disabled`/`loading`.
- **TextInput** — label, hint, error state.
- **TextArea** — same states, auto-rows.
- **Checkbox** and **Radio / RadioGroup**.
- **Card** — surface container for panels.

Pattern (keeps variants DRY and the file tiny):

```tsx
// components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-pale text-bg-deep hover:bg-brand-light',
  secondary: 'bg-surface text-ink border border-stroke hover:bg-surface/80',
  ghost: 'bg-transparent text-brand hover:text-brand-light',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        'rounded-full px-6 py-3 font-medium transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
```

```ts
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
```

## 17. Logging & error tracking

A single `loggerService` — no bare `console.log` scattered in the code, so logging can be silenced or redirected later.

```ts
// services/loggerService.ts
type Level = 'debug' | 'info' | 'warn' | 'error';
const on = import.meta.env.DEV || import.meta.env.VITE_LOG === 'on';
const emit = (lvl: Level, scope: string, msg: string, data?: unknown) => {
  if (lvl === 'debug' && !on) return;
  const tag = `[${new Date().toISOString()}] ${lvl.toUpperCase()} (${scope})`;
  console[lvl === 'debug' ? 'log' : lvl](`${tag} ${msg}`, data ?? '');
};
export const logger = {
  debug: (s: string, m: string, d?: unknown) => emit('debug', s, m, d),
  info: (s: string, m: string, d?: unknown) => emit('info', s, m, d),
  warn: (s: string, m: string, d?: unknown) => emit('warn', s, m, d),
  error: (s: string, m: string, d?: unknown) => emit('error', s, m, d),
};
```

**Global handlers** (in `app/` bootstrap) + a themed **ErrorBoundary** and TanStack Query `onError`, all routing to `logger.error`:

```ts
window.addEventListener('error', (e) => logger.error('window', e.message, e.error));
window.addEventListener('unhandledrejection', (e) =>
  logger.error('promise', 'unhandled rejection', e.reason),
);
```

Convention: `logger.info` for lifecycle events (data loaded, route change), `logger.debug` for dev-only detail (dev build only), `logger.warn`/`error` for recoverable/fatal issues.

---

## 18. Sequencing recap

- **Seed first, automate last.** As an early step, generate one **initial `report.json`** (a hand-built seed from an existing report) so Phase 1 has real, schema-valid data to build the app against.
- The scheduled tasks are **not** modified until the app is finished. Only then do we add JSON emit + commit/push to each run (Phase 7). Until then the tasks keep producing `.md` + Gmail drafts exactly as today.

_Next step when you're ready: I generate the seed `report.json` (+ `manifest.json`) from today's midday report so you have live data to scaffold Phase 1 against — no changes to the scheduled tasks yet._
