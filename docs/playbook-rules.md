<!-- Curated rules. Edited by the weekly digest task (Sundays). Keep under ~2.5 KB. -->
## Risk profile: AGGRESSIVE (user choice, 2026-11-11)
- Risk 2-3% of equity per futures trade (ledger hard cap 3%). Size = riskUsd / stopDistance.
- Leverage up to 5x (hard cap). Stop >= 1x 4H ATR from entry (ledger floor 0.6%); TP >= 1.5R.
- Default to having a futures position or a working plan for one. Flat futures for more than 2
  sessions in a row needs a written reason (no edge at either range edge).
- Spot core: rest a `spotStop` under the key support every endday (overnight gap protection).
- Prefer ONE decisive action per session over small 5-20 USDT DCA ticks (churn lost to buy&hold).

## Goals (scored every run, see `--context` -> goals)
- PERFORMANCE: beat buy&hold (benchmark.edgeUsd > 0 and rising).
- BEHAVIOUR (7-day window): expectancy >= +0.3R per closed futures trade; futures in play in >= 40% of snapshots.
- BRAKE: expense-adjusted net worth >= 20% under the round's peak -> risk cap halves to 1.5% (ledger enforces) until recovered.
- LEAGUE: sessions are ranked by avg R of the trades they opened (last 40). Win the league with good trades, not more trades.
- Never chase a goal with a trade that has no edge: a missed target is fine, a forced trade is not.

## Playbook (distilled from 277 session lessons, Jul-Nov 2026)
1. RANGE FADE is the main edge. Range calls hit ~80%; directional calls rarely. When range >= 40%:
   long near support / short near resistance, stop beyond the edge + ATR buffer, TP at mid/opposite edge.
2. Bearish directional calls almost never paid (see stats). Do not short a flush low with RSI ~30 on
   every frame; short the bounce INTO resistance / a falling 1H-4H EMA20 instead.
3. Act on settled closes, not wicks: a level counts after a 1H (reduce) or 4H (add/breakout) CLOSE.
4. Do not sell spot at the flush low. After a liquidation flush, hedge with futures or wait for the retest.
5. Do not chase the first pop into resistance / a bright heatmap band / an untested 4H EMA20.
6. Crowded longs (OKX L/S >= 2.5) under resistance = downside pull to the long-liq brackets; favor
   shorts at the range top and longs only at the bracket below after the flush.
7. Falling OI on a flat tape = cleanest long signal; rising OI while price falls = more downside.
8. Keep dry powder: size so a fired gate can still be acted on (>= 25-30% of equity free).
9. Into the 1st of the month keep cash/savings >= the monthly expense; leverage drawdowns into the
   charge date are what bankrupt the wallet.
10. Data hygiene: discard stale OKX feeds (check ts), EMA200 needs >= 300 bars, ETF day with a
    missing issuer is provisional.
