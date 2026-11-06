import json,copy
D='public/data/'
prev=json.load(open(D+'2026/11/2026-11-05-endday.json'))
T='2026-11-06T02:10:00-05:00'
A='2026-11-06T02:05:00-05:00'
R=copy.deepcopy(prev)
R.update({"id":"2026-11-06-midnight","date":"2026-11-06","session":"midnight","generatedAt":T,"overallBias":"range","biasTilt":"bearish","confidence":5.0})
R.pop('overnightRisk',None)
R["priceSnapshot"]={"value":75480.6,"currency":"USD","changePct":-6.50,"source":"OKX BTC-USDT ticker (24h open 80,732)","asOf":A,
 "note":"Versus the 19:38 COT endday report (76,260): -1.0%. Overnight BTC bounced to 76.4k, then rolled over and flushed crowded longs at 75.4k. The 75,200 wick low still holds, but price is now under the daily EMA200 (76,110) on a live bar.",
 "sessionRange":{"low":75360.0,"high":76405.7}}
R["decisionBox"]={"position":"ADD","reduceIf":{"price":75200.0,"confirmation":"A 1H close under 75,200 (the Nov 5 wick low) opens 74.0k then 72.5k; sell more of the spot core."},
 "addIf":{"price":76554.97,"confirmation":"A 4H close above 76,555 would put price back above the daily EMA200 and show the overnight flush was absorbed."},
 "invalidatesAt":73414.0,"stopOrder":{"recommended":False,"price":74950.0},
 "changed":"The 75,200 reduce level held again and no 1H close printed under it. Overnight longs got flushed (about $492k at 75.3k-75.5k), which clears some leverage. Daily structure weakened: price is under the EMA200. The wallet deploys a small 15 USDT starter tranche into the oversold flush, with no leverage."}
R["probabilities"]={"bullish":24.0,"range":38.0,"bearish":38.0}
R["levels"]={"support":[75200.0,75000.0,73414.0],"resistance":[76109.5,76554.97,77011.2,77729.4],
 "liquidation":[
 {"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"OKX realized (fresh, newest fill 01:38 COT Nov 6): about $492k of longs liquidated at 75.3k-75.5k, $379k of it at 75.4k. Measured, approximate (0.01 BTC contract x fill price)."},
 {"price":73970,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 50x longs opened near spot liquidate near 74.0k. Not exchange resting-order data."},
 {"price":72461,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near spot liquidate near 72.5k. Not exchange resting-order data."},
 {"price":76990,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 50x shorts opened near spot liquidate near 77.0k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":76554.97,"nearestBelow":75200.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":A,
 "note":"OKX feed was fresh (newest fill 06:38 UTC), so CoinGlass was not needed. Longs are still crowded (1H ratio 2.96) despite the flush, so the pull stays down. Forward levels are estimates, not a heatmap read."}}
R["atr"]={"value":1127.6,"period":14,"pct":1.49,"source":"OKX 4H candles, Wilder ATR14","asOf":A}
def tf(t,rsi,m,e,s,b):
    return {"tf":t,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":s,"bias":b,
    "source":"OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9); last bar unconfirmed","asOf":A}
R["timeframes"]=[
 tf("15m",38.33,[-148.6,-150.4,1.9],[75760.6,76206.8,77036.3,77703.4],"Price under every EMA after the 76.4k rejection; MACD flat near zero; session low 75,360","bearish-flat"),
 tf("1h",27.92,[-880.3,-879.3,-1.0],[76640.5,77634.8,77954.6,78332.7],"Price 1.2k under EMA20 and 2.9k under EMA200; RSI 28 is oversold; MACD negative but not widening","bearish-oversold"),
 tf("4h",34.84,[-446.9,-46.6,-400.3],[77729.4,78341.7,79325.2,80296.5],"Price under all EMAs, 4.8k under the EMA200; MACD histogram -400 and widening","bearish"),
 tf("daily",36.26,[-1392.4,-993.1,-399.3],[79335.0,79894.6,77794.3,76109.5],"Price slipped under the EMA200 (76,110) on the live bar; RSI 36; MACD negative and widening; bar is 2h old (UTC)","bearish-below-EMA200")]
R["operations"]=[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"add","entry":None,"stop":74950.0,"tp":[76554.97,77729.4],"rr":None,"confidence":4.0,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}]
R["scalpContext"]={"intradayBias":"Range 75.2k-76.4k; bounces into 76.1k-76.6k face the daily EMA200 and EMA cluster; a break under 75.2k is the risk","longAbove":76554.97,"shortBelow":75200.0,"invalidates":73414.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
m=R["macro"]
m["etfFlows"]={"streakDays":-1,"note":"US spot BTC ETFs (Farside): Nov 4 +$74.6M, Nov 5 -$68.8M. Nov 6 flows not published yet; latest verified figures carried from the endday report."}
m["liquidations"]={"longsUsd":492428.0,"shortsUsd":76.0,"skew":2.96,"traders":None,"openInterestUsd":2665392088.0,
 "note":"OKX realized fills, 100 most recent (fresh, 00:23 COT to 01:38 COT Nov 6): about $492k of longs, almost no shorts (approximate, 0.01 BTC contracts). OKX OI $2.67B, funding +0.0034%, 1H long/short account ratio 2.96 (longs crowded, used as skew). Fear and Greed 28 (Fear, alternative.me; previous day 50). Brent 98.29, DXY 101.49, US10Y 4.841%: last US-close values from the Nov 5 endday report (not re-verified overnight)."}
m["fearGreed"]=28
for i in R["nonCrypto"]["indices"]:
    i["note"]="Last close Nov 5 (StockAnalysis, 4:00 PM EST); US market closed, no new session. Carried from last close."
    i["dcaSignal"]["note"]="Carried from last close — relative-cheapness for monthly DCA, not a bottom call."
R["calibration"]={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Endday set 75,200 as the reduce level, trimmed 20% of spot at 76,260, and kept a 74,950 stop. Price visited 75,360 but never closed an hour under 75,200. The trim sold about 1% above the current price.",
 "note":"Endday's range with bearish tilt (25/40/35) was right: BTC drifted down 1.0% and flushed longs, with the 75,200 floor intact. The bearish risk is rising now that the daily EMA200 is lost."}
R["sources"]=prev["sources"]
json.dump(R,open(D+'2026/11/2026-11-06-midnight.json','w'),indent=2)
# manifest
M=json.load(open(D+'manifest.json'))
M["days"]=[d for d in M["days"] if d["date"]!="2026-11-06"]
M["days"].insert(0,{"date":"2026-11-06","sessions":{"midnight":"data/2026/11/2026-11-06-midnight.json","morning":None,"midday":None,"endday":None}})
M["latest"]="data/2026/11/2026-11-06-midnight.json";M["updatedAt"]=T
json.dump(M,open(D+'manifest.json','w'),indent=2)
# calibration
C=json.load(open(D+'calibration.json'))
for r in C:
    if r["date"]=="2026-11-05" and r["session"]=="endday":
        r["price_next_report"]=75480.6;r["reduce_fired"]=False;r["add_fired"]=False;r["acting_helped"]=True
C.append({"date":"2026-11-06","session":"midnight","bias":"range-bear","bull_pct":24.0,"range_pct":38.0,"bear_pct":38.0,"reduce_level":75200.0,"reduce_fired":None,"add_level":76554.97,"add_fired":None,"price_at_report":75480.6,"price_next_report":None,"acting_helped":None})
json.dump(C,open(D+'calibration.json','w'),indent=2)
# intent
I={"session":"midnight","reportId":"2026-11-06-midnight","ts":T,"today":"2026-11-06","markPrice":75480.6,"sessionHigh":76405.7,"sessionLow":75360.0,"isSeeder":True,
 "rationale":"Overnight longs were flushed at 75.4k and the 75,200 floor held, with 1H RSI at 28. The daily close under the EMA200 keeps the bias soft, so no leverage: the wallet adds a small 15 USDT spot tranche into the flush and keeps 32 USDT of cash for a break lower.",
 "message":{"to":"morning","text":"Bought a 15 USDT starter at 75.48k. If a 1H close prints under 75,200, stop adding and consider trimming; above 76,555 on a 4H close the dip was absorbed."},
 "decision":{"type":"spot_buy","usd":15}}
json.dump(I,open(D+'intent-20261106-midnight.tmp.json','w'),indent=2)
