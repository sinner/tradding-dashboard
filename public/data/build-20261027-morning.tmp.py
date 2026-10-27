import json,subprocess,datetime,os,copy
now=(datetime.datetime.utcnow()-datetime.timedelta(hours=5)).replace(microsecond=0,second=0)
NOW=now.isoformat()+'-05:00'
P=79886.9;LOW=79505.0;HIGH=80154.8
intent={"session":"morning","reportId":"2026-10-27-morning","ts":NOW,"today":"2026-10-27","markPrice":P,"sessionHigh":HIGH,"sessionLow":LOW,"isSeeder":False,
"rationale":"Price bounced to 79,887 from the midnight print (79,654). The 79,377.7 reduce line was not touched (low 79,505) and 80,446 add line was not reached (high 80,155). A fresh short squeeze at 80.0-80.13k (~$486k) just cleared the nearest upside pocket, 15m turned positive but 1H and 4H stay under their EMA stacks and longs remain crowded (ratio 2.27). Another small 5 USDT spot DCA tranche near the shelf, no leverage; cash stays above the 30 USDT due Nov 1; resting stop 79,150.",
"message":{"to":"midday","text":"Spot +5 USDT at 79.89k after a short squeeze to 80.15k. Reduce on a 1H close under 79,378; add on a reclaim of the 4H EMA20 (~80,406). Futures flat. Keep cash above 30 for Nov 1."},
"lesson":{"pattern":"Short squeeze into 80.0-80.13k inside a bearish-tilt range","insight":"The nearest upside pocket cleared without follow-through above the 4H EMA20; bounces into the 1H EMA20 (79,958) keep failing while longs stay crowded, so tranches stay tiny."},
"decision":{"type":"spot_buy","usd":5}}
ip=os.path.abspath('intent-20261027-morning.tmp.json');json.dump(intent,open(ip,'w'),indent=1)
res=subprocess.run(['python3','../../scripts/paper_wallet.py','--portfolio','portfolio.json','--intent',ip],capture_output=True,text=True)
print('LEDGER rc',res.returncode,res.stdout[-900:],res.stderr[-500:])
if res.returncode!=0: raise SystemExit(1)
LED=res.stdout.strip().splitlines()[-1]
open('ledger_out_morning.txt','w').write(res.stdout)
r=json.load(open('2026/10/2026-10-27-midnight.json'))
r.update({"id":"2026-10-27-morning","date":"2026-10-27","session":"morning","generatedAt":NOW,"overallBias":"range","biasTilt":"bearish","confidence":4.5})
r["priceSnapshot"]={"value":P,"currency":"USD","changePct":-0.75,"source":"OKX BTC-USDT ticker (in-page fetch)","asOf":NOW,"note":"24h open 80,488.8; 24h range 79,455.8-80,849.9. Price bounced 0.3% from the midnight print (79,653.6) after a short squeeze to 80,154.8.","sessionRange":{"low":LOW,"high":HIGH}}
r["decisionBox"]={"position":"ADD","reduceIf":{"price":79377.7,"confirmation":"A 1H close below 79,377.7 re-opens the 79,220 wick, then the estimated 76.7k long-liquidation pocket."},
"addIf":{"price":80405.8,"confirmation":"A 1H close above the 4H EMA20 (80,406) turns the bounce into a trend attempt; 80,850 and 81,130 (4H EMA50) are next, 81,850 is the trend gate."},
"invalidatesAt":81850.0,"stopOrder":{"recommended":True,"price":79150.0},
"changed":"Since midnight price rose 0.3%. Neither line fired: the 79,377.7 reduce level was not touched (low 79,505) and the 80,446 add level was not reached (high 80,154.8). A short squeeze cleared 80.0-80.13k. Another small 5 USDT spot tranche; resting stop stays at 79,150."}
r["probabilities"]={"bullish":26.0,"range":44.0,"bearish":30.0}
r["levels"]["support"]=[79505.0,79455.8,79377.7,79220.1]
r["levels"]["resistance"]=[79958.4,80154.8,80405.8,80849.9,81129.6]
r["levels"]["liquidation"]=[
{"price":80000,"side":"above","intensity":"medium","magnet":True,"note":"OKX realized liquidations, 100 most recent (fresh, 05:46-05:47 COT): about $323k SHORT at 80.0k and $159k at 80.1k, plus $4k at 79.9k. Measured, approximate (0.01 BTC contract x fill price). The squeeze already ran; the pocket is largely cleared."},
{"price":79500,"side":"below","intensity":"low","magnet":False,"note":"OKX realized liquidations: about $83k LONG at 79.5k (fresh). Measured, approximate."},
{"price":76692,"side":"below","intensity":"medium","magnet":False,"note":"Estimated leverage-bracket magnet (25x long liquidation from spot) — not exchange resting-order data."},
{"price":83082,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet (25x short liquidation from spot) — not exchange resting-order data."}]
r["levels"]["liquidityMagnet"]={"nearestAbove":83082.0,"nearestBelow":79500.0,"pull":"down","source":"OKX public liquidation-orders, long-short-account-ratio, open-interest, funding (in-page fetch)","asOf":NOW,"note":"Fresh realized flow is mostly short (about $486k short vs $83k long), so the nearest upside pocket is spent. The 1H account ratio is 2.27 (longs crowded), so the pull stays down. Upside marker is an estimate."}
r["atr"]={"value":738.81,"period":14,"pct":0.92,"source":"OKX 4H candles, Wilder ATR14","asOf":NOW}
S="OKX BTC-USDT candles, computed (EMA/RSI Wilder/MACD 12-26-9)"
def T(tf,rsi_,m,e,st,bias):return {"tf":tf,"rsi":rsi_,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":bias,"source":S,"asOf":NOW}
r["timeframes"]=[
T("15m",52.95,[12.11,-14.95,27.06],[79820.9,79871.0,79973.9,80122.1],"Price above EMA20/50 (79.82k-79.87k), still under EMA100/200; MACD turned positive","neutral, bouncing"),
T("1h",47.02,[-100.52,-107.37,6.85],[79958.4,80181.5,80579.3,81071.6],"Under the whole EMA stack; EMA20 (79,958) is the first lid; MACD below zero but histogram positive","bearish, easing"),
T("4h",39.36,[-439.53,-450.08,10.55],[80405.8,81129.6,81767.1,81996.5],"Under the whole stack, RSI 39; MACD histogram just turned positive","bearish"),
T("daily",42.43,[-490.05,-135.33,-354.71],[81743.8,80747.8,77689.1,75741.0],"Under EMA20 and EMA50, above EMA100/200; MACD below signal and zero","range, bearish tilt")]
r["operations"][1]["stop"]=79150.0;r["operations"][2]["stop"]=79150.0
r["scalpContext"]={"intradayBias":"Range 79.45k-80.45k, upward bounce stalling under the 1H EMA20: buy a held 79.5k with a tight stop, fade 79.96k-80.45k; trend flips up only above 81,850","longAbove":80405.8,"shortBelow":79377.7,"invalidates":81850.0,"note":"Scalp only the edges — live signals come from the chart, not this report."}
m=r["macro"]
for k in ("brent","dxy","us10y"): m.pop(k,None)
m["etfFlows"]={"streakDays":-2,"note":"Spot BTC ETFs per Farside: Oct 23 -137.9M, Oct 22 -635.6M after +524.8M on Oct 21; Oct 26 row still dashes (no report yet). Two straight outflow days."}
m["liquidations"]={"longsUsd":82994,"shortsUsd":486406,"skew":2.27,"traders":None,"openInterestUsd":2614233620.0,"note":"OKX realized fills, 100 most recent (fresh, 05:46-05:47 COT): about $486k short vs $83k long, mostly at 80.0-80.13k (approximate, 0.01 BTC contracts). OKX OI $2.614B (from $2.634B at midnight); funding +0.010%; 1H long/short account ratio 2.27 (longs crowded). Fear and Greed 48 (Neutral, alternative.me). Brent, DXY and US10Y could not be verified this run and are omitted."}
m["fearGreed"]=48
for ix in r["nonCrypto"]["indices"]:
    ix["note"]=ix["note"].replace("Oct 26 close (StockAnalysis); market closed, no new session yet.","Oct 26 close (StockAnalysis), last close carried: US market closed before the Oct 27 open.")
r["calibration"]={"priorReduceFired":False,"actingHelped":True,"rollingRecord":r["calibration"].get("rollingRecord",""),"note":"Midnight reduce line 79,377.7 not touched (low 79,505) and add line 80,446 not reached (high 80,154.8). The 5 USDT tranche at 79,654 is up 0.3%."}
r["sources"]=[{"title":"OKX public market API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"Farside Investors — BTC ETF flows","url":"https://farside.co.uk/btc/"},{"title":"Alternative.me Fear and Greed Index","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"StockAnalysis — QQQ, VOO, JPXN (last close carried)","url":"https://stockanalysis.com/etf/qqq/"}]
os.makedirs('2026/10',exist_ok=True)
json.dump(r,open('2026/10/2026-10-27-morning.json','w'),indent=2)
# manifest
mf=json.load(open('manifest.json'));open('manifest.json.pre-20261027-morning','w').write(json.dumps(mf))
for d in mf['days']:
    if d['date']=='2026-10-27':
        d['sessions']['morning']='data/2026/10/2026-10-27-morning.json'
        for k in ('midnight','morning','midday','endday'): d['sessions'].setdefault(k,None)
mf['latest']='data/2026/10/2026-10-27-morning.json';mf['updatedAt']=NOW
json.dump(mf,open('manifest.json','w'),indent=2)
# calibration
c=json.load(open('calibration.json'));open('calibration.json.pre-20261027-morning','w').write(json.dumps(c))
for row in c:
    if row['date']=='2026-10-27' and row['session']=='midnight':
        row.update({"reduce_fired":False,"add_fired":False,"price_next_report":P,"acting_helped":True})
c.append({"date":"2026-10-27","session":"morning","bias":"range-bear","bull_pct":26.0,"range_pct":44.0,"bear_pct":30.0,"reduce_level":79377.7,"reduce_fired":None,"add_level":80405.8,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
# narrative
md=f"""# BTC Morning Analysis — 2026-10-27

**Bias: range with a bearish tilt. Confidence 4.5/10.** Probabilities: bullish 26, range 44, bearish 30.

## Bias review
The midnight call was a range with a bearish lean and a small spot add. Price bounced 0.3% from 79,654 to {P:,.1f}. Neither trigger fired: the 79,377.7 reduce line was not touched (session low 79,505) and the 80,446 add line was not reached (high 80,154.8). The small add is up slightly.

## What changed
A short squeeze ran through 80.0-80.13k around 05:46 COT and cleared the nearest upside pocket. It found no follow-through. Open interest eased to $2.614B and funding sits at +0.010%.

## Technical read
15m: price above EMA20/50, MACD positive, RSI 53. A bounce, not yet a trend. 1H: under the whole stack, EMA20 at 79,958 is the first lid, RSI 47. 4H: under the stack, RSI 39, EMA20 at 80,406 is the add gate, MACD histogram just turned positive. Daily: under EMA20 (81,744) and EMA50 (80,748), above EMA100/200, MACD negative. ATR(14) on 4H is 739 (0.92%).

## Liquidation map
Source: OKX public API read through the browser (the direct feed is blocked from the sandbox; timestamps checked fresh). Realized flow in the last hour was about $486k of shorts, mostly at 80.0-80.13k, against $83k of longs at 79.5k. That pocket is spent. The 1H long/short account ratio is 2.27, so longs stay crowded and the pull is down. The 76.7k and 83.1k markers are labelled leverage-bracket estimates, not resting-order data.

## Macro & flows
Spot BTC ETFs: two straight outflow days (Oct 22 -635.6M, Oct 23 -137.9M); the Oct 26 row is not reported yet. Fear and Greed is 48 (Neutral). Brent, DXY and US10Y could not be verified this run and are left out. DCA signals for QQQ, VOO and JPXN carry the Oct 26 close (US market closed before the open): all three read cheap on the trailing-month view, which is a relative-cheapness read, not a bottom call.

## Paper wallet
{LED}

## The trade
A 5 USDT spot DCA tranche near the shelf, no leverage, futures flat. Reduce on a 1H close under 79,378. Add on a 1H close above the 4H EMA20 (~80,406). Resting stop at 79,150. Cash stays above the 30 USDT due Nov 1.

## Key risks
Longs are crowded while 1H and 4H momentum is still negative. A break of 79,378 opens 79,220 and the estimated 76.7k pocket. ETF outflows continue. A reclaim of 81,850 would invalidate the bearish tilt.

_Educational quantitative analysis, not individualized financial advice._
"""
os.makedirs('reports/2026/10',exist_ok=True)
open('reports/2026/10/2026-10-27-morning.md','w').write(md)
# validate
for f in ['2026/10/2026-10-27-morning.json','manifest.json','calibration.json','portfolio.json']:
    t=open(f).read();json.loads(t);assert '-04:00' not in t,f
print('OK',NOW,json.loads(open('manifest.json').read())['days'][0])
