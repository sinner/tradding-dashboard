import json,subprocess,os,sys
D='public/data'; TS='2026-11-09T09:17:00-05:00'; ID='2026-11-09-midday'
mk=74611.5
m=json.load(open(f'{D}/2026/11/2026-11-09-morning.json'))
nc=m['nonCrypto']
for i in nc['indices']:
    i['note']=i['note'].replace('Friday Nov 6 official close carried (StockAnalysis); market closed for the weekend and US cash has not opened yet at report time.','Friday Nov 6 close carried from the morning report (StockAnalysis); US cash has not opened yet at report time.')
src=lambda s:{"title":s,"url":"https://www.okx.com/docs-v5/en/"}
tf=lambda t,r,ml,sg,h,e,st,b:{"tf":t,"rsi":r,"macd":{"line":ml,"signal":sg,"hist":h},"emas":dict(zip(["ema20","ema50","ema100","ema200"],e)),"structure":st,"bias":b,"source":"OKX BTC-USDT candles (300 bars) via in-page browser fetch, computed (EMA, Wilder RSI14, MACD 12-26-9); last bar unconfirmed","asOf":TS}
rep={"schemaVersion":"1.0.0","id":ID,"date":"2026-11-09","session":"midday","generatedAt":TS,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":5.0,
"priceSnapshot":{"value":mk,"currency":"USD","changePct":-1.9,"source":"OKX BTC-USDT ticker (24h open 75,975.2; 24h range 73,500-76,100)","asOf":TS,"note":"Versus the 09:15 COT morning report (74,539.1): +0.1%. This midday run fired early, so little has changed. BTC sits under the daily EMA200 (76,385) and the 4H EMA20 (75,614).","sessionRange":{"low":73751.0,"high":75102.9}},
"decisionBox":{"position":"ADD","reduceIf":{"price":73500.0,"confirmation":"A 1H close under 73,500 (the weekend wick low) opens 72.9k then 72.0k; stop buying and trim the core."},"addIf":{"price":75613.6,"confirmation":"A 4H close above 75,614 (4H EMA20) with the 1H EMA50 (75.3k) reclaimed allows a bigger add toward 76.1k."},"invalidatesAt":72850.0,"stopOrder":{"recommended":True,"price":73400.0},"changed":"Nothing broke since the morning report: neither the 73,500 reduce level nor the 75,609 add trigger fired. Price holds the 74.5k pocket, so the wallet adds one more small 10 USDT spot tranche and keeps about 21 USDT of cash for a deeper test of 73.5k."},
"probabilities":{"bullish":22.0,"range":41.0,"bearish":37.0},
"levels":{"support":[74100.0,73751.0,73500.0,72850.0],"resistance":[74790.6,75102.9,75613.6,76100.0],
"liquidation":[
{"price":78800,"side":"above","intensity":"high","magnet":False,"note":"CoinGlass Model 3 heatmap (Binance BTC/USDT perp, 48h): bright band near 78.8k, read from the price axis; qualitative."},
{"price":76400,"side":"above","intensity":"extreme","magnet":True,"note":"CoinGlass Model 3 heatmap: the brightest band spans the whole 48h window near 76.4k, just above the daily EMA200 and the 76.1k wick high; strongest upside magnet."},
{"price":74500,"side":"below","intensity":"high","magnet":False,"note":"CoinGlass heatmap: bright yellow segment right at price (74.5k) building over the last day; OKX realized: about $77k of longs liquidated at 74.5k-74.6k."},
{"price":73700,"side":"below","intensity":"medium","magnet":False,"note":"CoinGlass heatmap: medium band just above the 73.5k weekend wick low."},
{"price":72800,"side":"below","intensity":"medium","magnet":False,"note":"CoinGlass heatmap: medium band near 72.8k, the 25x-long area."},
{"price":72000,"side":"below","intensity":"high","magnet":False,"note":"CoinGlass heatmap: bright green band near 72.0k; the main downside magnet if 73.5k breaks."}],
"liquidityMagnet":{"nearestAbove":76400.0,"nearestBelow":74500.0,"pull":"balanced","source":"CoinGlass Liquidation Heatmap Model 3 (Binance BTC/USDT perp, 48h), read via browser screenshot; OKX realized fills, funding, open interest and long/short ratio via in-page browser fetch","asOf":TS,"note":"The brightest band is above (76.4k) but the 4H/daily trend and crowded OKX longs (ratio 2.89) lean down, so the pull stays balanced. Heatmap price levels are solid; USD magnitude is not read. OKX realized fills: about $77k longs and $461k shorts (mostly 74.9k-75.1k) over 07:30-09:14 COT."}},
"atr":{"value":844.4,"period":14,"pct":1.13,"source":"OKX 4H candles, Wilder ATR14","asOf":TS},
"timeframes":[
tf("15m",51.19,65.5,46.4,19.0,[74562.4,74635.4,74922.2,75277.0],"Price at EMA20/50 (74.56k/74.64k) in a tight 74.4k-74.9k base; EMA100/200 overhead at 74.9k/75.3k; MACD turned up","neutral"),
tf("1h",44.82,-285.8,-327.4,41.6,[74790.6,75302.4,75934.1,76829.1],"Price under every EMA; EMA20 at 74.79k caps bounces; RSI 45 recovering from the 73.5k flush; MACD negative with a positive histogram","bearish"),
tf("4h",35.27,-722.5,-629.6,-92.9,[75613.6,76759.9,78082.7,79642.7],"Price under all EMAs in a stacked bearish order; RSI 35 is near oversold; 4H EMA20 at 75.6k is the add trigger","bearish"),
tf("daily",34.43,-1659.7,-1269.5,-390.2,[78349.9,79406.1,77680.2,76385.4],"Price below the 20/50/100 and the EMA200 (76.4k); RSI 34 near oversold; MACD negative and widening; the Nov 3 spike to 81.2k fully retraced","bearish")],
"operations":[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":73400.0,"tp":[75613.6,76100.0],"rr":None,"confidence":5.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Range 73.75k-75.1k with a bearish tilt; 74.8k (1H EMA20) caps bounces; a 1H close under 73,500 is the risk","longAbove":74800.0,"shortBelow":74100.0,"invalidates":73500.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":93.75,"changePct":-4.65},"dxy":{"value":101.85},"us10y":{"value":4.846},
"etfFlows":{"streakDays":-2,"note":"US spot BTC ETFs (Farside, US$m): Nov 2 -398.6, Nov 3 -115.6, Nov 4 +74.6, Nov 5 -430.2, Nov 6 -411.9; Nov 9 not yet reported. Two straight outflow days. Brent from TradingEconomics (93.75, -4.65%; the page's meta text said 94.12), DXY and US10Y as shown there, timestamps not stated."},
"liquidations":{"longsUsd":76819.0,"shortsUsd":460634.0,"skew":2.89,"traders":None,"openInterestUsd":2646331267.5,"note":"OKX realized fills, 100 most recent (fresh, 07:30-09:14 COT Nov 9), approximate (0.01 BTC contracts). OKX OI $2.65B, funding +0.0056%, 1H long/short account ratio 2.89 (longs crowded, used as skew). CoinGlass header: 24h liquidations $1.16B, 24h long/short 48.85%/51.15%. Fear and Greed 28 (Fear, alternative.me)."},
"fearGreed":28,"earnings":[]},
"nonCrypto":nc,"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":None,"rollingRecord":"The morning report set 73,500 as the reduce level and 75,609 as the add trigger. Neither fired: the low since is 73,751 and the high 75,103. The 15 USDT tranche bought at 74.5k is flat.","note":"Range with bearish tilt (22/40/38) is intact. Compared against today's morning report; this run fired about three hours before the usual midday slot."},
"sources":[{"title":"OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},
{"title":"CoinGlass Liquidation Heatmap Model 3","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"},
{"title":"Farside Investors — Bitcoin ETF Flow","url":"https://farside.co.uk/btc/"},
{"title":"alternative.me Fear and Greed Index","url":"https://alternative.me/crypto/fear-and-greed-index/"},
{"title":"TradingEconomics (Brent, DXY, US10Y)","url":"https://tradingeconomics.com/commodity/brent-crude-oil"},
{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/history/"},
{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/history/"},
{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"}]}
json.dump(rep,open(f'{D}/2026/11/{ID}.json','w'),indent=2,ensure_ascii=False)
# ledger
intent={"session":"midday","reportId":ID,"ts":TS,"today":"2026-11-09","markPrice":mk,"sessionHigh":None,"sessionLow":None,"isSeeder":False,
"rationale":"Neither the 73,500 reduce level nor the 75,609 add trigger fired since the morning report, and price holds the 74.5k pocket after the weekend flush. The 4H and daily trends stay bearish and longs are crowded, so the wallet adds only one more small 10 USDT spot tranche and keeps about 21 USDT of cash for a deeper test of 73.5k.",
"message":{"to":"endday","text":"Added a second small 10 USDT spot tranche at 74.6k. A 1H close under 73,500 means stop buying and trim; a 4H close above 75,614 allows a bigger add toward 76.1k."},
"decision":{"type":"spot_buy","usd":10}}
ip=f'scripts/intent-20261109-midday.tmp.json'; json.dump(intent,open(ip,'w'),indent=1)
r=subprocess.run(['python3','scripts/paper_wallet.py','--portfolio',f'{D}/portfolio.json','--intent',ip],capture_output=True,text=True)
print('LEDGER rc',r.returncode,r.stdout[-800:],r.stderr[-400:])
open('/tmp/ledger_midday.txt','w').write(r.stdout)
