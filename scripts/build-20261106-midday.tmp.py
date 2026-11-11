import json
D='public/data/'
r=json.load(open(D+'2026/11/2026-11-06-morning.json'))
T='2026-11-06T12:50:00-05:00'
r['id']='2026-11-06-midday';r['session']='midday';r['generatedAt']=T
r['overallBias']='range';r['biasTilt']='bearish';r['confidence']=5.0
r['priceSnapshot']={"value":75600.8,"currency":"USD","changePct":-0.34,"source":"OKX BTC-USDT ticker (24h open 75,856.5)","asOf":T,
 "note":"Versus the 06:55 COT morning report (76,195): -0.8%. BTC lost the daily EMA200 again, wicked to 74,888 at the 24h low and bounced back to 75.6k.",
 "sessionRange":{"low":74887.9,"high":76378.7}}
r['decisionBox']={"position":"ADD","reduceIf":{"price":74888.0,"confirmation":"A 1H close under 74,888 (the wick low) opens 74.1k then 72.6k; stop buying and trim the spot core."},
 "addIf":{"price":76554.97,"confirmation":"A 4H close above 76,555 would reclaim the daily EMA200 and aim at the 4H EMA20 (77.3k)."},
 "invalidatesAt":73414.0,"stopOrder":{"recommended":False,"price":74800.0},
 "changed":"The 74,888 wick flushed about $1.0M of longs at 75.5k and was bought back, with no 1H close under 75,200 all session. The 4H trend is still bearish and the daily EMA200 (76,148) is overhead, so the wallet adds only a small 8 USDT spot tranche near support."}
r['probabilities']={"bullish":25.0,"range":42.0,"bearish":33.0}
r['levels']={"support":[75200.0,74888.0,74089.0,73414.0],"resistance":[75927.4,76379.0,76554.97,77252.2],
 "liquidation":[
 {"price":75500,"side":"below","intensity":"high","magnet":False,"note":"OKX realized (fresh, newest fill about 12:38 COT Nov 6): about $1.03M of longs liquidated at 75.5k-75.7k ($980k at 75.5k). Already swept; measured, approximate (0.01 BTC contract x fill price)."},
 {"price":76000,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized (fresh): about $665k of shorts liquidated at 75.9k-76.1k ($470k at 76.1k). Already swept; measured, approximate."},
 {"price":74089,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 50x longs opened near spot liquidate near 74.1k. Not exchange resting-order data."},
 {"price":72577,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near spot liquidate near 72.6k. Not exchange resting-order data."},
 {"price":77113,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 50x shorts opened near spot liquidate near 77.1k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":77113.0,"nearestBelow":74089.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":T,
 "note":"OKX feed was fresh (newest fill about 3 minutes old), so CoinGlass was not needed. Longs stay crowded (1H ratio 3.03), so the pull stays down. Forward levels are estimates, not a heatmap read."}}
r['atr']={"value":1109.3,"period":14,"pct":1.47,"source":"OKX 4H candles, Wilder ATR14","asOf":T}
src="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9); last bar unconfirmed"
r['timeframes']=[
 {"tf":"15m","rsi":44.52,"macd":{"line":-42.6,"signal":-47.7,"hist":5.1},"emas":{"ema20":75814.8,"ema50":75927.4,"ema100":76379.6,"ema200":77095.9},"structure":"Price under EMA20/50 after the wick to 74.9k and bounce; EMA100/200 at 76.4k/77.1k overhead; MACD flat near zero","bias":"neutral-weak","source":src,"asOf":T},
 {"tf":"1h","rsi":36.87,"macd":{"line":-486.5,"signal":-597.2,"hist":110.6},"emas":{"ema20":76162.7,"ema50":77064.3,"ema100":77584.0,"ema200":78100.6},"structure":"Price under all EMAs; RSI 37 near oversold; MACD line negative with a positive histogram","bias":"bearish","source":src,"asOf":T},
 {"tf":"4h","rsi":36.8,"macd":{"line":-648.6,"signal":-309.7,"hist":-338.9},"emas":{"ema20":77252.2,"ema50":78066.1,"ema100":79126.1,"ema200":80163.6},"structure":"Price under all EMAs, 4.6k under the EMA200; MACD histogram negative","bias":"bearish","source":src,"asOf":T},
 {"tf":"daily","rsi":36.47,"macd":{"line":-1487.9,"signal":-1087.2,"hist":-400.7},"emas":{"ema20":79012.0,"ema50":79740.5,"ema100":77760.1,"ema200":76147.6},"structure":"Price 0.7% under the EMA200 (76,148) after losing it again; EMA20/50 overhead at 79.0k/79.7k; RSI 36; MACD negative; bar unconfirmed","bias":"bearish","source":src,"asOf":T}]
r['operations']=[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"add","entry":None,"stop":74800.0,"tp":[76554.97,77252.2],"rr":None,"confidence":4.0,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"long-term"}]
r['scalpContext']={"intradayBias":"Range 74.9k-76.4k; the 75.9k-76.2k pocket is 15m EMA50 and 1H EMA20 resistance; a 1H close under 74.9k is the risk","longAbove":76554.97,"shortBelow":74888.0,"invalidates":73414.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
r['macro']={"brent":{"value":97.58,"changePct":-0.72},"dxy":{"value":102.185},"us10y":{"value":4.841},
 "etfFlows":{"streakDays":-1,"note":"US spot BTC ETFs (Farside): Nov 2 -$398.6M, Nov 3 -$115.6M, Nov 4 +$74.6M, Nov 5 -$430.2M. Nov 6 not published yet."},
 "liquidations":{"longsUsd":1026512.0,"shortsUsd":664481.0,"skew":3.03,"traders":None,"openInterestUsd":2652526613.0,
 "note":"OKX realized fills, 100 most recent (fresh, about 11:31 COT to 12:38 COT Nov 6): about $1.03M of longs at 75.5k-75.7k and $665k of shorts at 75.9k-76.1k (approximate, 0.01 BTC contracts). OKX OI $2.65B, funding +0.005%, 1H long/short account ratio 3.03 (longs crowded, used as skew). Fear and Greed 28 (Fear, alternative.me). Brent 97.58 (-0.72%), DXY 102.19 (+0.63%), US10Y 4.841% (CNBC, 12:41 COT)."},
 "fearGreed":28,"earnings":[]}
r['calibration']={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Morning held with 75,200 as the reduce level and 76,555 as the add trigger. Price wicked to 74,888 but never closed an hour under 75,200 and never closed a 4H above 76,555, so neither fired. Holding beat chasing the squeeze: BTC is -0.8% since the report.","note":"Morning's range with bearish tilt (26/42/32) held. The daily EMA200 reclaim failed and longs were flushed at 75.5k, but the floor survived."}
def idx(t,price,chg,bias,note,sig,url):
  return {"ticker":t,"price":price,"changePct":chg,"bias":bias,"note":note,"dcaSignal":sig,"source":{"title":t+" — StockAnalysis","url":url}}
n1="StockAnalysis daily history, intraday bar about 12:40 COT (US session open, bar unconfirmed). Zone computed from the last 21 closes including this bar."
def sig(p,v,h,rsi,z,note="Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."):
  return {"percentileInMonth":p,"pctVs20dAvg":v,"pctFromHigh":h,"rsi14":rsi,"zone":z,"note":note}
r['nonCrypto']['indices']=[
 idx("QQQ",656.45,1.45,"Nasdaq 100 is bouncing +1.5% intraday after the -6.5% drop on Nov 5, still 12.6% under its 21-day high.",n1,sig(9,-7.24,-12.62,26.8,"very-cheap"),"https://stockanalysis.com/etf/qqq/"),
 idx("VOO",677.69,0.55,"S&P 500 is up 0.6% intraday after the -4.4% drop on Nov 5, still near the 21-day low.",n1,sig(9,-3.44,-5.3,33.9,"very-cheap"),"https://stockanalysis.com/etf/voo/"),
 idx("JPXN",96.46,-5.14,"Japan large caps sit at the 21-day low after following the global risk-off.","Last close Nov 5 (StockAnalysis); no Nov 6 print yet. Carried from last close.",sig(0,-5.55,-7.65,23.4,"very-cheap","Carried from last close — relative-cheapness for monthly DCA, not a bottom call."),"https://stockanalysis.com/etf/jpxn/")]
json.dump(r,open(D+'2026/11/2026-11-06-midday.json','w'),indent=2)
m=json.load(open(D+'manifest.json'))
day=[d for d in m['days'] if d['date']=='2026-11-06'][0]
day['sessions']['midday']='data/2026/11/2026-11-06-midday.json'
for k in('midnight','morning','midday','endday'):day['sessions'].setdefault(k,None)
m['latest']='data/2026/11/2026-11-06-midday.json';m['updatedAt']=T
json.dump(m,open(D+'manifest.json','w'),indent=2)
c=json.load(open(D+'calibration.json'))
rows=c if isinstance(c,list) else c.get('rows',c)
for x in rows:
  if x['date']=='2026-11-06' and x['session']=='morning':
    x['price_next_report']=75600.8;x['reduce_fired']=False;x['add_fired']=False;x['acting_helped']=True
rows.append({"date":"2026-11-06","session":"midday","bias":"range-bear","bull_pct":25.0,"range_pct":42.0,"bear_pct":33.0,"reduce_level":74888.0,"reduce_fired":None,"add_level":76554.97,"add_fired":None,"price_at_report":75600.8,"price_next_report":None,"acting_helped":None})
json.dump(c,open(D+'calibration.json','w'),indent=2)
intent={"session":"midday","reportId":"2026-11-06-midday","ts":T,"today":"2026-11-06","markPrice":75600.8,"sessionHigh":76378.7,"sessionLow":74887.9,"isSeeder":False,
 "rationale":"BTC wicked to 74,888, flushed about $1.0M of longs at 75.5k and bounced to 75.6k with no 1H close under 75,200. The 4H trend is still bearish and longs are crowded (ratio 3.0), so the add is a small 8 USDT spot tranche near support, keeping 24 USDT of cash for a deeper test of 74.1k.",
 "message":{"to":"endday","text":"Bought 8 USDT of spot at 75.6k near the 75.2k floor. A 1H close under 74,888 means stop buying and consider trimming; a 4H close above 76,555 reclaims the daily EMA200."},
 "lesson":{"pattern":"Wick below support that closes back above it","insight":"The 74,888 wick was bought back within the hour and no 1H close printed under 75,200. Small tranches near the floor beat chasing the squeeze into resistance."},
 "decision":{"type":"spot_buy","usd":8}}
json.dump(intent,open('scripts/intent-20261106-midday.tmp.json','w'),indent=2)
