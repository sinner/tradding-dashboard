import json,copy
R='public/data/'
P=json.load(open(R+'2026/11/2026-11-06-midday.json'))
T='2026-11-06T23:08:00-05:00'
def rsi(c):
    c=c[::-1]; g=l=0
    for i in range(1,15):
        d=c[i]-c[i-1]; g+=max(d,0); l+=max(-d,0)
    g/=14; l/=14
    for i in range(15,len(c)):
        d=c[i]-c[i-1]; g=(g*13+max(d,0))/14; l=(l*13+max(-d,0))/14
    return 100-100/(1+g/(l or 1e-9))
def dca(c,note):
    w=c[:21]; mn,mx=min(w),max(w); last=w[0]; m20=sum(w[:20])/20
    pct=round((last-mn)/(mx-mn)*100); r=round(rsi(c),1)
    z='very-cheap' if (pct<=10 or (pct<=20 and r<35)) else 'cheap' if pct<=30 else 'fair' if pct<=70 else 'rich'
    return {"percentileInMonth":pct,"pctVs20dAvg":round((last/m20-1)*100,2),"pctFromHigh":round((last/mx-1)*100,2),"rsi14":r,"zone":z,"note":note}
N="Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."
Q=[656.10,647.05,691.95,685.28,681.09,690.49,715.34,725.61,721.25,712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93,736.53]
V=[675.99,673.97,704.78,693.54,691.32,694.81,707.32,709.90,707.52,703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86,702.46,703.61]
J=[95.86,96.46,101.69,100.36,100.58,100.31,101.85,102.13,102.89,102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33,102.96]
def src(t): return {"title":f"{t} — StockAnalysis","url":f"https://stockanalysis.com/etf/{t.lower()}/"}
idx=[
 {"ticker":"QQQ","price":656.10,"changePct":1.40,"bias":"Nasdaq 100 closed +1.4% after the -6.5% flush on Nov 5, still about 12.7% under its 21-day high.","note":"Nov 6 official close (StockAnalysis, 4:00 PM EST); after-hours 657.51. RSI from 30 closes.","dcaSignal":dca(Q,N),"source":src("QQQ")},
 {"ticker":"VOO","price":675.99,"changePct":0.30,"bias":"S&P 500 closed +0.3%, barely off the Nov 5 low (673.97) after a record one-day value loss.","note":"Nov 6 official close (StockAnalysis, 4:00 PM EST); after-hours 677.00. RSI from 30 closes.","dcaSignal":dca(V,N),"source":src("VOO")},
 {"ticker":"JPXN","price":95.86,"changePct":-0.63,"bias":"Japan large caps made a fresh 21-day low, extending the global risk-off.","note":"Nov 6 official close (StockAnalysis, 4:00 PM EST). RSI from 30 closes.","dcaSignal":dca(J,N),"source":src("JPXN")}]
px=75885.1
d=copy.deepcopy(P)
d.update({"id":"2026-11-06-endday","session":"endday","generatedAt":T,"overallBias":"range","biasTilt":"bearish","confidence":5.0})
d["priceSnapshot"]={"value":px,"currency":"USD","changePct":0.14,"source":"OKX BTC-USDT ticker (24h open 75,780.1; 24h range 74,887.9-76,378.7)","asOf":T,"note":"Versus the 12:50 COT midday report (75,600.8): +0.4%. BTC held the 75.5k floor all afternoon and is pinned under the daily EMA200 (76,150).","sessionRange":{"low":75501.5,"high":76218.0}}
d["decisionBox"]={"position":"REDUCE","reduceIf":{"price":74888.0,"confirmation":"A 1H close under 74,888 (the 24h wick low) opens 74.4k then 72.9k; cut more of the spot core."},"addIf":{"price":76554.97,"confirmation":"A 4H close above 76,555 reclaims the daily EMA200 and aims at the 4H EMA20 (76.9k-77.3k); rebuy then."},"invalidatesAt":73414.0,"stopOrder":{"recommended":True,"price":74800.0},"changed":"Nothing broke since midday: the 75.5k floor held and shorts were squeezed at 76.1k. Ahead of the thin overnight gap, with the 4H trend bearish and longs crowded, the wallet trims 20% of spot into the 76.0k-76.15k resistance pocket."}
d["overnightRisk"]="Next report is about 02:00 COT. Tomorrow is Saturday, so US cash markets are shut and BTC trades alone in thin weekend liquidity. Catalysts: US ETF flows (Nov 6 prints about -$9M so far, five of the last six days were outflows), the global equity risk-off (S&P 500 lost a record one-day value on Nov 5; QQQ and VOO bounced only 1.4% and 0.3%), a firm dollar (DXY 102.28, +0.7%) and US10Y at 4.86% (+2bp), Brent near $98, and Asia open Sunday with JPXN at a 21-day low. OKX 1H long/short ratio 3.0 means longs are crowded; an estimated 50x-long pocket sits near 74.4k, just under the 74,888 wick low. A resting stop near 74,800 is the only protection while nobody is watching."
d["probabilities"]={"bullish":24.0,"range":42.0,"bearish":34.0}
d["levels"]={"support":[75200.0,74888.0,74367.0,73414.0],"resistance":[76006.4,76150.5,76378.7,76554.97],
 "liquidation":[
  {"price":76100,"side":"above","intensity":"high","magnet":False,"note":"OKX realized (fresh, newest fill 22:36 COT Nov 6): about $1.26M of shorts liquidated at 76.1k-76.2k. Already swept; measured, approximate (0.01 BTC contract x fill price)."},
  {"price":75500,"side":"below","intensity":"high","magnet":False,"note":"OKX realized: about $1.09M of longs liquidated at 75.5k-75.7k (the midday flush). Already swept; measured, approximate."},
  {"price":74367,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 50x longs opened near spot liquidate near 74.4k. Not exchange resting-order data."},
  {"price":72850,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near spot liquidate near 72.9k. Not exchange resting-order data."},
  {"price":77403,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 50x shorts opened near spot liquidate near 77.4k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":77403.0,"nearestBelow":74367.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":T,"note":"OKX feed was fresh (newest fill about 27 minutes old), so CoinGlass was not needed. Longs stay crowded (1H ratio 3.03), so the pull stays down. Forward levels are estimates, not a heatmap read."}}
d["atr"]={"value":944.4,"period":14,"pct":1.24,"source":"OKX 4H candles, Wilder ATR14","asOf":T}
S="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9); last bar unconfirmed"
def tf(n,rsi_,m,e,st,b): return {"tf":n,"rsi":rsi_,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":st,"bias":b,"source":S,"asOf":T}
d["timeframes"]=[
 tf("15m",46.36,[7.2,26.4,-19.1],[75952.9,75936.1,76121.2,76667.7],"Price just under EMA20/50 (75.95k/75.94k) in a tight 75.5k-76.2k range; EMA100/200 overhead at 76.1k/76.7k; MACD flat","neutral-weak"),
 tf("1h",42.43,[-201.5,-291.2,89.6],[76006.4,76659.5,77257.5,77888.7],"Price under all EMAs, EMA20 at 76.0k is the cap; RSI 42 recovering from 37; MACD negative with a positive histogram","bearish"),
 tf("4h",38.5,[-678.4,-484.0,-194.4],[76916.3,77828.7,78946.3,80120.4],"Price under all EMAs, 4.2k under the EMA200; MACD histogram still negative","bearish"),
 tf("daily",37.2,[-1464.8,-1082.6,-382.2],[79039.6,79751.9,77765.9,76150.5],"Price 0.3% under the EMA200 (76,150) it keeps testing; EMA20/50 overhead at 79.0k/79.8k; RSI 37; MACD negative; bar unconfirmed","bearish")]
d["operations"]=[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"reduce","entry":None,"stop":74800.0,"tp":[76554.97,76916.3],"rr":None,"confidence":4.5,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"long-term"}]
d["scalpContext"]={"intradayBias":"Range 75.5k-76.2k; 76.0k-76.15k (1H EMA20 and daily EMA200) caps rallies; a 1H close under 74,888 is the risk","longAbove":76554.97,"shortBelow":74888.0,"invalidates":73414.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
d["macro"]={"brent":{"value":98.32,"changePct":0.0},"dxy":{"value":102.279},"us10y":{"value":4.859},
 "etfFlows":{"streakDays":-1,"note":"US spot BTC ETFs (Farside): Nov 2 -$398.6M, Nov 3 -$115.6M, Nov 4 +$74.6M, Nov 5 -$430.2M, Nov 6 -$8.9M (IBIT +$42.8M, FBTC -$20.5M, BITB -$20.1M, MSBT -$11.1M)."},
 "liquidations":{"longsUsd":1180410.0,"shortsUsd":1561735.0,"skew":3.03,"traders":None,"openInterestUsd":2632571047.0,"note":"OKX realized fills, 100 most recent (fresh, about 12:06 COT to 22:36 COT Nov 6): about $1.18M of longs (mostly the 75.5k midday flush) and $1.56M of shorts (mostly $1.26M at 76.1k-76.2k), approximate (0.01 BTC contracts). OKX OI $2.63B, funding +0.0018%, 1H long/short account ratio 3.03 (longs crowded, used as skew). Fear and Greed 25 (Extreme Fear, alternative.me). Brent 98.32 (settle, unchanged vs prior), DXY 102.28 (+0.72%), US10Y 4.859% (CNBC, close Nov 6)."},
 "fearGreed":25,"earnings":[]}
d["nonCrypto"]={"indices":idx,"stockWatchlist":[]}
d["divergences"]=[]
d["calibration"]={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Midday set 74,888 as the reduce level and 76,555 as the add trigger. Price held 75.5k-76.2k all afternoon: no 1H close under 74,888 and no 4H close above 76,555, so neither fired. The 8 USDT midday spot buy at 75,600 is +0.4%.","note":"Midday's range with bearish tilt (25/42/33) held. Shorts were squeezed at 76.1k and the floor survived; the daily EMA200 cap still stands."}
d["sources"]=P["sources"]
json.dump(d,open(R+'2026/11/2026-11-06-endday.json','w'),indent=2,ensure_ascii=False)

m=json.load(open(R+'manifest.json'))
day=[x for x in m['days'] if x['date']=='2026-11-06'][0]
day['sessions']['endday']='data/2026/11/2026-11-06-endday.json'
for k in ['midnight','morning','midday','endday']: day['sessions'].setdefault(k,None)
m['latest']='data/2026/11/2026-11-06-endday.json'; m['updatedAt']=T
json.dump(m,open(R+'manifest.json','w'),indent=2,ensure_ascii=False)

c=json.load(open(R+'calibration.json'))
for r in c:
    if r['date']=='2026-11-06' and r['session']=='midday':
        r.update({'reduce_fired':False,'add_fired':False,'price_next_report':px,'acting_helped':True})
c.append({"date":"2026-11-06","session":"endday","bias":"range-bear","bull_pct":24.0,"range_pct":42.0,"bear_pct":34.0,"reduce_level":74888.0,"reduce_fired":None,"add_level":76554.97,"add_fired":None,"price_at_report":px,"price_next_report":None,"acting_helped":None})
json.dump(c,open(R+'calibration.json','w'),indent=2,ensure_ascii=False)
