import json,subprocess,datetime,os
now=(datetime.datetime.utcnow()-datetime.timedelta(hours=5)).replace(microsecond=0)
NOW=now.isoformat()+'-05:00'
ASOF=now.replace(minute=2,second=0).isoformat()+'-05:00'
P=79950.1;LOW,HIGH=79709.5,81188.3
def rsi(c,n=14):
    c=c[::-1];g=l=0
    for i in range(1,n+1):
        d=c[i]-c[i-1];g+=max(d,0);l+=max(-d,0)
    g/=n;l/=n
    for i in range(n+1,len(c)):
        d=c[i]-c[i-1];g=(g*(n-1)+max(d,0))/n;l=(l*(n-1)+max(-d,0))/n
    return round(100-100/(1+g/(l or 1e-9)),1)
def dca(c,note):
    w=c[:21];last=w[0];mn,mx=min(w),max(w);m20=sum(c[:20])/20
    pct=round((last-mn)/(mx-mn)*100);r=rsi(c)
    z='very-cheap' if pct<=10 or (pct<=20 and r<35) else 'cheap' if pct<=30 else 'fair' if pct<=70 else 'rich'
    return {"percentileInMonth":pct,"pctVs20dAvg":round((last/m20-1)*100,2),"pctFromHigh":round((last/mx-1)*100,2),"rsi14":r,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}
Q=[725.61,721.25,712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93]
V=[709.90,707.52,703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86]
J=[102.13,102.89,102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33]
src=lambda t:{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/"+t.lower()+"/"}
idx=[]
for t,c,chg,b,n in [("QQQ",Q,0.60,"up into the Fed hold, still about 5% under the 52-week high","Oct 28 close 725.61 (+0.60%, StockAnalysis). After-hours 718.05 (-1.04%) is not the close."),
 ("VOO",V,0.34,"steady grind higher, mid-range","Oct 28 close 709.90 (+0.34%, StockAnalysis). After-hours 706.95 (-0.42%) is not the close."),
 ("JPXN",J,-0.74,"gave back the prior bounce, lower part of range","Oct 28 close 102.13 (-0.74%, StockAnalysis); prior close 102.89.")]:
    idx.append({"ticker":t,"price":c[0],"changePct":chg,"bias":b,"note":n,"dcaSignal":dca(c,''),"source":src(t)})
intent={"session":"midnight","reportId":"2026-10-29-midnight","ts":NOW,"today":"2026-10-29","markPrice":P,"sessionHigh":HIGH,"sessionLow":LOW,"isSeeder":True,
"rationale":"BTC slid to 79,950 and wicked 79,709.5, but no 1H close printed under the 79,838.5 reduce line and the 79,500 stop was never touched. Momentum is negative on 15m, 1H and daily, so no new risk. Futures have no edge mid-range. The 30.15 USDT of cash is reserved for the 30 USDT cost of living due Nov 1, so there is no free cash to deploy. Holding the spot book behind the 79,500 stop.",
"message":{"to":"morning","text":"Hold spot, futures flat. Reduce on a 1H close under 79,838.5; add on a reclaim of the 4H EMA20 (80,648). Keep cash at 30 or more for Nov 1."},
"lesson":{"pattern":"Wick through the reduce line without a 1H close under it","insight":"Wicks into 79.7k keep failing to close; wait for the 1H close before cutting, and keep cash for the Nov 1 expense."},
"decision":{"type":"hold"}}
ip=os.path.abspath('intent-20261029-midnight.tmp.json');json.dump(intent,open(ip,'w'),indent=1)
assert json.load(open(ip))['markPrice']==P
os.system('cp portfolio.json portfolio.json.pre-20261029-midnight')
res=subprocess.run(['python3','../../scripts/paper_wallet.py','--portfolio','portfolio.json','--intent',ip],capture_output=True,text=True)
print('LEDGER rc',res.returncode,res.stdout[-700:],res.stderr[-500:])
open('ledger_out_midnight.txt','w').write(res.stdout)
if res.returncode!=0: raise SystemExit(1)
r=json.load(open('2026/10/2026-10-28-endday.json'))
r.update({"id":"2026-10-29-midnight","date":"2026-10-29","session":"midnight","generatedAt":NOW,"overallBias":"range","biasTilt":"bearish","confidence":4.7})
r.pop('overnightRisk',None)
r["priceSnapshot"]={"value":P,"currency":"USD","changePct":-1.20,"source":"OKX BTC-USDT ticker (in-page fetch, ts fresh)","asOf":ASOF,"note":"24h open 80,919.8; 24h range 79,709.5-81,820. Price is 1.5% under the endday print (81,181.2) and 0.14% above the 79,838.5 reduce line. The overnight low 79,709.5 came at 21:00 COT.","sessionRange":{"low":LOW,"high":HIGH}}
r["decisionBox"]={"position":"HOLD","reduceIf":{"price":79838.5,"confirmation":"A 1H close below 79,838.5 (the wick to 79,709.5 did not close under it); then 79,500 stop and the 79,350 heatmap band."},
"addIf":{"price":80647.7,"confirmation":"A 1H close above the 4H EMA20 (80,648), then a hold above the 4H EMA50 (81,016); 81,298 is the next gate."},
"invalidatesAt":81850.0,"stopOrder":{"recommended":True,"price":79500.0},
"changed":"Endday HOLD stood: price fell from 81,181 to 79,950 overnight and wicked 79,709.5, but no 1H close printed under 79,838.5 and the 79,500 stop was untouched. The add line was not hit (81,384.7 high came before a 1H close above 81,298). Add trigger lowered to the 4H EMA20 reclaim."}
r["probabilities"]={"bullish":26.0,"range":46.0,"bearish":28.0}
r["levels"]={"support":[79709.5,79500.0,79377.7,79220.1],"resistance":[80257.1,80647.7,81015.6,81298.4,81384.7],
"liquidation":[
{"price":79350,"side":"below","intensity":"high","magnet":True,"note":"Brightest live band below spot on the CoinGlass Model 3 heatmap (green-yellow at the right edge, about 0.8% under spot). Read from screenshot; USD size not quantified."},
{"price":82000,"side":"above","intensity":"high","magnet":False,"note":"Bright yellow-green band near 82k on the heatmap; short-squeeze target. Read from screenshot."},
{"price":80000,"side":"below","intensity":"medium","magnet":False,"note":"Long stack at 80.0-80.4k looks consumed by the drop (band ends where price broke). OKX realized: about $123k long liquidated at 79.9-80.0k."},
{"price":80350,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized liquidations (fresh, 23:47-01:47 COT): about $380k of shorts at 80.2-80.5k, mostly 80.3-80.4k. Measured, approximate (0.01 BTC contract x fill price). Spent squeeze."},
{"price":84500,"side":"above","intensity":"low","magnet":False,"note":"Cluster of thinner green bands at 84-85k on the heatmap."}],
"liquidityMagnet":{"nearestAbove":82000.0,"nearestBelow":79350.0,"pull":"down","source":"CoinGlass Liquidation Heatmap Model 3 (Binance BTC/USDT perp, 48h) via browser screenshot; OKX liquidation-orders, long-short ratio, OI, funding (in-page fetch)","asOf":ASOF,"note":"The big 80.0-80.4k long stack was already eaten on the way down. The next bright band is 79.35k, just under the 79,500 stop. Longs are crowded on OKX (account ratio 2.12) so the pull stays down."}}
r["atr"]={"value":804.6,"period":14,"pct":1.01,"source":"OKX 4H candles, Wilder ATR14","asOf":ASOF}
S="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9)"
def T(tf,rsi_,m,e,st,bias):return {"tf":tf,"rsi":rsi_,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":bias,"source":S,"asOf":ASOF}
r["timeframes"]=[
T("15m",36.5,[-156.3,-176.5,20.1],[80190.5,80480.6,80644.3,80613.6],"Under the whole EMA stack; RSI 36.5, MACD below zero but histogram positive: a small bounce inside a downtrend","bearish"),
T("1h",37.4,[-219.9,-89.8,-130.1],[80547.8,80627.7,80684.1,80965.3],"Under every EMA, EMA20 at 80.55k is the first lid; MACD histogram -130 and widening","bearish"),
T("4h",42.6,[-77.9,-84.1,6.2],[80647.7,81015.6,81581.5,81899.3],"Under the whole stack; RSI 42.6; MACD line just above signal (+6), a pause in momentum rather than a turn","range, bearish tilt"),
T("daily",42.5,[-545.3,-264.6,-280.7],[81522.7,80733.5,77807.0,75932.6],"Under EMA20 and EMA50, above EMA100/200; MACD below signal and zero, histogram -281 and widening","bearish tilt")]
r["operations"]=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":3.5,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"hold","entry":None,"stop":79500.0,"tp":[80647.7,81298.4],"rr":None,"confidence":4.2,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":5.0,"hold":"long-term"}]
r["scalpContext"]={"intradayBias":"Range 79.5k-80.65k with a downward lean: the 4H EMA20 (80,648) caps rallies, 79,709.5 is the floor to watch","longAbove":80647.7,"shortBelow":79838.5,"invalidates":81850.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
r["macro"]={"brent":{"value":114.06,"changePct":-1.09},"dxy":{"value":102.225},"us10y":{"value":4.999},
"etfFlows":{"streakDays":2,"note":"US spot BTC ETFs: Oct 26 +110.3M, Oct 27 +176.0M (tftc.io, updated Oct 27); month to date -26.1M. Oct 28 print not yet published."},
"liquidations":{"longsUsd":123089,"shortsUsd":380357,"skew":1.01,"traders":None,"openInterestUsd":2575179272.0,"note":"OKX realized fills, 100 most recent (fresh, 23:47-01:47 COT): about $123k long vs $380k short, shorts at 80.2-80.5k and longs at 79.9-80.0k (approximate, 0.01 BTC contracts). OKX OI $2.575B (from $2.634B), funding +0.004%, 1H account ratio 2.12. CoinGlass header (all exchanges): OI $139.58B, 24h liquidations $369.4M (+151%), long/short 50.21/49.79 (skew used). Fear and Greed 51 (Neutral, alternative.me, Oct 28 print)."},
"fearGreed":51,"earnings":[]}
r["nonCrypto"]={"indices":idx,"stockWatchlist":[]}
r["divergences"]=[]
r["calibration"]={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Endday HOLD: reduce 79,838.5 wicked (low 79,709.5) but no 1H close under it; add 81,298.4 never held. Price fell 81,181 -> 79,950 (-1.5%), 79,500 stop untouched.","note":"Holding the stop instead of cutting on the wick was right so far; the 1H closes stayed at or above 79,859."}
r["sources"]=[{"title":"OKX public API (ticker, candles, OI, funding, long/short ratio, liquidation-orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"CoinGlass Liquidation Heatmap Model 3","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"},{"title":"Bitcoin ETF flows — tftc.io","url":"https://www.tftc.io/bitcoin-etf-flows/october-2026"},{"title":"alternative.me Fear & Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"CNBC Brent, DXY and US10Y quotes","url":"https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=@LCO.1|.DXY|US10Y"},{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"}]
json.dump(r,open('2026/10/2026-10-29-midnight.json','w'),indent=2)
m=json.load(open('manifest.json'));open('manifest.json.pre-20261029-midnight','w').write(json.dumps(m))
if m['days'][0]['date']!='2026-10-29':
    m['days'].insert(0,{"date":"2026-10-29","sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
m['days'][0]['sessions']['midnight']='data/2026/10/2026-10-29-midnight.json'
m['latest']='data/2026/10/2026-10-29-midnight.json';m['updatedAt']=NOW
json.dump(m,open('manifest.json','w'),indent=2)
c=json.load(open('calibration.json'));open('calibration.json.pre-20261029-midnight','w').write(json.dumps(c))
for x in c:
    if x['date']=='2026-10-28' and x['session']=='endday':
        x['price_next_report']=P;x['reduce_fired']=False;x['add_fired']=False;x['acting_helped']=True
c.append({"date":"2026-10-29","session":"midnight","bias":"range-bear","bull_pct":26.0,"range_pct":46.0,"bear_pct":28.0,"reduce_level":79838.5,"reduce_fired":None,"add_level":80647.7,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
print('done',NOW)
