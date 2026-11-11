import json,copy
D='public/data/'
T='2026-10-29T08:45:00-05:00'
mid=json.load(open(D+'2026/10/2026-10-29-midnight.json'))
def tf(n,rsi,m,e,st,b):
    return {"tf":n,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":st,"bias":b,"source":"OKX BTC-USDT candles (300 bars, in-page fetch), computed (EMA/RSI Wilder/MACD 12-26-9)","asOf":T}
r={"schemaVersion":"1.0.0","id":"2026-10-29-morning","date":"2026-10-29","session":"morning","generatedAt":T,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":4.8,
"priceSnapshot":{"value":80002.2,"currency":"USD","changePct":-0.99,"source":"OKX BTC-USDT ticker","asOf":T,"note":"24h change vs open24h 80,810.5. Price is 0.06% above the midnight print of 79,950.1.","sessionRange":{"low":79829.0,"high":80376.1}},
"decisionBox":{"position":"HOLD","reduceIf":{"price":79838.5,"confirmation":"A 1H close below 79,838.5. The overnight 1H closes stayed at or above 79,860.8; the 79,829 low was a wick."},"addIf":{"price":80534.9,"confirmation":"A 1H close above the 4H EMA20 (80,535), then a hold above the 4H EMA50 (80,940). 81,298 is the next gate."},"invalidatesAt":81850.0,"stopOrder":{"recommended":True,"price":79500.0},"changed":"Midnight HOLD stood. Price ground sideways in a tight 79,829-80,376 box. No 1H close under 79,838.5 and the 79,500 stop was untouched. Add trigger moved from 80,647.7 to the falling 4H EMA20 (80,535)."},
"probabilities":{"bullish":25.0,"range":47.0,"bearish":28.0},
"levels":{"support":[79829.0,79709.5,79500.0,79350.0],"resistance":[80376.1,80534.9,80939.5,81298.4,81797.5],
"liquidation":[
{"price":79350,"side":"below","intensity":"extreme","magnet":True,"note":"Brightest forward band on the CoinGlass Model 3 heatmap (yellow at the right edge, about 0.8% under spot), just below the 79,500 stop. Read from screenshot; USD size not quantified."},
{"price":82000,"side":"above","intensity":"high","magnet":False,"note":"Green-yellow band near 82k on the heatmap; short-squeeze target. Read from screenshot."},
{"price":80000,"side":"below","intensity":"medium","magnet":False,"note":"The large 80.0-80.4k long stack ends where price broke on the heatmap (consumed). OKX realized: about $131k of longs liquidated at 79.9-80.0k since 00:05 COT."},
{"price":80350,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized: about $248k of shorts liquidated at 80.2-80.5k since 00:05 COT. Measured, approximate (0.01 BTC contract x fill price). Spent squeeze."},
{"price":77000,"side":"below","intensity":"low","magnet":False,"note":"Thinner band at the bottom of the heatmap window. Read from screenshot."},
{"price":84000,"side":"above","intensity":"low","magnet":False,"note":"Thin green bands at 84-85k on the heatmap. Read from screenshot."}],
"liquidityMagnet":{"nearestAbove":82000.0,"nearestBelow":79350.0,"pull":"down","source":"CoinGlass Liquidation Heatmap Model 3 (Binance BTC/USDT perp, 48h) via browser screenshot; OKX liquidation-orders, long-short ratio, OI, funding (in-page fetch)","asOf":T,"note":"The 80.0-80.4k stack is consumed. The next bright band is 79.35k, under the 79,500 stop. OKX account ratio is 2.16, longs crowded, so the pull stays down."}},
"atr":{"value":757.8,"period":14,"pct":0.95,"source":"OKX 4H candles, Wilder ATR14","asOf":T},
"timeframes":[
tf("15m",41.7,[-21.5,-17.6,-3.9],[80129.7,80246.0,80429.3,80516.8],"Under the whole EMA stack but RSI lifted from 36.5 to 41.7 and the MACD gap is shrinking: a sideways drift, not a breakdown","bearish, easing"),
tf("1h",40.1,[-214.7,-182.0,-32.8],[80348.4,80517.1,80618.6,80903.8],"Under every EMA; EMA20 at 80.35k is the first lid; histogram -33, narrower than the -130 at midnight","bearish, easing"),
tf("4h",43.3,[-151.0,-103.2,-47.8],[80534.9,80939.5,81517.7,81807.9],"Under the whole stack; RSI 43.3; MACD line back under signal (-48) after the pause at midnight","range, bearish tilt"),
tf("daily",42.5,[-543.5,-264.2,-279.3],[81524.8,80734.4,77807.4,75932.9],"Under EMA20 and EMA50, above EMA100/200; MACD below signal and zero, histogram -279, widening slowly","bearish tilt")],
"operations":copy.deepcopy(mid["operations"]),
"scalpContext":{"intradayBias":"Range 79.83k-80.38k with a downward lean; the 4H EMA20 (80,535) caps rallies","longAbove":80534.9,"shortBelow":79838.5,"invalidates":81850.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"dxy":{"value":102.267},"us10y":{"value":4.97},
"etfFlows":{"streakDays":3,"note":"US spot BTC ETFs (Farside): Oct 26 +110.3M, Oct 27 +176.0M, Oct 28 +137.3M; three straight inflow days, +423.6M. Oct 29 not published yet."},
"liquidations":{"longsUsd":139719,"shortsUsd":248205,"skew":0.99,"traders":None,"openInterestUsd":2586079965.0,"note":"OKX realized fills (100 most recent, since 00:05 COT, fresh): about $140k longs vs $248k shorts; shorts at 80.2-80.5k, longs at 79.9-80.0k (approximate, 0.01 BTC contracts). OKX OI $2.586B, funding +0.008%, 1H account ratio 2.16 (longs crowded). CoinGlass header (all exchanges): OI $142.06B, 24h liquidations $339.7M (+85%), long/short 49.72/50.28 (skew used). Fear and Greed 51 (Neutral, alternative.me). Brent not verified this run (CNBC and search feeds unavailable), left out."},
"fearGreed":51,"earnings":[]},
"nonCrypto":{"indices":[
{"ticker":"QQQ","price":725.61,"changePct":0.6,"bias":"last close, US session just opening","note":"Oct 28 close 725.61 (+0.60%, StockAnalysis, verified in the midnight run). Fresh StockAnalysis pages were cached to older dates this run, so the last verified close is reused, labelled as such. Alphabet -11% premarket after earnings is a Nasdaq risk today (CNBC headlines).","dcaSignal":{"percentileInMonth":38,"pctVs20dAvg":-0.94,"pctFromHigh":-4.48,"rsi14":48.5,"zone":"fair","note":"Carried from the Oct 28 close. Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"}},
{"ticker":"VOO","price":709.9,"changePct":0.34,"bias":"steady, mid-range","note":"Oct 28 close 709.90 (+0.34%, StockAnalysis, verified in the midnight run); reused as last verified close.","dcaSignal":{"percentileInMonth":64,"pctVs20dAvg":0.18,"pctFromHigh":-0.88,"rsi14":57.2,"zone":"fair","note":"Carried from the Oct 28 close. Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"}},
{"ticker":"JPXN","price":102.13,"changePct":-0.74,"bias":"lower part of range","note":"Oct 28 close 102.13 (-0.74%, StockAnalysis, verified in the midnight run); reused as last verified close.","dcaSignal":{"percentileInMonth":6,"pctVs20dAvg":-1.23,"pctFromHigh":-3.01,"rsi14":48.2,"zone":"very-cheap","note":"Carried from the Oct 28 close. Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"}}],"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Midnight HOLD: reduce 79,838.5 not confirmed (lowest 1H close 79,860.8); add 80,647.7 not hit (high 80,376.1). Price 79,950.1 -> 80,002.2 (+0.07%), 79,500 stop untouched.","note":"Holding behind the stop was right again; the market compressed instead of extending the drop."},
"sources":[{"title":"OKX public API (ticker, candles, OI, funding, long-short ratio, liquidation-orders), in-page fetch","url":"https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT"},{"title":"CoinGlass Liquidation Heatmap Model 3","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"},{"title":"Farside Bitcoin ETF Flow","url":"https://farside.co.uk/btc/"},{"title":"CNBC US10Y","url":"https://www.cnbc.com/quotes/US10Y"},{"title":"CNBC DXY","url":"https://www.cnbc.com/quotes/.DXY"},{"title":"alternative.me Fear and Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"StockAnalysis QQQ/VOO/JPXN","url":"https://stockanalysis.com/etf/qqq/"}]}
json.dump(r,open(D+'2026/10/2026-10-29-morning.json','w'),indent=2)
# manifest
m=json.load(open(D+'manifest.json'))
for d in m['days']:
    if d['date']=='2026-10-29': d['sessions']['morning']='data/2026/10/2026-10-29-morning.json'
m['latest']='data/2026/10/2026-10-29-morning.json';m['updatedAt']=T
json.dump(m,open(D+'manifest.json','w'),indent=2)
# calibration
c=json.load(open(D+'calibration.json'))
rows=c if isinstance(c,list) else c.get('rows',c)
for x in rows:
    if x['date']=='2026-10-29' and x['session']=='midnight':
        x['reduce_fired']=False;x['add_fired']=False;x['price_next_report']=80002.2;x['acting_helped']=True
rows.append({"date":"2026-10-29","session":"morning","bias":"range-bear","bull_pct":25.0,"range_pct":47.0,"bear_pct":28.0,"reduce_level":79838.5,"reduce_fired":None,"add_level":80534.9,"add_fired":None,"price_at_report":80002.2,"price_next_report":None,"acting_helped":None})
json.dump(c,open(D+'calibration.json','w'),indent=2)
# intent
json.dump({"session":"morning","reportId":"2026-10-29-morning","ts":T,"today":"2026-10-29","markPrice":80002.2,"sessionHigh":80376.1,"sessionLow":79829.0,"isSeeder":False,
"rationale":"BTC compressed in a 79,829-80,376 box since midnight. No 1H close printed under 79,838.5 and the 79,500 stop was untouched. Momentum is still negative on every timeframe, so no new risk. Futures have no edge mid-range. The 30.15 USDT of cash is earmarked for the 30 USDT cost of living due Nov 1, leaving nothing free to deploy. Holding spot behind the 79,500 stop.",
"decision":{"type":"hold"}},open('intent-20261029-morning.tmp.json','w'))
