import json
TS="2026-11-11T12:50:00-05:00"
P=74585.8
def est(px,side,inten,lev,extra=""):
    return {"price":px,"side":side,"intensity":inten,"magnet":False,"note":f"Estimated leverage-bracket magnet ({lev}x {'short' if side=='above' else 'long'} bracket from spot 74,586){extra} - not exchange resting-order data."}
liq=[
 {"price":74750,"side":"above","intensity":"high","magnet":False,"note":"OKX realized fills (fresh, 12:18-12:22 COT): about $1.44M of shorts liquidated near 74.75k on the spike to 74,779 (plus ~$0.06M at 74.5k). Spent liquidity, now a lid/pivot."},
 est(75332,"above","medium",100,", just under the Nov 10 high 75,443"),
 est(76078,"above","medium",50,", near the 4H EMA50 at 75.7k and daily EMA200 at 76.3k"),
 est(77569,"above","low",25),
 est(73840,"below","medium",100,", near the 1H EMA20 at 73,964"),
 dict(est(73094,"below","high",50,"; longs still crowded (L/S 2.87), the main downside pool under the 73,388 session low"),magnet=True),
 est(71603,"below","medium",25),
]
r={
"schemaVersion":"1.0.0","id":"2026-11-11-midday","date":"2026-11-11","session":"midday","generatedAt":TS,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bullish","confidence":5.2,
"priceSnapshot":{"value":P,"currency":"USD","changePct":2.33,"source":"OKX BTC-USDT spot ticker","asOf":"2026-11-11T12:45:13-05:00",
 "note":"24h change vs OKX open24h 72,890.2; 24h range 72,890.2-74,778.8; +1.07% vs the UTC day open 73,795.8. Since the morning report (06:52 COT): 73,388-74,779, a dip to 73.4k then a squeeze to 74.78k.",
 "sessionRange":{"low":73388.0,"high":74778.8}},
"decisionBox":{"position":"HOLD",
 "reduceIf":{"price":73380,"confirmation":"A 1H close under 73,380 loses the session low and puts price back inside the old 73.2k-74.0k box; trim spot."},
 "addIf":{"price":74800,"confirmation":"A 4H close above 74,800 (over the 4H EMA20 at 74,575 and the 74,779 spike high) puts the freed cash into spot."},
 "invalidatesAt":72700,"stopOrder":{"recommended":True,"price":71800},
 "changed":"Shorts were squeezed to 74,779 (about $1.5M liquidated on OKX at 74.75k) and price is now pinned to the 4H EMA20. The rest of the 1x short hedge was closed before its 74,800 stop; the futures book is flat and the spot core rides. Bias moves from plain range to range with a bullish tilt."},
"probabilities":{"bullish":32.0,"range":46.0,"bearish":22.0},
"levels":{"support":[74091.0,73964.13,73388.0,72727.3,72000.0],"resistance":[74778.8,75443.5,75740.94,76255.2],
 "liquidation":liq,
 "liquidityMagnet":{"nearestAbove":75332,"nearestBelow":73840,"pull":"down","source":"OKX public API (market/candles, market/ticker, public/open-interest, public/funding-rate, rubik long-short-account-ratio, public/liquidation-orders), read via browser in-page fetch","asOf":TS,
  "note":"The short pool at 74.75k was just harvested. Longs remain crowded (1H account ratio 2.87, funding +0.0055%), so the larger untouched pool sits below at ~73.1k. The 75.3k short bracket is the next upside target only if 74.8k breaks."}},
"atr":{"value":2246.78,"period":14,"pct":3.01,"source":"OKX BTC-USDT daily candles (UTC), Wilder ATR14 computed","asOf":TS},
"timeframes":[
 {"tf":"15m","rsi":71.79,"macd":{"line":160.88,"signal":80.8,"hist":80.08},"emas":{"ema20":74091.0,"ema50":73945.91,"ema100":73945.11,"ema200":74180.5},"structure":"Above all four 15m EMAs after the squeeze; RSI near overbought, so a pullback to the 74.1k EMA20 is likely before more.","bias":"bullish","source":"OKX BTC-USDT candles (300 bars, computed EMA/RSI14 Wilder/MACD 12-26-9; last bar forming)","asOf":TS},
 {"tf":"1h","rsi":60.14,"macd":{"line":27.06,"signal":-72.67,"hist":99.73},"emas":{"ema20":73964.13,"ema50":74197.5,"ema100":74768.03,"ema200":75663.34},"structure":"Reclaimed the 1H EMA50 (74.2k); MACD line crossed above zero; the 1H EMA100 at 74.77k capped the spike.","bias":"bullish","source":"OKX BTC-USDT candles (300 bars, computed EMA/RSI14 Wilder/MACD 12-26-9; last bar forming)","asOf":TS},
 {"tf":"4h","rsi":47.41,"macd":{"line":-560.79,"signal":-647.95,"hist":87.17},"emas":{"ema20":74574.5,"ema50":75740.94,"ema100":77221.11,"ema200":79219.22},"structure":"Price sits right on the 4H EMA20; MACD histogram growing from below zero; still under the 4H EMA50/100/200.","bias":"neutral","source":"OKX BTC-USDT candles (300 bars, computed EMA/RSI14 Wilder/MACD 12-26-9; last bar forming)","asOf":TS},
 {"tf":"daily","rsi":37.47,"macd":{"line":-1826.28,"signal":-1499.29,"hist":-326.99},"emas":{"ema20":77486.47,"ema50":78923.91,"ema100":77493.99,"ema200":76255.2},"structure":"Still below the daily EMA20/50/100/200; Nov 10 low 72,727 held and today is an inside-to-up day; histogram shrinking.","bias":"bearish","source":"OKX BTC-USDT candles (300 bars, computed EMA/RSI14 Wilder/MACD 12-26-9; last bar forming)","asOf":TS}],
"operations":[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"hold","entry":None,"stop":71800.0,"tp":[75443.5,76255.2],"rr":None,"confidence":5.2,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":71800.0,"tp":[],"rr":None,"confidence":5.2,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Squeeze extended on 15m; buy dips into 74.1k-73.95k toward 74.78k, flip short only below 73,380","longAbove":74100.0,"shortBelow":73380.0,"invalidates":72700.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":92.88,"changePct":1.52},"dxy":{"value":102.899},"us10y":{"value":5.0},
 "etfFlows":{"streakDays":4,"note":"US spot BTC ETFs (Farside, US$m): Nov 5 -430.2, Nov 6 -411.9, Nov 9 -201.0, Nov 10 -95.0. Nov 11 shows 0.0 (not yet reported). Four straight outflow days, shrinking."},
 "liquidations":{"longsUsd":0.0,"shortsUsd":1497686.0,"skew":2.87,"traders":None,"openInterestUsd":2679506282.0,
  "note":"OKX realized fills, 100 most recent (fresh, 12:18-12:22 COT), contracts x 0.01 BTC x bankruptcy price: all shorts, about $1.44M at 74.75k and $0.06M at 74.5k on the squeeze. OKX OI $2.68B (up from $2.66B this morning), funding +0.0055%, 1H long/short account ratio 2.87 (used as skew). CoinGlass heatmap not opened: the OKX feed was fresh."},
 "fearGreed":29,"earnings":[]},
"nonCrypto":{"indices":[
 {"ticker":"QQQ","price":694.21,"changePct":2.88,"bias":"Nasdaq 100 +2.88% intraday Nov 11; -4.77% from its 21-day high, DCA zone fair.","note":"Nov 11 intraday print (~12:45 COT, US session open; bond market closed for Veterans Day). Big rebound moved it from cheap to fair.","dcaSignal":{"percentileInMonth":58,"pctVs20dAvg":-0.7,"pctFromHigh":-4.77,"rsi14":47.53,"zone":"fair","note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"}},
 {"ticker":"VOO","price":696.96,"changePct":1.08,"bias":"S&P 500 +1.1% intraday Nov 11; -1.94% from its 21-day high, DCA zone fair.","note":"Nov 11 intraday print from StockAnalysis (CNBC showed 699.70, +1.48%, at 12:45 COT). US session open.","dcaSignal":{"percentileInMonth":63,"pctVs20dAvg":-0.26,"pctFromHigh":-1.94,"rsi14":48.99,"zone":"fair","note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"}},
 {"ticker":"JPXN","price":99.61,"changePct":1.32,"bias":"JPX-Nikkei 400 ETF +1.32% intraday Nov 11; -3.39% from its 21-day high, DCA zone fair.","note":"Nov 11 intraday print (~12:45 COT, US session open).","dcaSignal":{"percentileInMonth":52,"pctVs20dAvg":-1.37,"pctFromHigh":-3.39,"rsi14":45.32,"zone":"fair","note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."},"source":{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"}}],
 "stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":True,
 "rollingRecord":"Morning set 72,700 reduce and 74,800 add. Neither fired (window 73,388-74,779; the high missed the add by 21). Closing half the hedge at 74,053 saved about 0.08 USDT versus holding it to 74,586.",
 "note":"Morning called range with no tilt (46 range, 26/28). Price dipped to 73.4k then squeezed to 74.78k, staying inside the range and leaning up, so the call held. Compared against today's morning report."},
"sources":[
 {"title":"OKX BTC-USDT ticker","url":"https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT"},
 {"title":"OKX BTC-USDT candles","url":"https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1H"},
 {"title":"OKX open interest","url":"https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP"},
 {"title":"OKX funding rate","url":"https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP"},
 {"title":"OKX long/short account ratio","url":"https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=1H"},
 {"title":"OKX liquidation orders","url":"https://www.okx.com/api/v5/public/liquidation-orders?instType=SWAP&uly=BTC-USDT&state=filled&limit=100"},
 {"title":"Farside Bitcoin ETF flows","url":"https://farside.co.uk/btc/"},
 {"title":"Alternative.me Fear & Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},
 {"title":"CNBC quotes (Brent, DXY, US10Y)","url":"https://www.cnbc.com/quotes/@LCO.1"},
 {"title":"StockAnalysis QQQ/VOO/JPXN history","url":"https://stockanalysis.com/etf/qqq/history/"}]}
assert abs(sum(r["probabilities"].values())-100)<1e-6
json.dump(r,open("2026/11/2026-11-11-midday.json","w"),indent=2)
m=json.load(open("manifest.json"));nd=len(m["days"])
d=[x for x in m["days"] if x["date"]=="2026-11-11"][0]
d["sessions"]["midday"]="data/2026/11/2026-11-11-midday.json"
for k in ("midnight","morning","midday","endday"): d["sessions"].setdefault(k,None)
m["latest"]="data/2026/11/2026-11-11-midday.json";m["updatedAt"]=TS
json.dump(m,open("manifest.json","w"),indent=2);assert len(json.load(open("manifest.json"))["days"])==nd
c=json.load(open("calibration.json"));nc=len(c)
for row in c:
    if row["date"]=="2026-11-11" and row["session"]=="morning":
        row["price_next_report"]=P
        if row["reduce_fired"] is None: row["reduce_fired"]=False
        if row["add_fired"] is None: row["add_fired"]=False
        if row["acting_helped"] is None: row["acting_helped"]=True
c.append({"date":"2026-11-11","session":"midday","bias":"range-bull","bull_pct":32.0,"range_pct":46.0,"bear_pct":22.0,"reduce_level":73380.0,"reduce_fired":None,"add_level":74800.0,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open("calibration.json","w"),indent=2);assert len(json.load(open("calibration.json")))==nc+1
print("ok",nd,nc+1)
