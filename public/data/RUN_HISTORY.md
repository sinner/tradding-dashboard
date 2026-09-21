
## 2026-09-21 13:00:06 -05:00 — MIDDAY session
- Ran `/crypto-levels BTC-USDT` + `/crypto-technical-analyst BTC-USDT`, then `btc-paper-desk`.
- BTC 85,904.7 (+5.88% 24h). Session since morning 84,719.5–86,351.4; 86,351.4 = highest since 2026-01-29.
- CONFIRMATION: 4H bar 12:00–16:00Z SETTLED at 85,931.7 (confirm flag 1), above the 85,631.3 Jan high — the morning file's pre-committed on-strength add trigger. 1H 17:00Z also settled above at 85,891.6.
- Bias bullish, confidence 7.20, probs 55/31/14. Position TAKE_PROFIT -> ADD. Reduce gate trailed 82,099.0 -> 83,697.1; add gate 85,325.2 retest (or settled 4H > 86,351.4); invalidation stays 82,099.0.
- Indicators: 15m RSI 58.12 (MACD hist −110.73, cooling) · 1H RSI 80.51 · 4H RSI 82.71 (highest in 300 bars) · daily RSI 70.77. Price above all EMAs on all 4 TFs. Daily ATR14 2,416.21 (2.81%). Daily EMA100 72,649.94 still under EMA200 73,255.06, gap 605.1.
- DATA INTEGRITY: sandbox web_fetch served an OKX ticker 4h43m stale and a 1H series 18h45m stale — both DISCARDED. All OKX figures re-read in-browser / cache-busted and cross-checked vs Kraken XXBTZUSD. CoinGlass browser fallback NOT needed (OKX path live and fresh).
- Liquidations INVERTED vs morning: 1,209,863 USD longs vs 95,015 USD shorts (12.7:1 flush of longs), window 15:26:40Z–17:54:10Z. Buckets 85,500 (797k long, magnet) · 85,750 (417k) · 86,000 (72k short) · 86,250 (14k short). OI 2,653,274,142 (+5.63% vs morning). Funding +0.0000176 (flat). L/S account ratio 0.88, falling every hour today.
- Macro: DXY 100.413 (+0.19%), US10Y 4.969% (−2.7bp), Brent 100.13 (−3.60%), WTI −4.79%, F&G 70. ETF streak 2 days (+592.5M); 21 Sep still a 0.0 placeholder (US close pending).
- NonCrypto (LIVE intraday 13:58 ET, not settled closes): QQQ 738.86 (+2.41%, rich) / VOO 712.27 (+1.49%, rich, 49th -> 100th pctile) / JPXN 103.67 (+0.42%, fair, only non-rich entry).
- Calibration: morning reduce gate 82,099.0 NOT fired (low 84,719.5, 2,620.5 pts clear) -> priorReduceFired false. Morning's TAKE_PROFIT trim now 1,162.0 pts offside -> actingHelped FALSE; read right, trade mistimed.
- Wallet: `midday ADD · mark 85904.7 · equity 214.63 · savings 1.46 · net 216.09 · round 1 · bankruptcies 0` (spot_buy 12.00 USDT; book 0.00199923 -> 0.00213892 BTC, avg 78,591.18 -> 79,067.95; cash 42.89 -> 30.89; no autoExits, no sweep, futures flat).
- Files: report JSON, narrative MD (public/data/reports/2026/09/), manifest merged (63 days, all 4 keys, latest -> midday), calibration 215 -> 216 rows, portfolio via ledger (history 215). Backups written with `.pre-20260921-midday` suffix.
- Validation: ReportSchema / ManifestSchema / CalibrationSchema / PortfolioSchema all safeParse TRUE against src/lib/types.ts. Ledger tests: ALL TESTS PASSED. Zero `-04:00` timestamps. No app code changed.
- No git run (no .git/index.lock present). No publish. No email. Browser tabs opened this run: 1 — closed, group auto-removed.

## 2026-09-21 06:58:25 -05:00 — MORNING session
- Ran `/crypto-levels BTC-USDT` + `/crypto-technical-analyst BTC-USDT`, then `btc-paper-desk`.
- BTC 84,742.7 (+5.28% 24h). The 82,099.0 lid BROKE; high 85,325.2 = highest since 2026-01-29.
- Bias bullish, confidence 7.40, probs 58/28/14. Reduce gate moved 80,750 -> 82,099 (flip support). Add zone 82,099-82,600 retest.
- Data: OKX public API read in-browser (ticker 0.8s old; liq feed newest 6 min old, all prices within 600 pts of spot). CoinGlass browser fallback NOT needed.
- Liquidations: 350,560 USD shorts vs 3,484 USD longs (100:1 squeeze), biggest bucket 84,750. OI 2,511,948,278 (+0.84% vs midnight). Funding +0.0001. L/S account ratio 0.98.
- Macro: DXY 100.222, US10Y 4.947%, Brent 101.09 (-2.68%), F&G 70. ETF streak 2 days (+592.5M); 21 Sep row is a 0.0 placeholder.
- NonCrypto: QQQ 721.45 / VOO 701.78 / JPXN 103.24 — Friday 18 Sep closes re-verified, US market not yet open.
- Wallet: `morning REDUCE · mark 84742.7 · equity 212.31 · savings 1.46 · net 213.77 · round 1 · bankruptcies 0` (trim 0.0002 BTC, realized +1.23, swept 0.25, cash 26.19 -> 42.89).
- Files: report JSON, narrative MD (public/data/reports/2026/09/), manifest merged (63 days, all 4 keys), calibration 215 rows (stale 00:05 morning row replaced, not duplicated), portfolio via ledger.
- No git run. No publish. No email. Browser tabs opened this run: 2 — both closed, group auto-removed.
