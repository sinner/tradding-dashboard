import json,copy,os
R='public/data/'
T='2026-11-09T09:15:00-05:00'
r=json.load(open(R+'2026/11/2026-11-06-endday.json'))
r['id']='2026-11-09-morning';r['date']='2026-11-09';r['session']='morning';r['generatedAt']=T
r.pop('overnightRisk',None)
r['overallBias']='range';r['biasTilt']='bearish';r['confidence']=5.0
r['priceSnapshot']={"value":74539.1,"currency":"USD","changePct":-1.9,"source":"OKX BTC-USDT ticker (24h open 75,985.5; 24h range 73,500-76,100)","asOf":T,"note":"Versus the Friday 23:08 COT end-day report (75,885.1): -1.8%. BTC lost the 75.5k floor Sunday evening, wicked to 73,500 and bounced to 74.5k; it is now under the daily EMA200 (76,857).","sessionRange":{"low":73500.0,"high":76251.1}}
r['decisionBox']={"position":"ADD","reduceIf":{"price":73500.0,"confirmation":"A 1H close under 73,500 (the weekend wick low) opens 72.9k then 71.6k; stop buying and trim the core."},"addIf":{"price":75609.3,"confirmation":"A 4H close above 75,609 (4H EMA20) with the 1H EMA50 (75.3k) reclaimed allows a bigger add toward 76.1k."},"invalidatesAt":72850.0,"stopOrder":{"recommended":True,"price":73400.0},"changed":"The Friday reduce level (74,888) fired over the weekend and the wick to 73,500 swept the 74.4k pocket. The wallet rebuys a small 15 USDT spot tranche at 74.5k after the flush, still a bearish-tilt range."}
r['probabilities']={"bullish":22.0,"range":40.0,"bearish":38.0}
r['levels']={"support":[74100.0,73751.0,73500.0,72850.0],"resistance":[74786.3,75102.9,75609.3,76100.0,76856.6],
"liquidation":[
{"price":74950,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized (fresh, newest fill 09:13 COT): about $460k of shorts liquidated at 74.9k-75.1k this morning. Already swept; measured, approximate (0.01 BTC contract x fill price)."},
{"price":74500,"side":"below","intensity":"low","magnet":False,"note":"OKX realized: about $77k of longs liquidated at 74.5k-74.6k. Already swept; measured, approximate."},
{"price":73050,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 50x longs opened near spot liquidate near 73.0k. Not exchange resting-order data."},
{"price":71560,"side":"below","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near spot liquidate near 71.6k. Not exchange resting-order data."},
{"price":76030,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 50x shorts opened near spot liquidate near 76.0k. Not exchange resting-order data."}],
"liquidityMagnet":{"nearestAbove":76030.0,"nearestBelow":73050.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":T,"note":"OKX feed was fresh (newest fill under 1 minute old, 100 fills since 07:30 COT), so CoinGlass was not needed. Longs stay crowded (1H ratio 2.89), so the pull stays down. Forward levels are estimates, not a heatmap read."}}
r['atr']={"value":844.4,"period":14,"pct":1.13,"source":"OKX 4H candles, Wilder ATR14","asOf":T}
src="OKX BTC-USDT candles (300+ bars), computed (EMA/RSI Wilder/MACD 12-26-9); last bar unconfirmed"
def tf(n,rsi,m,e,st,b): return {"tf":n,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":st,"bias":b,"source":src,"asOf":T}
r['timeframes']=[
tf('15m',49.88,[70.3,41.0,29.3],[74555.9,74635.8,74929.8,75371.6],"Price on the EMA20 (74.56k) after the Sunday flush; EMA50/100/200 overhead at 74.6k/74.9k/75.4k; MACD turning up","neutral"),
tf('1h',44.28,[-289.3,-328.1,38.8],[74786.3,75300.7,75931.6,76805.5],"Price under all EMAs; EMA20 at 74.8k is the first cap; MACD negative with a positive histogram; RSI 44","bearish"),
tf('4h',34.69,[-726.0,-630.3,-95.7],[75609.3,76758.2,78075.9,79548.1],"Price under all EMAs, 5.0k under the EMA200; RSI 34.7 oversold-leaning; MACD histogram negative","bearish"),
tf('daily',34.33,[-1663.3,-1270.3,-393.0],[78345.7,79404.3,77681.6,76856.6],"Price 3.0% under the EMA200 (76,857), which flipped from support to cap; RSI 34; MACD negative; bar unconfirmed","bearish")]
r['operations']=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":73400.0,"tp":[75609.3,76856.6],"rr":None,"confidence":4.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"long-term"}]
r['scalpContext']={"intradayBias":"Range 73.5k-75.1k with a bearish tilt; 74.8k-74.9k (1H EMA20, 15m EMA100) caps bounces; a 1H close under 73,500 is the risk","longAbove":74930.0,"shortBelow":74100.0,"invalidates":73500.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
m=r['macro']
m['brent']={"value":98.32,"changePct":0.0};m['dxy']={"value":102.279};m['us10y']={"value":4.859}
m['etfFlows']={"streakDays":-2,"note":"US spot BTC ETFs (Farside): Nov 2 -$398.6M, Nov 3 -$115.6M, Nov 4 +$74.6M, Nov 5 -$430.2M, Nov 6 -$411.9M (revised from the early -$8.9M print; IBIT +$42.8M, FBTC -$20.5M, BITB -$20.1M, MSBT -$11.1M). Nov 9 not yet reported. Brent, DXY and US10Y are Friday Nov 6 closes carried (weekend, markets closed)."}
m['liquidations']={"longsUsd":76819.0,"shortsUsd":460634.0,"skew":2.89,"traders":None,"openInterestUsd":2642954888.0,"note":"OKX realized fills, 100 most recent (fresh, 07:30 COT to 09:13 COT Nov 9): about $77k of longs and $461k of shorts (mostly 74.9k-75.0k), approximate (0.01 BTC contracts). OKX OI $2.64B, funding +0.0055%, 1H long/short account ratio 2.89 (longs crowded, used as skew). Fear and Greed 29 (Fear, alternative.me)."}
m['fearGreed']=29
for i in r['nonCrypto']['indices']:
    i['note']="Friday Nov 6 official close carried (StockAnalysis); market closed for the weekend and US cash has not opened yet at report time. dcaSignal carried from last close."
r['calibration']={"priorReduceFired":True,"actingHelped":True,"rollingRecord":"Friday's end-day set 74,888 as the reduce level and 76,555 as the add trigger. The reduce level fired: 1H and 4H closes came in under 74,888 and BTC wicked to 73,500 Sunday evening. The add trigger never fired. The 20% spot trim at 75,885 is now +1.8% in the wallet's favour.","note":"Friday's range with bearish tilt (24/42/34) played out to the downside; the 73.5k wick was just above the 73,414 invalidation. The weekend had no sessions, so this is the first read since."}
r['sources']=[{"title":"OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"Bitcoin ETF Flow — Farside Investors","url":"https://farside.co.uk/btc/"},{"title":"Fear and Greed Index — alternative.me","url":"https://alternative.me/crypto/fear-and-greed-index/"}]+[s for s in r['sources'] if 'stockanalysis' in s['url']]
os.makedirs(R+'2026/11',exist_ok=True)
json.dump(r,open(R+'2026/11/2026-11-09-morning.json','w'),indent=2)
# manifest
mf=json.load(open(R+'manifest.json'))
mf['days']=[d for d in mf['days'] if d['date']!='2026-11-09']
mf['days'].insert(0,{"date":"2026-11-09","sessions":{"midnight":None,"morning":"data/2026/11/2026-11-09-morning.json","midday":None,"endday":None}})
mf['latest']='data/2026/11/2026-11-09-morning.json';mf['updatedAt']=T
json.dump(mf,open(R+'manifest.json','w'),indent=2)
c=json.load(open(R+'calibration.json'))
rows=c if isinstance(c,list) else c.get('rows',c)
row={"date":"2026-11-09","session":"morning","bias":"range-bear","bull_pct":22.0,"range_pct":40.0,"bear_pct":38.0,"reduce_level":73500.0,"reduce_fired":None,"add_level":75609.3,"add_fired":None,"price_at_report":74539.1,"price_next_report":None,"acting_helped":None}
rows.append(row)
json.dump(c,open(R+'calibration.json','w'),indent=2)
