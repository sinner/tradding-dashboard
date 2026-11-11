import json,copy
D='public/data/'
r=json.load(open(D+'2026/11/2026-11-06-midnight.json'))
T='2026-11-06T06:55:00-05:00'
r['id']='2026-11-06-morning';r['session']='morning';r['generatedAt']=T
r['overallBias']='range';r['biasTilt']='bearish';r['confidence']=5.0
r['priceSnapshot']={"value":76194.8,"currency":"USD","changePct":-5.19,"source":"OKX BTC-USDT ticker (24h open 80,361.8)","asOf":T,
 "note":"Versus the 02:05 COT midnight report (75,481): +0.9%. BTC bounced from the 75.3k flush low, squeezed shorts at 76.0k-76.3k and is back on the daily EMA200 (76,117).","sessionRange":{"low":75300.6,"high":76298.4}}
r['decisionBox']={"position":"HOLD","reduceIf":{"price":75200.0,"confirmation":"A 1H close under 75,200 (the 24h low) opens 74.0k then 72.5k; stop buying and trim the spot core."},
 "addIf":{"price":76554.97,"confirmation":"A 4H close above 76,555 would hold the daily EMA200 reclaim and aim at the 4H EMA20 (77.6k)."},
 "invalidatesAt":73414.0,"stopOrder":{"recommended":False,"price":74950.0},
 "changed":"The 75,200 floor held and BTC reclaimed the daily EMA200 (76,117) on a short squeeze. The 4H trend is still bearish (price 4.1k under EMA200) and longs stay crowded (ratio 3.0), so the wallet holds its midnight starter and adds nothing into resistance."}
r['probabilities']={"bullish":26.0,"range":42.0,"bearish":32.0}
r['levels']={"support":[75200.0,75000.0,73414.0],"resistance":[76554.97,77011.2,77595.2,77808.4],
 "liquidation":[
 {"price":76150,"side":"below","intensity":"medium","magnet":False,"note":"OKX realized (fresh, newest fill about 05:40 COT Nov 6): about $333k of shorts liquidated at 76.0k-76.3k ($163k at 76.1k, $146k at 76.2k). Already swept; measured, approximate (0.01 BTC contract x fill price)."},
 {"price":74671,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 50x longs opened near spot liquidate near 74.7k. Not exchange resting-order data."},
 {"price":73147,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near spot liquidate near 73.1k. Not exchange resting-order data."},
 {"price":77719,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 50x shorts opened near spot liquidate near 77.7k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":77719.0,"nearestBelow":74671.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":T,
 "note":"OKX feed was fresh (newest fill 71 minutes old), so CoinGlass was not needed. Longs are still crowded (1H ratio 2.99), so the pull stays down. Forward levels are estimates, not a heatmap read."}}
r['atr']={"value":1109.9,"period":14,"pct":1.46,"source":"OKX 4H candles, Wilder ATR14","asOf":T}
src="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9); last bar unconfirmed"
r['timeframes']=[
 {"tf":"15m","rsi":58.96,"macd":{"line":91.4,"signal":63.3,"hist":28.1},"emas":{"ema20":76006.5,"ema50":76093.4,"ema100":76699.1,"ema200":77388.5},"structure":"Price back above EMA20/50 after the squeeze; EMA100 (76.7k) and EMA200 (77.4k) still overhead; MACD positive","bias":"bullish-bounce","source":src,"asOf":T},
 {"tf":"1h","rsi":40.75,"macd":{"line":-647.8,"signal":-786.7,"hist":138.9},"emas":{"ema20":76453.3,"ema50":77403.0,"ema100":77810.2,"ema200":78261.3},"structure":"Price just under EMA20; oversold RSI recovered to 41; MACD histogram turned positive but line is still negative","bias":"bearish-recovering","source":src,"asOf":T},
 {"tf":"4h","rsi":39.85,"macd":{"line":-502.2,"signal":-135.9,"hist":-366.2},"emas":{"ema20":77595.2,"ema50":78262.7,"ema100":79266.6,"ema200":80271.8},"structure":"Price under all EMAs, 4.1k under the EMA200; MACD histogram negative","bias":"bearish","source":src,"asOf":T},
 {"tf":"daily","rsi":38.07,"macd":{"line":-1335.7,"signal":-981.7,"hist":-353.9},"emas":{"ema20":79402.8,"ema50":79922.5,"ema100":77808.4,"ema200":76116.6},"structure":"Price on the EMA200 (76,117) after losing it overnight; EMA20/50 overhead at 79.4k/79.9k; RSI 38; MACD negative; bar unconfirmed","bias":"bearish-testing-EMA200","source":src,"asOf":T}]
r['operations']=[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"hold","entry":None,"stop":74950.0,"tp":[76554.97,77595.2],"rr":None,"confidence":4.5,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}]
r['scalpContext']={"intradayBias":"Range 75.2k-76.6k; the 76.1k-76.6k pocket is the daily EMA200 and resistance; a 1H close under 75.2k is the risk","longAbove":76554.97,"shortBelow":75200.0,"invalidates":73414.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
r['macro']={"brent":{"value":98.72,"changePct":0.44},"dxy":{"value":101.964},"us10y":{"value":4.861},
 "etfFlows":{"streakDays":-1,"note":"US spot BTC ETFs (Farside): Nov 2 -$398.6M, Nov 3 -$115.6M, Nov 4 +$74.6M, Nov 5 -$430.2M. Nov 6 not published yet. Corrects the -$68.8M carried in earlier reports."},
 "liquidations":{"longsUsd":1348.0,"shortsUsd":333465.0,"skew":2.99,"traders":None,"openInterestUsd":2663786729.0,
 "note":"OKX realized fills, 100 most recent (fresh, about 04:28 COT to 05:40 COT Nov 6): about $333k of shorts and almost no longs (approximate, 0.01 BTC contracts). OKX OI $2.66B, funding +0.004%, 1H long/short account ratio 2.99 (longs crowded, used as skew). Fear and Greed 28 (Fear, alternative.me). Brent 98.72 (+0.44%), DXY 101.96 (+0.41%), US10Y 4.861% (CNBC, 06:50 COT)."},
 "fearGreed":28,"earnings":[]}
r['calibration']={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Midnight set 75,200 as the reduce level and bought a 15 USDT starter at 75,481. Price never closed an hour under 75,200 (low 75,301) and bounced to 76,195, so the buy is +0.9% and the reduce level did not fire.","note":"Midnight's range with bearish tilt (24/38/38) held: the floor survived and shorts got squeezed. The 4H trend is still bearish, so the bounce is not yet confirmed."}
r['nonCrypto']['indices']=[dict(i,note="Last close Nov 5 (StockAnalysis, 4:00 PM EST); US market closed overnight, no new session yet. Carried from last close.") for i in r['nonCrypto']['indices']]
r['sources']=[{"title":"OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},
 {"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/history/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/history/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/history/"},
 {"title":"Farside Investors — Bitcoin ETF Flow","url":"https://farside.co.uk/btc/"},{"title":"alternative.me Fear and Greed Index","url":"https://alternative.me/crypto/fear-and-greed-index/"},
 {"title":"CNBC quotes (Brent, DXY, US10Y)","url":"https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol"}]
json.dump(r,open(D+'2026/11/2026-11-06-morning.json','w'),indent=2)
# manifest
m=json.load(open(D+'manifest.json'))
day=[d for d in m['days'] if d['date']=='2026-11-06'][0]
day['sessions']['morning']='data/2026/11/2026-11-06-morning.json'
for k in('midnight','morning','midday','endday'):day['sessions'].setdefault(k,None)
m['latest']='data/2026/11/2026-11-06-morning.json';m['updatedAt']=T
json.dump(m,open(D+'manifest.json','w'),indent=2)
# calibration
c=json.load(open(D+'calibration.json'))
rows=c if isinstance(c,list) else c.get('rows',c)
for x in rows:
  if x['date']=='2026-11-06' and x['session']=='midnight':
    x['price_next_report']=76194.8;x['reduce_fired']=False;x['add_fired']=False;x['acting_helped']=True
rows.append({"date":"2026-11-06","session":"morning","bias":"range-bear","bull_pct":26.0,"range_pct":42.0,"bear_pct":32.0,"reduce_level":75200.0,"reduce_fired":None,"add_level":76554.97,"add_fired":None,"price_at_report":76194.8,"price_next_report":None,"acting_helped":None})
json.dump(c,open(D+'calibration.json','w'),indent=2)
