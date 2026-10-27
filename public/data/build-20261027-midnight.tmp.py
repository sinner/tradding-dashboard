import json,subprocess,datetime,copy,os
D='.'
now=(datetime.datetime.utcnow()-datetime.timedelta(hours=5)).replace(microsecond=0)
NOW=now.isoformat()+'-05:00'
ASOF=(now.replace(minute=6,second=0)).isoformat()+'-05:00'
P=79653.6
LOW,HIGH=79582.4,80334.8
def rsi(c,n=14):
    c=c[::-1];g=l=0
    for i in range(1,n+1):
        d=c[i]-c[i-1];g+=max(d,0);l+=max(-d,0)
    g/=n;l/=n
    for i in range(n+1,len(c)):
        d=c[i]-c[i-1];g=(g*(n-1)+max(d,0))/n;l=(l*(n-1)+max(-d,0))/n
    return round(100-100/(1+g/(l or 1e-9)),1)
def dca(c):
    w=c[:21];last=w[0];mn,mx=min(w),max(w);m20=sum(c[:20])/20
    pct=round((last-mn)/(mx-mn)*100);r=rsi(c)
    z='very-cheap' if pct<=10 or (pct<=20 and r<35) else 'cheap' if pct<=30 else 'fair' if pct<=70 else 'rich'
    return {"percentileInMonth":pct,"pctVs20dAvg":round((last/m20-1)*100,2),"pctFromHigh":round((last/mx-1)*100,2),"rsi14":r,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call. Carried from Oct 26 close (market closed)."}
Q=[712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93,736.53,744.50]
V=[703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86,702.46,703.61,710.79]
J=[102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33,102.96,103.98,102.15,103.08]
src=lambda t:{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/"+t.lower()+"/"}
idx=[]
for t,c,chg,b,n in [("QQQ",Q,1.11,"bounce holds, still below the Oct 6 high","Oct 26 close (StockAnalysis); market closed, no new session yet. Prior close 704.40."),
 ("VOO",V,0.69,"mild rebound","Oct 26 close (StockAnalysis); market closed, no new session yet. Prior close 698.58."),
 ("JPXN",J,0.27,"flat, range-bound","Oct 26 close (StockAnalysis); market closed, no new session yet. Prior close 101.93.")]:
    idx.append({"ticker":t,"price":c[0],"changePct":chg,"bias":b,"note":n,"dcaSignal":dca(c),"source":src(t)})
# ---- ledger
intent={"session":"midnight","reportId":"2026-10-27-midnight","ts":NOW,"today":"2026-10-27","markPrice":P,"sessionHigh":HIGH,"sessionLow":LOW,"isSeeder":True,
"rationale":"Price slid to 79,654 and the 15m/1H/4H momentum is negative, but the 79,377.7 reduce line was never touched (low 79,582.4) and a fresh ~$990k long-liquidation flush at 79.6-79.7k just ran out. Seeder puts a small 5 USDT tranche to work near the shelf, no leverage. Cash stays above the 30 USDT due Nov 1. Resting stop 79,150 protects the book.",
"message":{"to":"morning","text":"Spot +5 USDT at 79.65k after a long flush at 79.6-79.7k. Reduce on a 1H close under 79,378; add on a reclaim of the 4H EMA20 (80,446). Futures flat. Keep cash above 30 for Nov 1."},
"lesson":{"pattern":"Fresh long flush at 79.6-79.7k while longs stay crowded (ratio 2.36)","insight":"Flushes into the shelf keep exhausting, but momentum is negative on every timeframe; tranches stay tiny and the 79,150 stop does the protecting."},
"decision":{"type":"spot_buy","usd":5}}
ip=os.path.abspath('intent-20261027-midnight.tmp.json');json.dump(intent,open(ip,'w'),indent=1)
res=subprocess.run(['python3','../../scripts/paper_wallet.py','--portfolio','portfolio.json','--intent',ip],capture_output=True,text=True)
print('LEDGER rc',res.returncode,res.stdout[-800:],res.stderr[-500:])
open('ledger_out_midnight.txt','w').write(res.stdout)
# ---- report
r=json.load(open('2026/10/2026-10-26-endday.json'))
r.update({"id":"2026-10-27-midnight","date":"2026-10-27","session":"midnight","generatedAt":NOW,"overallBias":"range","biasTilt":"bearish","confidence":4.6})
r.pop('overnightRisk',None)
r["priceSnapshot"]={"value":P,"currency":"USD","changePct":-0.66,"source":"OKX BTC-USDT ticker (in-page fetch)","asOf":ASOF,"note":"24h open 80,180; 24h range 79,455.8-80,849.9. Price has slid under the 79,720 shelf and sits 0.7% under the endday print (80,213.1).","sessionRange":{"low":LOW,"high":HIGH}}
r["decisionBox"]={"position":"ADD","reduceIf":{"price":79377.7,"confirmation":"A 1H close below 79,377.7 (Oct 25 low) re-opens the 79,220 wick, then the estimated 76.5k long-liquidation pocket."},
"addIf":{"price":80445.6,"confirmation":"A 1H close above the 4H EMA20 (80,446) turns the bounce into a trend attempt; 80,850 and 81,174 (4H EMA50) are next, 81,850 is the trend gate."},
"invalidatesAt":81850.0,"stopOrder":{"recommended":True,"price":79150.0},
"changed":"Endday trimmed 5% at 80,213; price fell 0.7% since. The 79,377.7 reduce line was not touched (session low 79,582.4) and 80,850 was not reached (high 80,334.8). Seeder adds a small 5 USDT spot tranche after a fresh long flush at 79.6-79.7k; resting stop stays at 79,150."}
r["probabilities"]={"bullish":24.0,"range":42.0,"bearish":34.0}
r["levels"]["support"]=[79582.4,79455.8,79377.7,79220.1]
r["levels"]["resistance"]=[79983.0,80334.8,80445.6,80849.9,81174.2]
r["levels"]["liquidation"]=[
{"price":79650,"side":"below","intensity":"high","magnet":True,"note":"OKX realized liquidations, 100 most recent (fresh, 01:17-01:51 COT): about $470k LONG at 79.6k and $470k at 79.7k, plus $30k at 79.5k and $23k at 79.8k. Measured, approximate (0.01 BTC contract x fill price). The flush already ran; price is sitting on it."},
{"price":76470,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet (25x long liquidation from spot) — not exchange resting-order data."},
{"price":82840,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet (25x short liquidation from spot) — not exchange resting-order data."}]
r["levels"]["liquidityMagnet"]={"nearestAbove":82840.0,"nearestBelow":79650.0,"pull":"down","source":"OKX public liquidation-orders, long-short-account-ratio, open-interest, funding (in-page fetch)","asOf":ASOF,"note":"Realized flow is all long (about $991k long vs $0 short) and the account ratio is 2.36, so the pull stays down. Upside marker is an estimate."}
r["atr"]={"value":745.66,"period":14,"pct":0.94,"source":"OKX 4H candles, Wilder ATR14","asOf":ASOF}
S="OKX BTC-USDT candles, computed (EMA/RSI Wilder/MACD 12-26-9)"
def T(tf,rsi_,m,e,st,bias):return {"tf":tf,"rsi":rsi_,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":bias,"source":S,"asOf":ASOF}
r["timeframes"]=[
T("15m",39.11,[-80.37,-71.52,-8.85],[79832.6,79951.2,80056.0,80214.4],"Under the whole EMA stack (79.83k-80.21k); MACD below zero and signal","bearish"),
T("1h",40.95,[-138.19,-105.12,-33.07],[79983.0,80228.4,80635.5,81080.9],"Under the whole EMA stack, EMA20 is the first lid at 79.98k","bearish"),
T("4h",36.6,[-460.51,-455.21,-5.31],[80445.6,81174.2,81780.9,81773.5],"Under the whole stack, RSI 36.6; MACD line barely under signal","bearish"),
T("daily",41.71,[-508.63,-139.05,-369.58],[81721.6,80738.9,77715.8,75996.0],"Under EMA20 and EMA50, above EMA100/200; MACD below signal and zero","range, bearish tilt")]
r["operations"]=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":3.0,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":79150.0,"tp":[],"rr":None,"confidence":3.5,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":79150.0,"tp":[],"rr":None,"confidence":3.5,"hold":"long-term"}]
r["scalpContext"]={"intradayBias":"Range 79.45k-80.45k with a downward lean: buy a held 79.5k-79.6k with a tight stop, fade 79.98k-80.45k; trend flips up only above 81,850","longAbove":80445.6,"shortBelow":79377.7,"invalidates":81850.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
r["macro"]={"brent":{"value":115.84,"changePct":0.03},"dxy":{"value":102.196},"us10y":{"value":4.982},
"etfFlows":{"streakDays":-2,"note":"Spot BTC ETFs per Farside: Oct 23 -137.9M, Oct 22 -635.6M after +524.8M on Oct 21; Oct 26 row still empty (placeholder 0.0). Two straight outflow days."},
"liquidations":{"longsUsd":991000,"shortsUsd":0,"skew":2.36,"traders":None,"openInterestUsd":2634204371.0,"note":"OKX realized fills, 100 most recent (fresh, 01:17-01:51 COT): about $991k long vs $0 short, all at 79.5-79.8k (approximate, 0.01 BTC contracts). OKX OI $2.634B (from $2.539B at endday); funding +0.010%; 1H long/short account ratio 2.36 (longs crowded). Fear and Greed 48 (Neutral, alternative.me)."},
"fearGreed":48,"earnings":[]}
r["nonCrypto"]={"indices":idx,"stockWatchlist":[]}
r["calibration"]={"priorReduceFired":False,"actingHelped":True,"rollingRecord":"Endday REDUCE (5% trim at 80,213.1): reduce line 79,377.7 never touched (low 79,582.4), add line 80,850 never reached (high 80,334.8). Price is 0.7% lower at 79,653.6, so the trim helped slightly.","note":"The 79.4k-80.1k shelf finally gave way at the top edge (79.72k lost), but the 79.38k reduce line still holds. Edge is small; size stays small."}
r["sources"]=[{"title":"OKX public API (ticker, candles, OI, funding, long/short ratio, liquidation-orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"Farside Spot BTC ETF flows","url":"https://farside.co.uk/btc/"},{"title":"alternative.me Fear & Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"CNBC Brent quote","url":"https://www.cnbc.com/quotes/@LCO.1"},{"title":"CNBC US10Y quote","url":"https://www.cnbc.com/quotes/US10Y"},{"title":"CNBC DXY quote","url":"https://www.cnbc.com/quotes/.DXY"},{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/history/"}]
os.makedirs('2026/10',exist_ok=True)
json.dump(r,open('2026/10/2026-10-27-midnight.json','w'),indent=2)
# manifest
m=json.load(open('manifest.json'));open('manifest.json.pre-20261027-midnight','w').write(json.dumps(m))
if m['days'][0]['date']!='2026-10-27':
    m['days'].insert(0,{"date":"2026-10-27","sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
m['days'][0]['sessions']['midnight']='data/2026/10/2026-10-27-midnight.json'
m['latest']='data/2026/10/2026-10-27-midnight.json';m['updatedAt']=NOW
json.dump(m,open('manifest.json','w'),indent=2)
# calibration
c=json.load(open('calibration.json'));open('calibration.json.pre-20261027-midnight','w').write(json.dumps(c))
rows=c if isinstance(c,list) else c.get('rows',c)
for x in rows:
    if x['date']=='2026-10-26' and x['session']=='endday':
        x['price_next_report']=P;x['acting_helped']=True
rows.append({"date":"2026-10-27","session":"midnight","bias":"range-bear","bull_pct":24.0,"range_pct":42.0,"bear_pct":34.0,"reduce_level":79377.7,"reduce_fired":None,"add_level":80445.6,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
print('done',NOW)
