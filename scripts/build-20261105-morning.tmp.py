import json,subprocess,copy
R='public/data'
NOW='2026-11-05T08:17:00-05:00'; ASOF='2026-11-05T08:16:00-05:00'
P=79742.0
prev=json.load(open(f'{R}/2026/11/2026-11-04-endday.json'))
ind=copy.deepcopy(prev['nonCrypto']['indices'])
for i in ind:
    i['note']='Nov 4 official close (StockAnalysis); Nov 5 US session not open yet at report time. DCA signal carried from last close.'
    i['dcaSignal']['note']='Carried from last close. Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call.'
tf=lambda t,r,m,e,s,b:{"tf":t,"rsi":r,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":s,"bias":b,"source":"OKX BTC-USDT candles (600 bars), computed (EMA/RSI Wilder/MACD 12-26-9)","asOf":ASOF}
rep={
"schemaVersion":"1.0.0","id":"2026-11-05-morning","date":"2026-11-05","session":"morning","generatedAt":NOW,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":5.0,
"priceSnapshot":{"value":P,"currency":"USD","changePct":1.77,"source":"OKX BTC-USDT ticker (24h open 78,354.8)","asOf":ASOF,
 "note":"Versus the 19:35 COT endday report (80,767): -1.28%. BTC rejected 80,914 after midnight, then flushed to 79,537.8 and bounced to 79.7k. It is back under the 1H EMA20 (80,066) and the 4H EMA200 (80,582). No midnight report was found for today, so this compares with yesterday's endday.",
 "sessionRange":{"low":79537.8,"high":80914.2}},
"decisionBox":{"position":"ADD","reduceIf":{"price":78866.5,"confirmation":"A 1H close under 78,866 would break the 79.5k floor and open 77,986 (invalidation); trim the core then."},
 "addIf":{"price":80582.13,"confirmation":"A 4H close above 80,582 (4H EMA200) would justify a larger add; today's small spot tranche is only a dip-buy on the flushed longs."},
 "invalidatesAt":77986.0,"stopOrder":{"recommended":False,"price":78866.5},
 "changed":"Endday trimmed into strength and set 79.6k-78.9k as the rebuy zone. BTC tagged 79,538, $1.15M of longs flushed at 79.5k-79.7k, and the wallet redeploys a small 20 USDT tranche. Bias tilt moved from bullish to bearish: 4H EMA200 lost, 1H EMA20 lost."},
"probabilities":{"bullish":28.0,"range":45.0,"bearish":27.0},
"levels":{"support":[79537.8,78866.5,77986.0,76141.49],"resistance":[80088.96,80582.13,80914.2,81200.0],
 "liquidation":[
  {"price":79700,"side":"below","intensity":"high","magnet":True,"note":"OKX realized (fresh, newest fill 12:53 UTC): about $747k of longs liquidated at 79.7k, $256k at 79.5k, $143k at 79.6k. Measured, approximate (0.01 BTC contract x fill price)."},
  {"price":77500,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet: 25x longs opened near 80.7k liquidate near 77.5k. Not exchange resting-order data."},
  {"price":82000,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 78.9k liquidate near 82.0k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":80088.96,"nearestBelow":79537.8,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":ASOF,
  "note":"OKX feed was fresh (newest fill 12:53 UTC), so CoinGlass was not needed. Longs are still crowded (1H ratio 1.57) after the flush, so the pull stays down. Forward levels are estimates, not a heatmap read."}},
"atr":{"value":915.79,"period":14,"pct":1.15,"source":"OKX 4H candles, Wilder ATR14","asOf":ASOF},
"timeframes":[
 tf("15m",28.7,[-189.99,-117.1,-72.89],[80140.55,80264.16,79972.16,79306.44],"Price under EMA20/50/100, only above EMA200 (79,306); RSI 29 oversold, MACD negative","bearish-oversold"),
 tf("1h",46.88,[276.61,467.41,-190.8],[80066.23,79302.13,78767.73,78857.99],"Price under EMA20 (80,066), above EMA50/100/200; RSI 47, MACD histogram negative","neutral-bearish"),
 tf("4h",57.6,[584.99,294.37,290.61],[78965.84,78900.73,79681.65,80582.13],"Last 4H candle wicked to 79,538 and closed 79,698, back under the EMA200 (80,582) and on the EMA100 (79,682); RSI 58","neutral"),
 tf("daily",47.22,[-916.66,-834.85,-81.81],[80088.96,80218.17,77912.88,76141.49],"Price under daily EMA20/50 (about 80.1k-80.2k), above EMA100/200; RSI 47, MACD negative; daily bar (UTC+8) still forming","neutral-bearish")],
"operations":[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"add","entry":None,"stop":78866.5,"tp":[80582.13,81200.0],"rr":None,"confidence":4.5,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Range 79.5k-80.1k; sellers capped bounces at the 1H EMA20","longAbove":80088.96,"shortBelow":79537.8,"invalidates":77986.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":96.67,"changePct":2.17},"dxy":{"value":101.608},"us10y":{"value":4.904},
 "etfFlows":{"streakDays":1,"note":"US spot BTC ETFs (Farside): Oct 30 -$643.2M, Nov 2 -$398.6M, Nov 3 -$115.6M, Nov 4 +$74.6M. The outflow streak broke on Nov 4 (IBIT -$201.2M offset by FBTC +$236.7M)."},
 "liquidations":{"longsUsd":1145527.0,"shortsUsd":0.0,"skew":1.57,"traders":None,"openInterestUsd":2702211657.0,
  "note":"OKX realized fills, 100 most recent (fresh, 12:39-12:53 UTC Nov 5): about $1.15M of longs and no shorts, clustered at 79.5k-79.7k (approximate, 0.01 BTC contracts). OKX OI $2.70B, funding +0.01%, 1H long/short account ratio 1.57 (longs crowded, used as skew). Fear and Greed 50 (Neutral, alternative.me, Nov 4 value; prior 34). Brent 96.67 (+2.17%), DXY 101.61, US10Y 4.904% from CNBC quotes this run."},
 "fearGreed":50,"earnings":[]},
"nonCrypto":{"indices":ind,"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":True,"actingHelped":True,"rollingRecord":"Endday trimmed 15% of spot at 80,767 and set 79,598 as the reduce level. BTC reached 79,538 overnight (reduce level touched), so the trim helped: price is 1.28% lower at 79,742. The 81,200 add trigger never fired.",
 "note":"Endday read (range-bull 38/42/20) had the right caution on crowded longs and overbought 1H RSI. The tilt flips to bearish now that the 4H EMA200 is lost."},
"sources":prev['sources']+[{"title":"Farside Investors — Bitcoin ETF Flow","url":"https://farside.co.uk/btc/"}]}
rep['sources']=[s for i,s in enumerate(rep['sources']) if s['url'] not in [x['url'] for x in rep['sources'][:i]]]
json.dump(rep,open(f'{R}/2026/11/2026-11-05-morning.json','w'),indent=2,ensure_ascii=False)
# intent
intent={"session":"morning","reportId":"2026-11-05-morning","ts":NOW,"today":"2026-11-05","markPrice":P,"sessionHigh":80914.2,"sessionLow":79537.8,"isSeeder":False,
"rationale":"BTC flushed to 79,538 (longs liquidated $1.15M at 79.5k-79.7k) and holds the 79.6k-78.9k rebuy zone set at endday. I redeploy 20 USDT of the cash into spot as a small dip-buy with a 78,866 reduce level. No leverage: 4H EMA200 lost, daily neutral, no perp edge.",
"decision":{"type":"spot_buy","usd":20.0}}
json.dump(intent,open('scripts/intent-20261105-morning.tmp.json','w'))
r=subprocess.run(['python3','scripts/paper_wallet.py','--portfolio',f'{R}/portfolio.json','--intent','scripts/intent-20261105-morning.tmp.json'],capture_output=True,text=True)
print('RC',r.returncode,r.stdout,r.stderr)
open('scripts/ledger_out_morning.txt','w').write(r.stdout)
# manifest
m=json.load(open(f'{R}/manifest.json'))
if m['days'][0]['date']!='2026-11-05':
    m['days'].insert(0,{"date":"2026-11-05","sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
m['days'][0]['sessions']['morning']='data/2026/11/2026-11-05-morning.json'
m['latest']='data/2026/11/2026-11-05-morning.json'; m['updatedAt']=NOW
json.dump(m,open(f'{R}/manifest.json','w'),indent=2,ensure_ascii=False)
# calibration
c=json.load(open(f'{R}/calibration.json'))
for row in c:
    if row['date']=='2026-11-04' and row['session']=='endday':
        row['price_next_report']=P; row['reduce_fired']=True; row['add_fired']=False; row['acting_helped']=True
c.append({"date":"2026-11-05","session":"morning","bias":"range-bear","bull_pct":28.0,"range_pct":45.0,"bear_pct":27.0,"reduce_level":78866.5,"reduce_fired":None,"add_level":80582.13,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open(f'{R}/calibration.json','w'),indent=2,ensure_ascii=False)
