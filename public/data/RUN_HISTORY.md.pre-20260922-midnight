## 2026-09-21 19:45:00 -05:00 — ENDDAY session
- Ran `/crypto-levels BTC-USDT` + `/crypto-technical-analyst BTC-USDT`, then `btc-paper-desk`.
- BTC 86,266.8 (+5.79% 24h). Session since midday 85,806.6-87,399.0. 87,399.0 = highest print since 2026-01-29, then FADED 1,132.2 pts (-1.30%) into the close.
- Bias bullish, confidence 7.00, probs 52/33/15. Position ADD -> TAKE_PROFIT. Reduce gate trailed 83,697.1 -> 85,325.2; add gate inverts to 85,600.0 retest (alt: settled 4H > 87,399.0); invalidation trailed 82,099.0 -> 84,719.5. stopOrder RECOMMENDED at 84,650.0 (OVERNIGHT GAP rule: 1 daily ATR from spot = 83,703.9).
- STRUCTURE: three consecutive SETTLED 4H bodies now above the 85,631.3 Jan high (85,931.7 / 86,502.3 / 86,617.8) - a shelf, not a candle.
- Indicators: 15m RSI 51.04 (MACD hist -74.83; price BELOW 15m EMA20 86,470.8) · 1H RSI 78.10 (hist +272.41 -> +49.27, nearly flat) · 4H RSI 86.43 = HIGHEST in the 299-bar series · daily RSI 71.60. Daily ATR14 2,562.85 (2.97%). Daily EMA100 72,386.04 vs EMA200 73,129.85.
- DATA INTEGRITY: sandbox web_fetch again served stale cache - OKX ticker stamped 13:10:23Z (11h28m old, 85,325.9 / 24h high 85,480.2 vs real 87,399.0) and Kraken at 83,783.40. Both DISCARDED. All crypto figures re-read in-browser from the okx.com origin with cache-busted URLs; cross-checked vs Kraken 86,183.10 and Coinbase 86,291.28 (Kraken 24h high 87,446.70 corroborates 87,399.0). CoinGlass browser fallback NOT needed - OKX liq feed passed the freshness guard (newest fill 86,248.2 at 00:39:54Z vs spot 86,266.8, 18.6 pts apart).
- Liquidations: 345,885 USD longs vs 213,212 USD shorts (window 20:29:13Z-00:39:54Z). Buckets 86,500 = 354,482 USD TWO-SIDED (189,548 long + 164,934 short, MAGNET, extreme) · 86,750 = 113,639 · 86,250 = 72,889 (below spot) · 87,250 = 18,085 all-short. Pull up but weak - dominant bucket is a whipsaw, not a trend.
- DIVERGENCE (the key bearish fact): OI 2,564,275,351 USD, DOWN 3.35% vs midday's 2,653,274,142 while price rose 0.42% -> last leg to 87,399.0 was SHORT COVERING, not fresh longs. Funding +0.0001 (floor). L/S account ratio 0.93 (0.95/0.94/0.94/0.93 last 4 buckets) - accounts still net SHORT into strength.
- Macro: Brent 100.59 (+0.25%), DXY 100.379 (-0.05%), US10Y 4.951% (-1.2bp), F&G 78 EXTREME GREED.
- ETF FLOWS - the headline: Farside 21 Sep prints +617.6M USD (largest of the month), 3rd consecutive positive day (17th +159.5, 18th +433.0), streak +1,210.1M, rolling 5-session +463.8M. This is the allocation confirmation midday named as the deciding datapoint. It landed bullish.
- NonCrypto SETTLED closes: QQQ 741.47 (+2.77%, 100th pctile, rich) / VOO 712.78 (+1.57%, 100th pctile, rich) / JPXN 103.95 (+0.69%, 72nd pctile, rich but least-bad entry of the three).
- Calibration: midday reduce gate 83,697.1 NOT fired (low 85,806.6, 2,109.5 pts clear) -> priorReduceFired false. Midday's ADD at 85,904.7 is +362.1 pts onside -> actingHelped TRUE. Primary add 85,325.2 never traded (add_fired false); midday's ALT gate (settled 4H > 86,351.4) filled at 86,502.3.
- BACKFILLED price_next_report (endday privilege): 2026-09-20 endday -> 81,557.6 (both gates untested) · 2026-09-21 midnight -> 84,742.7 (add gate 82,099.0 FIRED, +3.91% in 4h40m, call of the day) · 2026-09-21 morning -> 85,904.7 (right read, trim 1,524.1 pts offside) · 2026-09-21 midday -> 86,266.8 (acting_helped true).
- Wallet: `endday REDUCE · mark 86266.8 · equity 215.1 · savings 1.77 · net 216.87 · round 1 · bankruptcies 0` (spot_sell fraction 0.10; book 0.00213892 -> 0.00192503 BTC, avg unchanged 79,067.95; realized +1.54, swept 0.31; cash 30.89 -> 49.03; futures flat, no autoExits, skips 0). Risk management for the overnight gap, NOT a top call - 90% of the core carries behind the resting stop.
- Files: report JSON, narrative MD (public/data/reports/2026/09/2026-09-21-endday.md), manifest merged (63 days, all 4 keys, latest -> endday), calibration 216 -> 217 rows (+4 backfills), portfolio via ledger (history 215 -> 216). Backups written with `.pre-20260921-endday` suffix.
- Validation: ReportSchema safeParse TRUE against the real src/lib/types.ts (divergences KEPT, 2 entries, not caught to []); ManifestDaySchema TRUE on all 63 days; all 77 September reports still validate. `tsc -b` exit 0. `eslint src scripts` 0 errors. Ledger tests: ALL TESTS PASSED. Zero `-04:00` timestamps. No app code changed.
- KNOWN PRE-EXISTING LINT DEBT (not from this run): three stray scratch files at repo root - `val_0908.tmp.ts`, `val_cal_20260915.tmp.ts`, `val_endday_20260915.tmp.ts` - account for all 10 `pnpm lint` errors. Left in place; safe to delete.
- No git run (no .git/index.lock present). No publish. No email. Browser tabs opened this run: 1 — closed at end of run, group auto-removed.

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
