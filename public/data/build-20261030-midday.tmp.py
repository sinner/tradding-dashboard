import json,copy,statistics as st
P='2026-10-30'; ID=P+'-midday'; TS='2026-10-30T12:42:00-05:00'
mo=json.load(open('2026/10/2026-10-30-morning.json'))
r=copy.deepcopy(mo)
r['id']=ID; r['session']='midday'; r['generatedAt']=TS
r['overallBias']='range'; r['biasTilt']='bearish'; r['confidence']=5.3
r['priceSnapshot']={"value":77304.9,"currency":"USD","changePct":-4.45,"source":"OKX BTC-USDT ticker (in-page fetch, ts fresh)","asOf":TS,"note":"24h open 80,901.9; 24h range 76,519-80,957.2. BTC bounced to 78,088 after the morning report, failed under the 1H EMA20 and is back at 77,305, 1.5% above the daily EMA200 (76,178).","sessionRange":{"low":76602.7,"high":78088.4}}
r['decisionBox']={"position":"ADD","reduceIf":{"price":76178.0,"confirmation":"A 1H close under the daily EMA200 (76,178); the 76,519 24h low and 76,603 session low are the first warnings, 75,400 the next air pocket."},"addIf":{"price":79350.0,"confirmation":"A 1H close above 79,350 after a reclaim of the 1H EMA20 (77,991) and EMA50 (78,973); 79,368 (4H EMA20) is the next gate."},"invalidatesAt":79368.0,"stopOrder":{"recommended":True,"price":75900.0},"changed":"Morning's range-bear call held: the 76,519 floor survived a second test (session low 76,603) and the bounce stalled at 78,088, under the 1H EMA20. Reduce line (76,032) not fired, add line (79,350) not fired. Probabilities lean a bit more bearish after a US equity sell-off (QQQ about -3.7% intraday). The wallet adds a small 5 USDT spot tranche and keeps cash above the 30 USDT due Nov 1."}
r['probabilities']={"bullish":21.0,"range":43.0,"bearish":36.0}
r['levels']={"support":[76602.7,76519.0,76178.0,75400.0],"resistance":[77990.8,78088.4,78973.1,79350.0,79367.8],
"liquidation":[{"price":77300,"side":"below","intensity":"medium","magnet":False,"note":"OKX realized (fresh, 15:42-17:40 UTC): about $181.9k of longs liquidated at 77.3k, $143k at 77.1k and $135k at 77.2k. Measured, approximate (0.01 BTC contract x fill price). A long flush around spot, largely spent."},
{"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 25x longs opened near 78.5k liquidate near 75.4k. Not exchange resting-order data."},
{"price":80100,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 77k liquidate near 80.1k, just above the 4H EMA20 (79,368). Not exchange resting-order data."}],
"liquidityMagnet":{"nearestAbove":80100.0,"nearestBelow":75400.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page fetch; leverage-bracket estimates","asOf":TS,"note":"OKX 1H long/short account ratio 2.72 (up from 2.47) means longs are even more crowded, so the pull stays down. Forward levels are estimates, not a heatmap read; the CoinGlass fallback was not needed because the OKX feed was fresh."}}
r['atr']={"value":1071.7,"period":14,"pct":1.39,"source":"OKX 4H candles, Wilder ATR14","asOf":TS}
src="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9)"
def tf(t,rsi,m,e,s,b): return {"tf":t,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":s,"bias":b,"source":src,"asOf":TS}
r['timeframes']=[
tf("15m",46.1,[-68.7,-87.5,18.8],[77391.6,77668.6,78244.2,79015.4],"Price just under EMA20 and EMA50, above nothing; MACD still negative but the histogram turned positive, a weak bounce inside the range","bearish"),
tf("1h",37.5,[-624.2,-648.3,24.1],[77990.8,78973.1,79666.2,80324.9],"Under every EMA, RSI 37.5; MACD histogram slightly positive after the 76.6k low, the bounce was sold under the EMA20","bearish"),
tf("4h",33.8,[-819.6,-471.9,-347.7],[79367.8,80310.9,81108.9,81499.2],"Under the whole stack; RSI 33.8, MACD line far under signal and zero","bearish"),
tf("daily",36.1,[-900.4,-438.1,-462.3],[80922.8,80546.1,77837.0,76178.0],"Under EMA20, EMA50 and EMA100; price 1.5% above the EMA200 (76,178); MACD negative and widening","bearish")]
r['operations']=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":75900.0,"tp":[79350.0,80500.0],"rr":None,"confidence":4.8,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.3,"hold":"long-term"}]
r['scalpContext']={"intradayBias":"Range 76.6k-78.1k with a downward lean: 77,991 (1H EMA20) caps rallies, the 76,519 24h low is the floor","longAbove":77990.0,"shortBelow":77300.0,"invalidates":79368.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
m=r['macro']
m['brent']={"value":117.8,"changePct":2.54}; m['dxy']={"value":101.979}; m['us10y']={"value":4.945}
m['etfFlows']={"streakDays":4,"note":"US spot BTC ETFs: month to date +$128.3M (tftc.io, updated Oct 29), carried from the morning report; no newer print found this run. Inflows Oct 26-29."}
m['liquidations']={"longsUsd":505000,"shortsUsd":2000,"skew":2.72,"traders":None,"openInterestUsd":2653108535.0,"note":"OKX realized fills, 100 most recent (fresh, 15:42-17:40 UTC): about $505k of longs vs $2k of shorts liquidated at 77.1-77.4k (approximate, 0.01 BTC contracts). OKX OI $2.65B, funding +0.010%, 1H long/short account ratio 2.72 (longs crowded, used as skew). Fear and Greed 30 (Fear, alternative.me, Oct 30 print)."}
m['fearGreed']=30
# non-crypto
closes={}
raw={"QQQ":"688.72,715.34,725.61,721.25,712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93",
"VOO":"694.21,707.32,709.90,707.52,703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86,702.46",
"JPXN":"99.90,101.85,102.13,102.89,102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33"}
def sig(cs):
    c=[float(x) for x in cs.split(',')][::-1]  # oldest first
    w=c[-21:]; last=w[-1]; mn,mx=min(w),max(w)
    pct=round((last-mn)/(mx-mn)*100); v20=round((last/(sum(w[-20:])/20)-1)*100,2); fh=round((last/mx-1)*100,2)
    g=l=0
    for i in range(1,15):
        d=c[i]-c[i-1]; g+=max(d,0); l+=max(-d,0)
    g/=14;l/=14
    for i in range(15,len(c)):
        d=c[i]-c[i-1]; g=(g*13+max(d,0))/14; l=(l*13+max(-d,0))/14
    rsi=round(100-100/(1+g/l),1) if l else 100
    z='very-cheap' if pct<=10 or (pct<=20 and rsi<35) else 'cheap' if pct<=30 else 'fair' if pct<=70 else 'rich'
    return {"percentileInMonth":pct,"pctVs20dAvg":v20,"pctFromHigh":fh,"rsi14":rsi,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}
info={"QQQ":(688.72,-3.72,"heavy sell-off intraday, at the low end of its 21-day range","Oct 30 intraday last 688.72 (-3.72% vs 715.34 close, StockAnalysis); session still open, final close may differ."),
"VOO":(694.21,-1.85,"broad market down intraday, near the bottom of the 21-day range","Oct 30 intraday last 694.21 (-1.85% vs 707.32 close, StockAnalysis); session still open, final close may differ."),
"JPXN":(99.9,-1.92,"Japan ex-large-caps weak, new 21-day low area","Oct 30 intraday last 99.90 (-1.92% vs 101.85 close, StockAnalysis); session still open, final close may differ.")}
r['nonCrypto']['indices']=[{"ticker":t,"price":info[t][0],"changePct":info[t][1],"bias":info[t][2],"note":info[t][3],"dcaSignal":sig(raw[t]),"source":{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/%s/"%t.lower()}} for t in ["QQQ","VOO","JPXN"]]
r['calibration']={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Morning range-bear: reduce 76,032 not fired, add 79,350 not fired; price held 77.3k after a 78,088 bounce and a 76,603 low.","note":"Range held a second time; the second 15 USDT spot DCA from morning sits roughly flat."}
r['sources']=[s for s in r['sources'] if 'CoinGlass' not in s['title']]+[{"title":"CoinGlass heatmap not used: OKX feed was fresh; forward magnets are labelled estimates","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"}]
json.dump(r,open('2026/10/%s.json'%ID,'w'),indent=2)
mf=json.load(open('manifest.json'))
for d in mf['days']:
    if d['date']==P: d['sessions']['midday']='data/2026/10/%s.json'%ID
mf['latest']='data/2026/10/%s.json'%ID; mf['updatedAt']=TS
json.dump(mf,open('manifest.json','w'),indent=2)
c=json.load(open('calibration.json'))
for x in c:
    if x['date']==P and x['session']=='morning':
        x['reduce_fired']=False; x['add_fired']=False; x['price_next_report']=77304.9; x['acting_helped']=True
c.append({"date":P,"session":"midday","bias":"range-bear","bull_pct":21.0,"range_pct":43.0,"bear_pct":36.0,"reduce_level":76178.0,"reduce_fired":None,"add_level":79350.0,"add_fired":None,"price_at_report":77304.9,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
json.dump({"session":"midday","reportId":ID,"ts":TS,"today":P,"markPrice":77304.9,"sessionHigh":78088.4,"sessionLow":76602.7,"isSeeder":False,
"rationale":"The 76,519 floor held a second time (session low 76,603) and the bounce died at 78,088 under the 1H EMA20. Every timeframe is still under its EMAs, so no futures. A small 5 USDT spot DCA near support lowers the average entry while cash stays at 30.8, just above the 30 USDT cost of living due Nov 1.",
"message":{"to":"endday","text":"Spot got a 5 USDT DCA near 77.3k. Futures flat. Cash about 30.8, keep 30 for Nov 1. Reduce on a 1H close under 76,178; add more only on a 1H close above 79,350."},
"lesson":{"pattern":"Floor retest with crowded longs","insight":"A second hold of 76.5k with long/short ratio at 2.72 shows longs still crowded; bounces stall under the 1H EMA20. Keep tranches small and cash reserved for fixed costs."},
"decision":{"type":"spot_buy","usd":5}},open('intent-20261030-midday.tmp.json','w'),indent=1)
