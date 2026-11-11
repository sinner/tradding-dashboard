import json,os,copy
R='public/data'; TZ='-05:00'; NOW='2026-11-04T02:10:00'+TZ; D='2026-11-04'; ID=D+'-midnight'
px=77923.6
prev=json.load(open(f'{R}/2026/11/2026-11-03-endday.json'))
idx=copy.deepcopy(prev['nonCrypto']['indices'])
for i in idx:
    i['note']="Nov 3 final close (StockAnalysis daily history, carried); US cash session for Nov 4 not open yet. dcaSignal carried from last close."
tf=lambda n,r,m,e,s,b:{"tf":n,"rsi":r,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":s,"bias":b,"source":"OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9)","asOf":NOW}
rep={
"schemaVersion":"1.0.0","id":ID,"date":D,"session":"midnight","generatedAt":NOW,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":4.9,
"priceSnapshot":{"value":px,"currency":"USD","changePct":1.85,"source":"OKX BTC-USDT ticker (24h open 76,508.9)","asOf":NOW,"note":"Compared with the Nov 3 endday report (77,126.7): +1.03%. Overnight a sweep to 75,734.5 (03:00 UTC) dipped under the daily EMA200 (76,108) on a wick, then BTC reclaimed 78k and squeezed shorts.","sessionRange":{"low":75734.5,"high":78173.3}},
"decisionBox":{"position":"ADD","reduceIf":{"price":76108.4,"confirmation":"A 1H close under the daily EMA200 (76,108) would justify trimming spot; the overnight low (75,734.5) was only a wick, hourly closes held at 76,164 and 76,492."},
 "addIf":{"price":78866.5,"confirmation":"A 1H close above 78,867 (Nov 1 high) after reclaiming the 1H EMA200 (78,399) would justify a bigger add."},
 "invalidatesAt":75734.5,"stopOrder":{"recommended":True,"price":75600.0},
 "changed":"The reduce level wicked but never closed under (hourly closes stayed above 76,100). The 75.7k sweep reversed hard, BTC is back at 77.9k above the 15m and 1H EMA20/50/100, and about $772k of shorts were liquidated at 77.9k-78.15k. 4H and daily stacks stay bearish, so the wallet only adds a small spot tranche."},
"probabilities":{"bullish":26.0,"range":45.0,"bearish":29.0},
"levels":{"support":[77409.4,77000.0,76108.4,75734.5,75400.0],"resistance":[78173.3,78398.6,78866.5,79611.5,80000.0],
 "liquidation":[
  {"price":78100,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized (fresh, ~06:34 UTC): about $772k of shorts liquidated at 77.8k-78.15k, mostly 77.95k, 78.1k and 78.15k. Measured, approximate (0.01 BTC contract x fill price). Squeeze already spent."},
  {"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 25x longs opened near 78.5k liquidate near 75.4k. Not exchange resting-order data. Longs still crowded (ratio 2.17)."},
  {"price":80000,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 76.9k liquidate near 80.0k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":80000.0,"nearestBelow":75400.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":NOW,"note":"OKX feed was fresh (newest fill ~06:34 UTC), so CoinGlass was not needed. 1H account ratio 2.17 (longs crowded) keeps the pull down. Forward levels are estimates, not a heatmap read."}},
"atr":{"value":877.2,"period":14,"pct":1.13,"source":"OKX 4H candles, Wilder ATR14","asOf":NOW},
"timeframes":[
 tf("15m",63.88,[224.21,92.89,131.32],[77441.91,77340.02,77333.81,77409.44],"Price above the whole 15m EMA stack, RSI 64, MACD positive: sharp rebound off the 75.7k sweep","bullish-short-term"),
 tf("1h",57.88,[63.85,4.51,59.34],[77409.43,77441.76,77720.18,78398.63],"Price above EMA20/50/100, still under EMA200 (78,399); MACD histogram positive","neutral"),
 tf("4h",51.42,[-330.66,-410.07,79.41],[77572.39,78456.45,79611.46,80567.03],"Price just above EMA20 (77,572), well under EMA50/100/200; MACD below zero but histogram positive","bearish"),
 tf("daily",39.41,[-1202.43,-852.31,-350.12],[79903.8,80146.21,77831.08,76108.38],"Above EMA100 (77,831) barely and EMA200 (76,108); under EMA20/50; MACD histogram negative, RSI 39","bearish")],
"operations":[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.2,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"add","entry":None,"stop":75600.0,"tp":[78866.5,80000.0],"rr":None,"confidence":4.5,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.5,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Rebound inside a 75.7k-78.2k range; 78,173-78,399 caps rallies, 77,409 and 77,000 are the floor","longAbove":78173.3,"shortBelow":77409.4,"invalidates":75734.5,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":104.15,"changePct":0.53},"dxy":{"value":101.553},"us10y":{"value":4.933},
 "etfFlows":{"streakDays":-3,"note":"US spot BTC ETFs: Oct 30 -$643.2M, Nov 2 -$398.6M, Nov 3 -$27.4M (Farside, from the prior report). Nov 4 not posted yet. Three straight outflow days with a fading pace."},
 "liquidations":{"longsUsd":23,"shortsUsd":772311,"skew":2.17,"traders":None,"openInterestUsd":2709488883.0,"note":"OKX realized fills, 100 most recent (fresh, ~06:34 UTC): about $772k of shorts vs almost no longs, a short squeeze at 77.8k-78.15k (approximate, 0.01 BTC contracts). OKX OI $2.71B, funding +0.010%, 1H long/short account ratio 2.17 (longs crowded, used as skew). Fear and Greed 34 (Fear, alternative.me, Nov 3 value). Brent, DXY and US10Y from CNBC quotes this run."},
 "fearGreed":34,"earnings":[]},
"nonCrypto":{"indices":idx,"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":False,"rollingRecord":"Nov 3 endday range-bear: reduce 76,100 wicked (low 75,734.5) but no 1H close under it; add 78,867 never fired (high 78,173).","note":"The 25% spot trim at 77,127 sold below today's 77,924, though it dodged part of the 75.7k sweep. The 75,900 stop would have been touched on the wick, so the stop advice was reasonable but the dip reversed within hours."},
"sources":[{"title":"OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},
 {"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/history/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/history/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/history/"},
 {"title":"Farside Investors — Bitcoin ETF flows","url":"https://farside.co.uk/btc/"},{"title":"Fear and Greed Index — alternative.me","url":"https://api.alternative.me/fng/"},
 {"title":"CNBC quotes (Brent, DXY, US10Y)","url":"https://www.cnbc.com/quotes/@LCO.1"}]}
os.makedirs(f'{R}/2026/11',exist_ok=True)
json.dump(rep,open(f'{R}/2026/11/{ID}.json','w'),indent=2)
m=json.load(open(f'{R}/manifest.json'))
if not any(d['date']==D for d in m['days']):
    m['days'].insert(0,{"date":D,"sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
day=[d for d in m['days'] if d['date']==D][0]
for k in ('midnight','morning','midday','endday'): day['sessions'].setdefault(k,None)
day['sessions']['midnight']=f'data/2026/11/{ID}.json'
m['latest']=f'data/2026/11/{ID}.json'; m['updatedAt']=NOW
json.dump(m,open(f'{R}/manifest.json','w'),indent=2)
c=json.load(open(f'{R}/calibration.json'))
for r in c:
    if r['date']=='2026-11-03' and r['session']=='endday' and r.get('price_next_report') is None: r['price_next_report']=px
c.append({"date":D,"session":"midnight","bias":"range-bear","bull_pct":26.0,"range_pct":45.0,"bear_pct":29.0,"reduce_level":76108.4,"reduce_fired":False,"add_level":78866.5,"add_fired":None,"price_at_report":px,"price_next_report":None,"acting_helped":False})
json.dump(c,open(f'{R}/calibration.json','w'),indent=2)
intent={"session":"midnight","reportId":ID,"ts":NOW,"today":D,"markPrice":px,"sessionHigh":78173.3,"sessionLow":75734.5,"isSeeder":True,
"rationale":"The overnight sweep to 75,734 wicked under the daily EMA200 but hourly closes held above 76,100, and BTC reversed to 77.9k, reclaiming the 15m and 1H EMAs while shorts got squeezed. The 4H and daily stacks stay bearish and longs are crowded (2.17), so there is no edge for leverage. I rebuild a small spot position with a 15 USDT DCA tranche and keep about 22 USDT in cash.",
"message":{"to":"morning","text":"Added 15 USDT spot at 77.92k; futures flat. Reduce on a 1H close under 76,108; add more only above 78,867."},
"decision":{"type":"spot_buy","usd":15}}
json.dump(intent,open('intent-20261104-midnight.tmp.json','w'),indent=2)
