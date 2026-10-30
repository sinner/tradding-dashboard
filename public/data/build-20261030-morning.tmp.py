import json,copy
P='2026-10-30'; ID=P+'-morning'; TS='2026-10-30T06:58:00-05:00'
mid=json.load(open('2026/10/2026-10-30-midnight.json'))
r=copy.deepcopy(mid)
r['id']=ID; r['session']='morning'; r['generatedAt']=TS
r['overallBias']='range'; r['biasTilt']='bearish'; r['confidence']=5.4
r['priceSnapshot']={"value":77334.1,"currency":"USD","changePct":-3.54,"source":"OKX BTC-USDT ticker (in-page fetch, ts fresh)","asOf":TS,"note":"24h open 80,170.8; 24h range 76,519-81,970.4. BTC gave back the whole midnight bounce (78,551), slid 1.5% to 77,334 and sits 1.7% above the daily EMA200 (76,032).","sessionRange":{"low":77294.6,"high":78576.7}}
r['decisionBox']={"position":"ADD","reduceIf":{"price":76032.0,"confirmation":"A 1H close under the daily EMA200 (76,032); the 76,519 flush low is the first warning and 75,400 the next air pocket."},"addIf":{"price":79350.0,"confirmation":"A 1H close above 79,350 (the broken floor) after a reclaim of the 1H EMA20 (78,525) and EMA50 (79,416); 79,795 (4H EMA20) is the next gate."},"invalidatesAt":79795.1,"stopOrder":{"recommended":True,"price":75900.0},"changed":"Midnight's range call held but the bounce failed: 78,577 was the high and price rolled back to 77,334. Bias stays range with a bearish tilt. The reduce line (76,044) did not fire. The wallet adds a second small 15 USDT spot DCA tranche, nothing leveraged."}
r['probabilities']={"bullish":22.0,"range":40.0,"bearish":38.0}
r['levels']={"support":[77294.6,76519.0,76032.4,75400.0],"resistance":[77790.0,78525.4,78576.7,79350.0,79795.1],
"liquidation":[{"price":77300,"side":"below","intensity":"medium","magnet":False,"note":"OKX realized (fresh, 10:16-11:56 UTC): about $475k of longs liquidated at 77.3-77.4k ($363k at 77.3k), a long flush just now. Measured, approximate (0.01 BTC contract x fill price). Largely spent."},
{"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 25x longs opened near 78.5k liquidate near 75.4k. Not exchange resting-order data."},
{"price":80100,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 77k liquidate near 80.1k, next to the 4H EMA20 (79,795). Not exchange resting-order data."}],
"liquidityMagnet":{"nearestAbove":80100.0,"nearestBelow":75400.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page fetch; leverage-bracket estimates","asOf":TS,"note":"OKX account ratio 2.47 means longs are still crowded and are getting flushed, so the pull stays down. Forward levels are estimates, not a heatmap read; the CoinGlass fallback was not needed because the OKX feed was fresh."}}
r['atr']={"value":1077.9,"period":14,"pct":1.39,"source":"OKX 4H candles, Wilder ATR14","asOf":TS}
src="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9)"
def tf(t,rsi,m,e,s,b): return {"tf":t,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":s,"bias":b,"source":src,"asOf":TS}
r['timeframes']=[
tf("15m",36.4,[-197.0,-167.0,-30.0],[77790.0,78177.1,78778.5,79418.0],"Price under every EMA with MACD negative: the bounce failed and sellers hold the 15m","bearish"),
tf("1h",34.5,[-667.4,-633.3,-34.1],[78525.4,79415.8,79962.2,80500.5],"Under every EMA, RSI 34.5 near oversold; MACD histogram widening again","bearish"),
tf("4h",33.2,[-638.8,-298.8,-340.0],[79795.1,80549.6,81260.1,81615.6],"Under the whole stack; RSI 33, MACD line far under signal and zero","bearish"),
tf("daily",36.3,[-690.8,-326.5,-364.3],[81282.0,80669.4,77836.6,76032.4],"Under EMA20, EMA50 and EMA100; price 1.7% above the EMA200 (76,032); MACD negative and widening","bearish")]
r['operations']=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":75900.0,"tp":[79350.0,80500.0],"rr":None,"confidence":5.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.5,"hold":"long-term"}]
r['scalpContext']={"intradayBias":"Range 76.5k-78.5k with a downward lean: 78,525 (1H EMA20) caps rallies, the 76,519 flush low is the floor","longAbove":78525.0,"shortBelow":77290.0,"invalidates":79795.1,"note":"Scalp only the edges — live signals come from the chart, not this report."}
m=r['macro']
m['brent']={"value":117.97,"changePct":2.69}; m['dxy']={"value":101.648}; m['us10y']={"value":4.904}
m['etfFlows']={"streakDays":4,"note":"US spot BTC ETFs: month to date +$128.3M (tftc.io, updated Oct 29). The month-to-date total rose from +111.2M to +128.3M, so Oct 29 was about +$17M (derived); inflows Oct 26-29."}
m['liquidations']={"longsUsd":474923,"shortsUsd":81525,"skew":2.47,"traders":None,"openInterestUsd":2569662536.0,"note":"OKX realized fills, 100 most recent (fresh, 10:16-11:56 UTC): about $475k of longs vs $82k of shorts liquidated around 77.3k (approximate, 0.01 BTC contracts). OKX OI $2.57B, funding +0.010%, 1H long/short account ratio 2.47 (longs crowded, used as skew). Fear and Greed 30 (Fear, alternative.me, Oct 30 print)."}
m['fearGreed']=30
for i in r['nonCrypto']['indices']:
    i['note']=i['note'].replace('Oct 30 US session has not opened yet.','Oct 30 US session has not opened yet (pre-market); last verified close reused.')
r['calibration']={"priorReduceFired":False,"actingHelped":False,"rollingRecord":"Midnight range-bear: reduce 76,044 not fired, add 79,350 not fired; price drifted 78,551 to 77,334.","note":"The range call held (floor 76,519 intact) but the bearish tilt was right on direction."}
r['sources']=[s for s in r['sources'] if 'CoinGlass' not in s['title']]+[{"title":"CoinGlass heatmap not used: OKX feed was fresh; forward magnets are labelled estimates","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"}]
for s in r['sources']:
    if 'tftc' in s['url']: s['title']='Bitcoin ETF flows — tftc.io'
json.dump(r,open('2026/10/%s.json'%ID,'w'),indent=2)
# manifest
mf=json.load(open('manifest.json'))
for d in mf['days']:
    if d['date']==P: d['sessions']['morning']='data/2026/10/%s.json'%ID
mf['latest']='data/2026/10/%s.json'%ID; mf['updatedAt']=TS
json.dump(mf,open('manifest.json','w'),indent=2)
# calibration
c=json.load(open('calibration.json'))
for x in c:
    if x['date']==P and x['session']=='midnight':
        x['reduce_fired']=False; x['add_fired']=False; x['price_next_report']=77334.1; x['acting_helped']=False
c.append({"date":P,"session":"morning","bias":"range-bear","bull_pct":22.0,"range_pct":40.0,"bear_pct":38.0,"reduce_level":76032.0,"reduce_fired":None,"add_level":79350.0,"add_fired":None,"price_at_report":77334.1,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
json.dump({"session":"morning","reportId":ID,"ts":TS,"today":P,"markPrice":77334.1,"sessionHigh":78576.7,"sessionLow":77294.6,"isSeeder":False,
"rationale":"The midnight bounce failed at 78,577 and BTC rolled back to 77,334, 1.7% above the daily EMA200 (76,032). Every timeframe is under its EMAs, so no futures. A second 15 USDT spot DCA tranche lowers the 81,049 average entry; cash stays at 35.8, above the 30 USDT cost of living due Nov 1.",
"message":{"to":"midday","text":"Spot got a second 15 USDT DCA near 77.3k. Futures flat. Cash 35.8, keep 30 for Nov 1. Reduce on a 1H close under 76,032; add more only on a 1H close above 79,350."},
"lesson":{"pattern":"Relief bounce into a falling 1H EMA20","insight":"The 78,577 high stalled under the 1H EMA20 and fully reversed within hours. Do not chase bounces below the 1H EMA20; DCA small near support instead."},
"decision":{"type":"spot_buy","usd":15}},open('intent-20261030-morning.tmp.json','w'),indent=1)
