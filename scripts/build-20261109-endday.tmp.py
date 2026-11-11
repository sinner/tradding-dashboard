import json,copy
T="2026-11-09T19:35:00-05:00"
mid=json.load(open('2026/11/2026-11-09-midday.json'))
src=lambda t,u:{"title":t,"url":u}
def dca(p,v,h,r,z):
    return {"percentileInMonth":p,"pctVs20dAvg":v,"pctFromHigh":h,"rsi14":r,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}
def idx(t,price,chg,bias,d):
    return {"ticker":t,"price":price,"changePct":chg,"bias":bias,"note":"Nov 9 close (StockAnalysis); the US session ended before this report.","dcaSignal":d,"source":{"title":f"{t} — StockAnalysis","url":f"https://stockanalysis.com/etf/{t.lower()}/"}}
def tf(name,rsi,m,s,h,e,st,b):
    return {"tf":name,"rsi":rsi,"macd":{"line":m,"signal":s,"hist":h},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":b,"source":"OKX BTC-USDT candles (400 bars) via in-page browser fetch, computed (EMA, Wilder RSI14, MACD 12-26-9); last bar unconfirmed","asOf":T}
r={
"schemaVersion":"1.0.0","id":"2026-11-09-endday","date":"2026-11-09","session":"endday","generatedAt":T,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":5.0,
"priceSnapshot":{"value":75086.5,"currency":"USD","changePct":0.01,"source":"OKX BTC-USDT ticker (24h open 75,077.8; 24h range 73,751-75,598)","asOf":T,"note":"Versus the midday report (74,611.5): +0.64%. BTC bounced inside the 74.4k-75.6k range and stays under the 4H EMA20 (75,551) and the daily EMA20/50/200.","sessionRange":{"low":74352.9,"high":75570.6}},
"decisionBox":{"position":"HOLD","reduceIf":{"price":73500.0,"confirmation":"A 1H close under 73,500 (the weekend wick low) opens 72.8k then 72.0k; trim the core."},"addIf":{"price":75613.6,"confirmation":"A 4H close above 75,614 (4H EMA20 area) with the 1H EMA50 (75.2k) reclaimed allows an add toward 76.1k."},"invalidatesAt":72850.0,"stopOrder":{"recommended":True,"price":73400.0},"changed":"Neither the 73,500 reduce level nor the 75,614 add trigger fired since midday. The wallet holds its spot core and about 21 USDT of cash into the overnight gap rather than chase the 75.6k cap."},
"overnightRisk":"The next report is about 02:00 COT. BTC sits 2.3% above the 73,500 reduce level with a resting-stop gap to 72.8k-73.6k (50x long liquidation bracket ~73.6k, 25x ~72.1k, both estimates). Longs are crowded (OKX 1H account ratio 2.79) and daily/4H trends are bearish, so a thin Asia-session flush is the main risk. Funding settles at 00:00 and 08:00 UTC (19:00 and 03:00 COT). Upside risk: 459k USD of shorts were already squeezed at 75.1k-75.4k, so a reclaim of 75.6k can run to 76.1k-76.6k. Keep the 73,400 stop resting.",
"probabilities":{"bullish":22.0,"range":42.0,"bearish":36.0},
"levels":{"support":[74352.9,73751.0,73500.0,72850.0],"resistance":[75089.2,75570.6,75613.6,76100.0],
"liquidation":[
{"price":76588,"side":"above","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet (50x short bracket: spot x 1.02) — not exchange resting-order data."},
{"price":75400,"side":"above","intensity":"high","magnet":False,"note":"OKX realized fills (fresh, 100 latest): about $152k of shorts liquidated at 75.4k and about $171k at 75.3k; that squeeze is already done, so it marks a reaction zone, not a resting magnet."},
{"price":73585,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet (50x long bracket: spot x 0.98) sitting under the 73.5k weekend wick low; the closest downside pull — not exchange resting-order data."},
{"price":72083,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet (25x long bracket: spot x 0.96) — not exchange resting-order data."}],
"liquidityMagnet":{"nearestAbove":76588.0,"nearestBelow":73585.0,"pull":"down","source":"OKX public API (realized liquidation orders, open interest, funding, 1H long/short account ratio) plus labelled leverage-bracket estimates","asOf":T,"note":"Realized OKX fills in the latest window were about $30k longs vs $459k shorts, so shorts were flushed on the bounce. Levels above/below are leverage-bracket estimates, not measured resting orders. Crowded longs (ratio 2.79) and a bearish daily lean the pull slightly down."}},
"atr":{"value":845.2,"period":14,"pct":1.13,"source":"OKX 4H candles, Wilder ATR14","asOf":T},
"timeframes":[
tf("15m",51.43,103.39,105.08,-1.7,[75089.17,74946.54,74963.47,75176.45],"Price at EMA20 (75.09k) above EMA50/100 (74.95k/74.96k), under EMA200 (75.18k); flat MACD histogram in a tight base","neutral"),
tf("1h",51.17,1.6,-88.33,89.92,[74979.09,75231.4,75779.19,76632.85],"Price above EMA20 (74.98k) but under EMA50/100/200; RSI 51 recovered from the 73.5k flush; MACD crossing up near zero","neutral"),
tf("4h",43.36,-549.6,-598.28,48.68,[75550.52,76606.12,77921.0,79400.51],"Price under all EMAs in stacked bearish order; EMA20 at 75.55k is the cap; MACD histogram turned positive","bearish"),
tf("daily",35.52,-1651.11,-1333.85,-317.27,[78120.06,79272.08,77648.22,76791.12],"Price under the 20/50/100 and the EMA200 (76.8k); RSI 36 near oversold; MACD negative and widening","bearish")],
"operations":[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"hold","entry":None,"stop":73400.0,"tp":[75613.6,76100.0],"rr":None,"confidence":5.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Range 74.35k-75.6k with a bearish tilt; 75.6k (4H EMA20) caps bounces; a 1H close under 73,500 is the risk","longAbove":75100.0,"shortBelow":74350.0,"invalidates":73500.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":92.38,"changePct":-0.21},"dxy":{"value":101.72},"us10y":{"value":4.88},
"etfFlows":{"streakDays":1,"note":"US spot BTC ETFs (Farside, US$m): Nov 5 -430.2, Nov 6 -411.9, Nov 9 +12.2 (small inflow, may be preliminary). The two-day outflow streak ended. Brent, DXY and US10Y from TradingEconomics (Nov 10 UTC quotes)."},
"liquidations":{"longsUsd":30119.0,"shortsUsd":459422.0,"skew":2.79,"traders":None,"openInterestUsd":2609933352.0,"note":"OKX realized fills, 100 most recent (fresh, ~14:40-19:15 COT Nov 9), approximate (0.01 BTC contracts): shorts squeezed at 75.1k-75.4k. OKX OI $2.61B, funding +0.0027%, 1H long/short account ratio 2.79 (longs crowded, used as skew). Fear and Greed 32 (Fear, alternative.me). CoinGlass heatmap not opened: the OKX feed was fresh."},
"fearGreed":32,"earnings":[]},
"nonCrypto":{"indices":[
idx("QQQ",678.76,3.45,"Nasdaq 100 rebounded +3.45% on Nov 9 but sits about 9% under its 21-day high.",dca(32,-3.62,-9.02,42.36,"fair")),
idx("VOO",691.83,2.34,"S&P 500 rebounded +2.34%, about 3.3% under its 21-day high.",dca(43,-1.25,-3.27,46.35,"fair")),
idx("JPXN",99.59,3.9,"Japan JPX-Nikkei 400 ETF +3.9% on Nov 9, about 4.6% under its 21-day high.",dca(44,-1.86,-4.61,43.88,"fair"))],"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":True,"rollingRecord":"The midday report set 73,500 as the reduce level and 75,614 as the add trigger. Neither fired: the low since is 74,353 and the high 75,571. The 10 USDT tranche bought at 74.6k is up about 0.6%.","note":"Range with bearish tilt (22/42/36) is intact. Compared against today's midday report."},
"sources":[src("OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","https://www.okx.com/docs-v5/en/"),src("Farside Investors — Bitcoin ETF Flow","https://farside.co.uk/btc/"),src("StockAnalysis — QQQ, VOO, JPXN history","https://stockanalysis.com/etf/qqq/history/"),src("TradingEconomics — Brent, US10Y, DXY","https://tradingeconomics.com/commodity/brent-crude-oil"),src("alternative.me Fear & Greed","https://alternative.me/crypto/fear-and-greed-index/")]
}
json.dump(r,open('2026/11/2026-11-09-endday.json','w'),indent=2,ensure_ascii=False)
# manifest
m=json.load(open('manifest.json'))
d=[x for x in m['days'] if x['date']=='2026-11-09'][0]
d['sessions']['endday']='data/2026/11/2026-11-09-endday.json'
for k in('midnight','morning','midday','endday'):d['sessions'].setdefault(k,None)
m['latest']='data/2026/11/2026-11-09-endday.json';m['updatedAt']=T
json.dump(m,open('manifest.json','w'),indent=2,ensure_ascii=False)
# calibration
c=json.load(open('calibration.json'))
for x in c:
    if x['date']=='2026-11-09' and x['session']=='morning' and x['price_next_report'] is None: x['price_next_report']=74611.5
    if x['date']=='2026-11-09' and x['session']=='midday':
        x['price_next_report']=75086.5;x['reduce_fired']=False;x['add_fired']=False;x['acting_helped']=True
c.append({"date":"2026-11-09","session":"endday","bias":"range-bear","bull_pct":22.0,"range_pct":42.0,"bear_pct":36.0,"reduce_level":73500.0,"reduce_fired":None,"add_level":75613.6,"add_fired":None,"price_at_report":75086.5,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2,ensure_ascii=False)
md=f"""# BTC End Day Analysis — 2026-11-09

**Bias: range with a bearish tilt · confidence 5.0/10 · probabilities 22 / 42 / 36 (bull / range / bear)**

## Bias review
Compared against the midday report. Its 73,500 reduce level did not fire (the low since is 74,353) and the 75,614 add trigger did not fire either (the high since is 75,571). The 10 USDT spot tranche bought at 74.6k is up about 0.6%.

## What changed
BTC trades at 75,086 (+0.64% since midday). It bounced inside the 74.4k-75.6k range and still sits under the 4H EMA20 (75,551) and the daily EMA20, EMA50 and EMA200.

## Technical read
15m: price at the EMA20 (75.09k), flat MACD, RSI 51. 1H: above the EMA20 (74.98k), under EMA50/100/200, RSI 51, MACD crossing up near zero. 4H: under every EMA in bearish order, RSI 43, histogram turned positive. Daily: under the 20/50/100 and the EMA200 (76.8k), RSI 36, MACD negative and widening. ATR(14) on the 4H is 845 (1.13%).

## Liquidation map
Source: OKX public API (fresh). Realized fills in the latest window were about $30k longs against $459k shorts, mostly at 75.1k-75.4k, so shorts were squeezed on the bounce. Levels below are labelled leverage-bracket estimates, not measured resting orders: a 50x long bracket near 73.6k (just under the weekend low), a 25x bracket near 72.1k, and a 50x short bracket near 76.6k. OI is $2.61B, funding +0.0027%, and the 1H long/short ratio is 2.79, so longs are crowded. The CoinGlass heatmap was not opened because the OKX feed was fresh.

## Macro & flows
US spot BTC ETFs saw a small +12.2M inflow on Nov 9 after -430.2M and -411.9M. Brent 92.38, DXY 101.72, US10Y 4.88%, Fear and Greed 32. Equities rebounded: QQQ 678.76 (+3.45%), VOO 691.83 (+2.34%), JPXN 99.59 (+3.90%). All three sit in the "fair" DCA zone (month percentiles 32, 43, 44).

## Paper wallet
Ledger: endday HOLD · mark 75086.5 · equity 134.29 · savings 0.1 · net 134.39 · round 1 · bankruptcies 0. Spot core 0.0015 BTC, futures flat, about 21 USDT cash. Nothing auto-resolved.

## Overnight plan
The next report is about 02:00 COT. Keep the 73,400 stop resting under the 73,500 reduce level. Add only on a 4H close above 75,614. Below 73,500 the next stops are 72.8k and 72.0k. Funding settles at 19:00 and 03:00 COT.

## Key risks
A thin Asia-session flush into the 73.6k bracket with crowded longs. A failed reclaim of 75.6k. A fresh ETF outflow streak. Upside: shorts already burned, so a 75.6k reclaim can run to 76.1k-76.6k.

_Educational quantitative analysis, not individualized financial advice._
"""
import os
os.makedirs('reports/2026/11',exist_ok=True)
open('reports/2026/11/2026-11-09-endday.md','w').write(md)
