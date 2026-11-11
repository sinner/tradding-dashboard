import json,copy,re
D='public/data/'
r=json.load(open(D+'2026/11/2026-11-10-midnight.json'))
T='2026-11-10T06:55:00-05:00'
r['id']='2026-11-10-morning';r['session']='morning';r['generatedAt']=T
r['overallBias']='range';r['biasTilt']='bearish';r['confidence']=5.0
r['priceSnapshot'].update(value=74435.0,changePct=-0.11,source='OKX BTC-USDT ticker (24h open 74,520.2; 24h range 74,116.1-75,570.6)',asOf=T,
 note='Versus the midnight report (74,764.5): -0.44%. BTC dipped to 74,116 in the Asia-morning hours and stays under the 4H EMA20 (75,342) and every daily EMA.',
 sessionRange={'low':74116.1,'high':74996.0})
d=r['decisionBox']
d.update(position='HOLD')
d['reduceIf']={'price':73500.0,'confirmation':'A 1H close under 73,500 (the weekend wick low) opens 72.85k then 72.0k; trim the core.'}
d['addIf']={'price':75342.0,'confirmation':'A 4H close above 75,342 (4H EMA20) with the 1H EMA50 (75.0k) reclaimed allows a larger add toward 76.2k.'}
d['invalidatesAt']=72850.0;d['stopOrder']={'recommended':True,'price':73400.0}
d['changed']='Neither the 73,500 reduce level nor the 75,430 add trigger fired (range 74,116-74,996). Another small long flush hit 74.1k-74.2k. The wallet holds its fresh 15 USDT tranche and about 6 USDT of cash.'
r['probabilities']={'bullish':20.0,'range':42.0,'bearish':38.0}
r['levels']['support']=[74116.1,73751.0,73500.0,72850.0]
r['levels']['resistance']=[74996.0,75342.0,75570.6,76200.0]
r['levels']['liquidation']=[
 {'price':75924,'side':'above','intensity':'medium','magnet':False,'note':'Estimated leverage-bracket magnet (50x short bracket: spot x 1.02) - not exchange resting-order data.'},
 {'price':74150,'side':'below','intensity':'medium','magnet':False,'note':'OKX realized fills (fresh, 100 latest, 04:01-06:32 COT): about $302k of longs liquidated at 74.1k-74.3k vs $223 of shorts; the flush is done, so it marks a reaction zone, not a resting magnet.'},
 {'price':72946,'side':'below','intensity':'medium','magnet':True,'note':'Estimated leverage-bracket magnet (50x long bracket: spot x 0.98) under the 73.5k weekend wick low; the closest downside pull - not exchange resting-order data.'},
 {'price':71458,'side':'below','intensity':'medium','magnet':False,'note':'Estimated leverage-bracket magnet (25x long bracket: spot x 0.96) - not exchange resting-order data.'}]
r['levels']['liquidityMagnet'].update(nearestAbove=75924.0,nearestBelow=72946.0,pull='down',asOf=T,
 note='Realized OKX fills in the latest window were about $302k longs vs $223 shorts, so longs were flushed on the dip. Levels above/below are leverage-bracket estimates, not measured resting orders.')
r['atr'].update(value=857.4,pct=1.15,asOf=T)
tf={'15m':(46.09,[-117.06,-117.88,0.82],[74480.26,74645.56,74769.18,74999.07],'Price (74.44k) under EMA50/100/200 (74.65k-75.0k), just under EMA20 (74.48k); MACD histogram flat just above signal','neutral'),
 '1h':(43.09,[-138.28,-89.49,-48.8],[74744.89,75028.32,75561.66,76454.85],'Price under every EMA (20 at 74.74k, 200 at 76.45k); MACD below signal and below zero, histogram widening','bearish'),
 '4h':(39.75,[-584.29,-596.77,12.48],[75341.91,76435.38,77799.56,79650.03],'Price under all EMAs in stacked bearish order; EMA20 at 75.34k is the cap; MACD histogram marginally positive','bearish'),
 'daily':(33.91,[-1703.0,-1344.22,-358.77],[78058.11,79246.6,77634.13,76374.59],'Price under the 20/50/100 and the EMA200 (76.37k); RSI 34 near oversold; MACD negative and widening','bearish')}
for x in r['timeframes']:
    rsi,m,e,s,b=tf[x['tf']]
    x.update(rsi=rsi,macd=dict(line=m[0],signal=m[1],hist=m[2]),emas=dict(ema20=e[0],ema50=e[1],ema100=e[2],ema200=e[3]),structure=s,bias=b,asOf=T,
     source='OKX BTC-USDT candles (300 bars) via in-page browser fetch, computed (EMA, Wilder RSI14, MACD 12-26-9); last bar unconfirmed')
ops=r['operations']
ops[1].update(action='hold',stop=73400.0,tp=[75342.0,76200.0]);ops[2].update(action='HOLD',stop=None)
r['scalpContext'].update(intradayBias='Range 74.1k-75.3k with a bearish tilt; the 4H EMA20 (75.34k) caps bounces; a 1H close under 73,500 is the risk',longAbove=75000.0,shortBelow=74100.0,invalidates=73500.0)
l=r['macro']['liquidations']
l.update(longsUsd=301853.0,shortsUsd=223.0,skew=2.97,openInterestUsd=2653748463.0,
 note='OKX realized fills, 100 most recent (fresh, 04:01-06:32 COT), approximate (0.01 BTC contracts): longs flushed at 74.1k-74.3k. OKX OI $2.65B, funding +0.005% (longs pay), 1H long/short account ratio 2.97 (longs crowded, used as skew). Fear and Greed 32 (Fear, alternative.me). CoinGlass heatmap not opened: the OKX feed was fresh.')
r['macro']['fearGreed']=32
r['macro']['etfFlows']['note']='US spot BTC ETFs (Farside, US$m): Nov 5 -430.2, Nov 6 -411.9, Nov 9 -201.0. Three straight outflow days; Nov 10 not yet posted. Brent, DXY and US10Y were not verifiable this run (null).'
for i in r['nonCrypto']['indices']:
    i['note']='Nov 9 close (StockAnalysis); US market not yet open on Nov 10, no new session before this report.'
r['calibration']={'priorReduceFired':False,'actingHelped':True,'rollingRecord':'The midnight report set 73,500 as the reduce level and 75,430 as the add trigger. Neither fired: the low since is 74,116 and the high 74,996. The 15 USDT starter tranche is about -0.4% from entry; no change needed.','note':'Range with bearish tilt (20/42/38) is intact. Compared against today\'s midnight report.'}
json.dump(r,open(D+'2026/11/2026-11-10-morning.json','w'),indent=2)
# manifest
m=json.load(open(D+'manifest.json'))
day=[x for x in m['days'] if x['date']=='2026-11-10'][0]
for k in('midnight','morning','midday','endday'):day['sessions'].setdefault(k,None)
day['sessions']['morning']='data/2026/11/2026-11-10-morning.json'
m['latest']='data/2026/11/2026-11-10-morning.json';m['updatedAt']=T
json.dump(m,open(D+'manifest.json','w'),indent=2)
# calibration
c=json.load(open(D+'calibration.json'))
for row in c:
    if row['date']=='2026-11-10' and row['session']=='midnight' and row['price_next_report'] is None:
        row['price_next_report']=74435.0
c.append({'date':'2026-11-10','session':'morning','bias':'range-bear','bull_pct':20.0,'range_pct':42.0,'bear_pct':38.0,'reduce_level':73500.0,'reduce_fired':None,'add_level':75342.0,'add_fired':None,'price_at_report':74435.0,'price_next_report':None,'acting_helped':None})
json.dump(c,open(D+'calibration.json','w'),indent=2)
json.dump({"session":"morning","reportId":"2026-11-10-morning","ts":T,"today":"2026-11-10","markPrice":74435.0,"sessionHigh":74996.0,"sessionLow":74116.1,"isSeeder":False,
 "rationale":"The wallet already deployed a 15 USDT spot tranche at midnight and holds about 6 USDT of cash as a buffer. Price sits mid-range under the 4H EMA20 with crowded longs (2.97), so there is no leverage edge and no reason to add before a 4H reclaim of 75.34k. Hold the book and mark it.",
 "message":{"to":"midday","text":"Reduce under 73,500 (1H close); add only on a 4H close above 75,342. About 6 USDT cash left."},
 "decision":{"type":"hold"}},open('intent-20261110-morning.tmp.json','w'),indent=2)
