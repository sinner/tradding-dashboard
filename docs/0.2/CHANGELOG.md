# BTC Signal Desk — v0.2.0 changelog

Implements `docs/0.2/IMPROVEMENTS.md`.

## P0 — Correctness
- Studies fetch a **220-bar warm-up** before the report day so RSI / MACD / EMA200 compute correctly; charts clip to the day window.
- Price chart **Fit price / Fit levels** y-domain so candles are readable.
- **EMA 20/50/100/200** overlay + golden/death cross markers on Studies.
- **Divergence overlay** (regular/hidden × bull/bear) with pivot lookback control.
- Empty-state copy when MACD/RSI lack bars.

## P1 — Trading value
- **Calibration** redesigned as three scorecards (direction hit-rate, level accuracy, acting beat holding) + ✓/✗ table; “building track record” until 5 sessions.
- **VOO/QQQ** panel on Dashboard + `/markets` page from report `nonCrypto` snapshots.
- **What's moving it** macro strip per session (Fear & Greed, ETF streak, liquidations, catalysts, sources).
- **REDUCE/ADD hit markers** on the price chart when levels are touched.

## P2 — Polish
- Live price “updated Xs ago” + dim when stale/error.
- RSI zone shading + chart how-to lines.
- Bias legend; ADD levels cyan vs brand purple; nav focus rings; Markets nav link.

Version bump: `0.1.0` → `0.2.0`.
