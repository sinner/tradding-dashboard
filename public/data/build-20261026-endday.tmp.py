import json, os, subprocess, shutil
R = os.path.expanduser('~/mnt/tradding-dashboard')
D = R + '/public/data'
TS = '2026-10-26T20:32:00-05:00'
ID = '2026-10-26-endday'
MARK = 80213.1

def rsi14(c):
    g = l = 0
    for i in range(1, 15):
        d = c[i] - c[i-1]
        if d > 0: g += d
        else: l -= d
    g /= 14; l /= 14
    for i in range(15, len(c)):
        d = c[i] - c[i-1]
        g = (g*13 + max(d, 0))/14; l = (l*13 + max(-d, 0))/14
    return 100 - 100/(1 + g/l)

def dca(c):
    last = c[-1]; mx = max(c); mn = min(c); m20 = sum(c[-20:])/20
    pct = round((last-mn)/(mx-mn)*100); r = round(rsi14(c), 1)
    z = 'very-cheap' if (pct <= 10 or (pct <= 20 and r < 35)) else 'cheap' if pct <= 30 else 'fair' if pct <= 70 else 'rich'
    return {"percentileInMonth": pct, "pctVs20dAvg": round((last/m20-1)*100, 2), "pctFromHigh": round((last/mx-1)*100, 2),
            "rsi14": r, "zone": z, "note": "Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}

q = [712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93,736.53][::-1]
v = [703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86,702.46,703.61][::-1]
j = [102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33,102.96][::-1]
def idx(t, price, chg, bias, note, c):
    return {"ticker": t, "price": price, "changePct": chg, "bias": bias, "note": note, "dcaSignal": dca(c),
            "source": {"title": f"{t} — StockAnalysis", "url": f"https://stockanalysis.com/etf/{t.lower()}/"}}
indices = [
    idx("QQQ", 712.20, 1.11, "bounce holds, still below the Oct 6 high", "Oct 26 close (StockAnalysis); prior close 704.40. About 6.2% under the Oct 6 high of 759.66.", q),
    idx("VOO", 703.41, 0.69, "mild rebound", "Oct 26 close (StockAnalysis); prior close 698.58.", v),
    idx("JPXN", 102.20, 0.27, "flat, range-bound", "Oct 26 close (StockAnalysis); prior close 101.93. Thin volume.", j),
]
prev = json.load(open(f'{D}/2026/10/2026-10-26-midday.json'))
prevsrc = prev['sources']
tf = lambda tfn, rsi, m, e, st, b: {"tf": tfn, "rsi": rsi, "macd": {"line": m[0], "signal": m[1], "hist": m[2]},
     "emas": {"ema20": e[0], "ema50": e[1], "ema100": e[2], "ema200": e[3]}, "structure": st, "bias": b,
     "source": "OKX BTC-USDT candles, computed (EMA/RSI Wilder/MACD 12-26-9)", "asOf": TS}
rep = {
 "schemaVersion": "1.0.0", "id": ID, "date": "2026-10-26", "session": "endday", "generatedAt": TS, "asset": "BTC-USDT",
 "overallBias": "range", "biasTilt": "bearish", "confidence": 4.7,
 "priceSnapshot": {"value": MARK, "currency": "USD", "changePct": 0.27, "source": "OKX BTC-USDT ticker (in-page fetch)", "asOf": TS,
   "note": "24h open 80,003.2; Oct 26 daily close region 80.2k. Price is back on the 4H EMA20 neighbourhood after a dip to 79,721.",
   "sessionRange": {"low": 79721.3, "high": 80418.9}},
 "decisionBox": {"position": "REDUCE",
   "reduceIf": {"price": 79377.7, "confirmation": "A 1H close below 79,377.7 (Oct 25-26 low) re-opens the 79,220 wick, then the estimated 77.0k long-liquidation pocket."},
   "addIf": {"price": 80849.9, "confirmation": "A 1H close above 80,850 (Oct 26 high) clears the 4H EMA20 (80,563) and targets 81,250 (4H EMA50); 81,850 is the trend gate."},
   "invalidatesAt": 81850.0, "stopOrder": {"recommended": True, "price": 79150.0},
   "changed": "Midday lines held: the 79,377.7 reduce line was never touched (session low 79,721.3) and the 80,850 add line was never reached (session high 80,418.9). Price is flat on the midday ADD. Heading into the overnight gap the wallet trims a small slice of spot and keeps the 79,150 resting stop."},
 "overnightRisk": "Next report is ~02:00 COT. Longs stay crowded (OKX 1H account ratio 2.21, funding +0.010%) and the largest fresh liquidation cluster is long, about $424k at 79.9k plus $123k at 80.0k, so a clean break under 79.7k can cascade toward 79.2k and the estimated 77.0k pocket in thin Asia liquidity. The Oct 26 spot ETF flow print is still empty after two outflow days; a third outflow would add pressure. Brent sits near 115 and the US10Y near 4.99%. Resting stop at 79,150 is the only protection while nobody is watching.",
 "probabilities": {"bullish": 25.0, "range": 45.0, "bearish": 30.0},
 "levels": {"support": [80000.0, 79721.3, 79455.8, 79377.7, 79220.1], "resistance": [80418.9, 80562.8, 80849.9, 81249.8, 81850.0],
  "liquidation": [
   {"price": 79900, "side": "below", "intensity": "high", "magnet": True, "note": "OKX realized liquidations, 100 most recent (fresh, 12:04-19:38 COT): about $424k LONG at 79.9k, $123k at 80.0k, $70k at 79.7k, $39k at 79.8k. Measured, approximate (0.01 BTC contract x fill price)."},
   {"price": 80500, "side": "above", "intensity": "low", "magnet": False, "note": "OKX realized short liquidations at 80.2-80.5k, about $90k total. Small marker."},
   {"price": 77040, "side": "below", "intensity": "medium", "magnet": False, "note": "Estimated leverage-bracket magnet (25x long liquidation from spot) — not exchange resting-order data."},
   {"price": 83400, "side": "above", "intensity": "low", "magnet": False, "note": "Estimated leverage-bracket magnet (25x short liquidation from spot) — not exchange resting-order data."}],
  "liquidityMagnet": {"nearestAbove": 80500.0, "nearestBelow": 79900.0, "pull": "down", "source": "OKX public liquidation-orders, long-short-account-ratio, open-interest, funding (in-page fetch)", "asOf": TS,
    "note": "Realized flow is long-heavy (about $657k long vs $90k short) and the account ratio is 2.21, so the nearer pull is a retest of 79.7-80.0k."}},
 "atr": {"value": 739.75, "period": 14, "pct": 0.92, "source": "OKX 4H candles, Wilder ATR14", "asOf": TS},
 "timeframes": [
  tf("15m", 51.76, (39.25, 11.09, 28.16), (80140.2, 80138.2, 80150.5, None), "On the EMA20-100 cluster; EMA200 needs more history than fetched", "neutral"),
  tf("1h", 49.45, (-55.86, -70.12, 14.25), (80167.0, 80354.8, 80740.4, 81302.1), "On EMA20, under EMA50-200; histogram positive but line below zero", "range, bearish tilt"),
  tf("4h", 41.84, (-416.22, -448.2, 31.98), (80562.8, 81249.8, 81838.4, 82345.7), "Under the whole EMA stack; MACD below zero but histogram turning up", "bearish"),
  tf("daily", 43.35, (-467.01, -130.73, -336.28), (81771.3, 80758.6, 77542.6, 74617.97), "Under EMA20 and EMA50, above EMA100/200; MACD below signal and zero", "range, bearish tilt")],
 "operations": [
  {"horizon": "swing", "market": "futures", "action": "wait", "entry": None, "stop": None, "tp": [], "rr": None, "confidence": 3.0, "hold": "days-weeks"},
  {"horizon": "position", "market": "spot", "action": "reduce", "entry": None, "stop": 79150.0, "tp": [], "rr": None, "confidence": 4.0, "hold": "weeks-months"},
  {"horizon": "spot_core", "market": "spot", "action": "REDUCE", "entry": None, "stop": 79150.0, "tp": [], "rr": None, "confidence": 4.0, "hold": "long-term"}],
 "scalpContext": {"intradayBias": "Range 79.7k-80.9k: buy a held 79.9k-80.0k, fade 80.6k-80.9k; trend flips up only above 81,850",
   "longAbove": 80562.8, "shortBelow": 79377.7, "invalidates": 81850.0, "note": "Scalp only the edges — live signals come from the chart, not this report."},
 "macro": {"brent": {"value": 114.78, "changePct": -0.89}, "dxy": {"value": 102.045}, "us10y": {"value": 4.993},
  "etfFlows": {"streakDays": -2, "note": "Spot BTC ETFs per Farside: Oct 23 -137.9M, Oct 22 -635.6M after +524.8M on Oct 21; Oct 26 row still empty. Two straight outflow days."},
  "liquidations": {"longsUsd": 657479, "shortsUsd": 90109, "skew": 2.21, "traders": None, "openInterestUsd": 2539303008.0,
   "note": "OKX realized fills, 100 most recent (fresh, 12:04-19:38 COT): about $657k long vs $90k short, mostly 79.7-80.0k (approximate, 0.01 BTC contracts). OKX OI $2.539B (from $2.525B at midday); funding +0.010%; 1H long/short account ratio 2.21 (longs crowded). Fear and Greed 48 (Neutral, alternative.me)."},
  "fearGreed": 48, "earnings": []},
 "nonCrypto": {"indices": indices, "stockWatchlist": []},
 "divergences": [],
 "calibration": {"priorReduceFired": False, "actingHelped": None,
   "rollingRecord": "Midday ADD (8 USDT at 80,251.1): reduce line 79,377.7 never touched (low 79,721.3), add line 80,850 never reached (high 80,418.9). Price is 0.05% under the entry, so neutral.",
   "note": "Fourth straight session where the 79.4k-80.1k shelf held. Edge is still small; size stays small."},
 "sources": prevsrc + [
   {"title": "StockAnalysis QQQ/VOO/JPXN history", "url": "https://stockanalysis.com/etf/qqq/history/"},
   {"title": "CNBC US10Y / Brent / DXY quotes", "url": "https://www.cnbc.com/quotes/US10Y"}],
}
# dedupe sources by url
seen = set(); srcs = []
for s in rep['sources']:
    if s['url'] not in seen: seen.add(s['url']); srcs.append(s)
rep['sources'] = srcs
os.makedirs(f'{D}/2026/10', exist_ok=True)
rp = f'{D}/2026/10/{ID}.json'
shutil.copy(rp, rp + '.pre-b') if os.path.exists(rp) and False else None
json.dump(rep, open(rp, 'w'), indent=2)
print('report ok', json.dumps(indices[0]['dcaSignal']), json.dumps(indices[1]['dcaSignal']), json.dumps(indices[2]['dcaSignal']))

# manifest
mp = f'{D}/manifest.json'; m = json.load(open(mp))
day = next(d for d in m['days'] if d['date'] == '2026-10-26')
for k in ('midnight', 'morning', 'midday', 'endday'): day['sessions'].setdefault(k, None)
day['sessions']['endday'] = f'data/2026/10/{ID}.json'
m['latest'] = f'data/2026/10/{ID}.json'; m['updatedAt'] = TS
json.dump(m, open(mp, 'w'), indent=2)

# calibration
cp = f'{D}/calibration.json'; c = json.load(open(cp))
row = {"date": "2026-10-26", "session": "endday", "bias": "range-bear", "bull_pct": 25.0, "range_pct": 45.0, "bear_pct": 30.0,
       "reduce_level": 79377.7, "reduce_fired": False, "add_level": 80849.9, "add_fired": False,
       "price_at_report": MARK, "price_next_report": None, "acting_helped": None}
c = [r for r in c if not (r['date'] == '2026-10-26' and r['session'] == 'endday')] + [row]
# backfill price_next_report for this day's earlier rows
byS = {r['session']: r for r in c if r['date'] == '2026-10-26'}
chain = [('midnight', 'morning'), ('morning', 'midday'), ('midday', 'endday')]
for a, b in chain:
    if a in byS and b in byS and byS[a].get('price_next_report') is None:
        byS[a]['price_next_report'] = byS[b]['price_at_report']
json.dump(c, open(cp, 'w'), indent=2)
print('manifest+calibration ok', len(c))
