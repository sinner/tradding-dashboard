import json,subprocess,datetime,os
now=(datetime.datetime.utcnow()-datetime.timedelta(hours=5)).replace(microsecond=0)
NOW=now.isoformat()+'-05:00'
ASOF=now.replace(second=0).isoformat()+'-05:00'
P=78550.7;LOW,HIGH=76519.0,78801.7
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
    return {"percentileInMonth":pct,"pctVs20dAvg":round((last/m20-1)*100,2),"pctFromHigh":round((last/mx-1)*100,2),"rsi14":r,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}
Q=[715.34,725.61,721.25,712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03,739.77,737.93]
V=[707.32,709.90,707.52,703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35,700.86,702.46]
J=[101.85,102.13,102.89,102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05,103.42,102.33]
src=lambda t:{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/"+t.lower()+"/"}
idx=[]
for t,c,b in [("QQQ",Q,"sold off on the Oct 29 session, mid-range and about 6% under the 52-week high area"),("VOO",V,"small pullback, lower-middle of the 21-day range"),("JPXN",J,"drifting at the bottom of its 21-day range")]:
    chg=round((c[0]/c[1]-1)*100,2)
    idx.append({"ticker":t,"price":c[0],"changePct":chg,"bias":b,"note":"Oct 29 close %s (%+.2f%%, StockAnalysis). Oct 30 US session has not opened yet."%(c[0],chg),"dcaSignal":dca(c),"source":src(t)})
intent={"session":"midnight","reportId":"2026-10-30-midnight","ts":NOW,"today":"2026-10-30","markPrice":P,"sessionHigh":HIGH,"sessionLow":LOW,"isSeeder":True,
"rationale":"BTC flushed to 76,519 after the 79,350 break, then bounced 2.7% to 78,550 and stalled under the 1H EMA20 (78,971). The 76,029 reduce line and 75,900 stop held. Daily and 4H momentum is still negative, so no futures. A 20 USDT spot DCA starter tranche goes in near the flush low; cash stays above 30 for the Nov 1 cost of living.",
"message":{"to":"morning","text":"Spot is 0.00123 BTC plus a 20 USDT DCA tranche. Futures flat. Cash stays at 30 or more for Nov 1. Reduce on a 1H close under 76,044 (daily EMA200); add more only on a 1H close above 79,350."},
"lesson":{"pattern":"Cutting 30% after a break, right at the flush low","insight":"The 30% cut at 76,941 sold close to the low and BTC bounced 2% within hours. Cut on the break, not after the flush, and re-buy small near the daily EMA200 once the first bounce holds."},
"decision":{"type":"spot_buy","usd":20}}
ip=os.path.abspath('intent-20261030-midnight.tmp.json');json.dump(intent,open(ip,'w'),indent=1)
assert json.load(open(ip))['markPrice']==P
os.system('cp portfolio.json portfolio.json.pre-20261030-midnight')
res=subprocess.run(['python3','../../scripts/paper_wallet.py','--portfolio','portfolio.json','--intent',ip],capture_output=True,text=True)
print('LEDGER rc',res.returncode,res.stdout[-900:],res.stderr[-500:])
open('ledger_out_midnight.txt','w').write(res.stdout)
if res.returncode!=0: raise SystemExit(1)
r=json.load(open('2026/10/2026-10-29-endday.json'))
r.update({"id":"2026-10-30-midnight","date":"2026-10-30","session":"midnight","generatedAt":NOW,"overallBias":"range","biasTilt":"bearish","confidence":5.2})
r.pop('overnightRisk',None)
r["priceSnapshot"]={"value":P,"currency":"USD","changePct":-1.73,"source":"OKX BTC-USDT ticker (in-page fetch, ts fresh)","asOf":ASOF,"note":"24h open 79,935.3; 24h range 76,519-81,970.4. Price bounced 2.7% off the 76,519 flush low (02:00 UTC / 21:00 COT) and sits 2.1% above the endday print (76,941.2), under the 1H EMA20 (78,971).","sessionRange":{"low":LOW,"high":HIGH}}
r["decisionBox"]={"position":"ADD","reduceIf":{"price":76044.0,"confirmation":"A 1H close under the daily EMA200 (76,044); the 76,519 flush low is the first warning, 75,400 the next air pocket."},
"addIf":{"price":79350.0,"confirmation":"A 1H close above 79,350 (the broken floor), after a hold above the 1H EMA50 (79,727); 80,086 (4H EMA20) is the next gate."},
"invalidatesAt":80085.8,"stopOrder":{"recommended":True,"price":75900.0},
"changed":"Endday REDUCE stood: the 76,029 line never closed on a 1H bar and the 76,519 low held. BTC bounced to 78,801.7 and stalled. Bias eased from bearish to range with a bearish tilt; the wallet adds a small 20 USDT spot DCA tranche."}
r["probabilities"]={"bullish":24.0,"range":42.0,"bearish":34.0}
r["levels"]={"support":[76519.0,76044.0,75400.0,75000.0],"resistance":[78801.7,78971.4,79350.0,79726.9,80085.8],
"liquidation":[
{"price":78600,"side":"above","intensity":"medium","magnet":False,"note":"OKX realized (fresh, 04:32-07:00 UTC): about $816k of shorts liquidated at 78.4-78.8k, $493k of it at 78.6k, a short squeeze on the bounce. Measured, approximate (0.01 BTC contract x fill price). Largely spent."},
{"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 25x longs opened near 78.5k liquidate near 75.4k. Not exchange resting-order data."},
{"price":80100,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 77k liquidate near 80.1k, next to the 4H EMA20 (80,086). Not exchange resting-order data."}],
"liquidityMagnet":{"nearestAbove":80100.0,"nearestBelow":75400.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page fetch; leverage-bracket estimates","asOf":ASOF,"note":"OKX account ratio 2.36 means longs are still crowded, so the pull stays down. Forward levels are estimates, not a heatmap read; the CoinGlass fallback was not needed because the OKX feed was fresh."}}
r["atr"]={"value":1087.3,"period":14,"pct":1.38,"source":"OKX 4H candles, Wilder ATR14","asOf":ASOF}
S="OKX BTC-USDT candles (300 bars), computed (EMA/RSI Wilder/MACD 12-26-9)"
def T(tf,rsi_,m,e,st,bias):return {"tf":tf,"rsi":rsi_,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":bias,"source":S,"asOf":ASOF}
r["timeframes"]=[
T("15m",54.1,[100.4,13.5,86.9],[78369.7,78659.5,79241.2,79758.5],"Price above EMA20 but under EMA50/100/200; MACD turned positive: a relief bounce inside a downtrend","range"),
T("1h",42.8,[-610.3,-603.6,-6.6],[78971.4,79726.9,80157.3,80622.8],"Under every EMA, EMA20 at 78,971 is the first lid; MACD below zero but the histogram has flattened","bearish tilt"),
T("4h",39.3,[-457.3,-208.3,-249.0],[80085.8,80693.9,81347.5,81691.6],"Under the whole stack; RSI 39, MACD line well under signal and zero","bearish"),
T("daily",39.2,[-595.2,-307.4,-287.8],[81396.1,80716.4,77860.3,76044.4],"Under EMA20, EMA50 and EMA100; the 76,044 EMA200 caught the flush; MACD negative and widening","bearish")]
r["operations"]=[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":3.5,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"add","entry":None,"stop":75900.0,"tp":[79350.0,80085.8],"rr":None,"confidence":4.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.8,"hold":"long-term"}]
r["scalpContext"]={"intradayBias":"Range 76.5k-79.4k with a downward lean: the 1H EMA20 (78,971) caps rallies, the 76,519 flush low is the floor to watch","longAbove":79350.0,"shortBelow":77500.0,"invalidates":80085.8,"note":"Scalp only the edges — live signals come from the chart, not this report."}
r["macro"]={"brent":{"value":115.88,"changePct":0.87},"dxy":{"value":101.821},"us10y":{"value":4.925},
"etfFlows":{"streakDays":3,"note":"US spot BTC ETFs: month to date +$111.2M (tftc.io, updated Oct 28). The Oct 26-28 streak is inflows; Oct 28 is about +$137M, derived from month-to-date moving from -26.1M to +111.2M. Oct 29 print not yet published."},
"liquidations":{"longsUsd":180,"shortsUsd":816543,"skew":2.36,"traders":None,"openInterestUsd":2639310820.0,"note":"OKX realized fills, 100 most recent (fresh, 04:32-07:00 UTC): about $817k of shorts liquidated at 78.4-78.8k and almost no longs (approximate, 0.01 BTC contracts). OKX OI $2.639B, funding +0.009%, 1H long/short account ratio 2.36 (longs crowded, used as skew). Fear and Greed 30 (Fear, alternative.me, Oct 30 print)."},
"fearGreed":30,"earnings":[]}
r["nonCrypto"]={"indices":idx,"stockWatchlist":[]}
r["divergences"]=[]
r["calibration"]={"priorReduceFired":False,"actingHelped":False,"rollingRecord":"Endday REDUCE: the 76,028.9 line never closed on a 1H bar (flush low 76,519); the 79,350 add line was not reclaimed. Price 76,941.2 -> 78,550.7 (+2.1%) after the 30% spot cut.","note":"The cut at 76,941 came near the flush low and BTC bounced 2% since. The 75,900 stop still stands."}
r["sources"]=[{"title":"OKX public API (ticker, candles, OI, funding, long/short ratio, liquidation-orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"Bitcoin ETF flows — tftc.io","url":"https://www.tftc.io/bitcoin-etf-flows/october-2026"},{"title":"alternative.me Fear & Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"CNBC Brent, DXY and US10Y quotes","url":"https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=@LCO.1|.DXY|US10Y"},{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"},{"title":"CoinGlass heatmap not used: OKX feed was fresh; forward magnets are labelled estimates","url":"https://www.coinglass.com/pro/futures/LiquidationHeatMapModel3?coin=BTC&type=pair"}]
json.dump(r,open('2026/10/2026-10-30-midnight.json','w'),indent=2)
m=json.load(open('manifest.json'));open('manifest.json.pre-20261030-midnight','w').write(json.dumps(m))
if m['days'][0]['date']!='2026-10-30':
    m['days'].insert(0,{"date":"2026-10-30","sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
m['days'][0]['sessions']['midnight']='data/2026/10/2026-10-30-midnight.json'
m['latest']='data/2026/10/2026-10-30-midnight.json';m['updatedAt']=NOW
json.dump(m,open('manifest.json','w'),indent=2)
c=json.load(open('calibration.json'));open('calibration.json.pre-20261030-midnight','w').write(json.dumps(c))
for x in c:
    if x['date']=='2026-10-29' and x['session']=='endday':
        x['price_next_report']=P;x['reduce_fired']=False;x['add_fired']=False;x['acting_helped']=False
c.append({"date":"2026-10-30","session":"midnight","bias":"range-bear","bull_pct":24.0,"range_pct":42.0,"bear_pct":34.0,"reduce_level":76044.0,"reduce_fired":None,"add_level":79350.0,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(c,open('calibration.json','w'),indent=2)
os.makedirs('reports/2026/10',exist_ok=True)
md=f"""# BTC Midnight Analysis — 2026-10-30

Bias: range with a bearish tilt, confidence 5.2. Probabilities 24 / 42 / 34 (bull / range / bear).

## Bias review
Endday called bearish and said reduce on a 1H close under 76,029. It never fired: the flush bottomed at 76,519 and no 1H bar closed under the daily EMA200 (76,044). The 79,350 add line was not reclaimed. Price went from 76,941 to 78,551 (+2.1%), so the 30% spot cut near the low did not help.

## What changed
BTC wicked to 76,519 around 21:00 COT, then bounced to 78,801.7 and stalled under the 1H EMA20 (78,971). Bias eases from bearish to range, tilt bearish. Daily and 4H momentum stay negative.

## Technical read
15m: RSI 54.1, price above EMA20 (78,370), under EMA50 (78,660) and the rest; MACD positive. A relief bounce.
1H: RSI 42.8, under every EMA (20 at 78,971, 50 at 79,727, 200 at 80,623); MACD histogram flat at -6.6.
4H: RSI 39.3, under the whole stack (EMA20 80,086, EMA200 81,692); MACD -457 vs signal -208. ATR14 is 1,087.
Daily: RSI 39.2, under EMA20 (81,396), EMA50 (80,716) and EMA100 (77,860); EMA200 at 76,044 caught the flush. MACD -595 vs -307.

## Liquidation map
Source: OKX public API through the browser (fresh, newest fill 07:00 UTC); the CoinGlass fallback was not needed. Realized: about $816k of shorts liquidated at 78.4-78.8k ($493k at 78.6k), almost no longs. That squeeze is mostly spent. Forward magnets are labelled leverage-bracket estimates: 75,400 below (25x longs) and 80,100 above (25x shorts). Longs are still crowded (account ratio 2.36, funding +0.009%, OI $2.64B), so the pull stays down.

## Macro and flows
Brent 115.88 (+0.87%), DXY 101.82, US10Y 4.925%, Fear and Greed 30 (Fear). Spot BTC ETFs: month to date +$111.2M with a three-day inflow streak through Oct 28 (Oct 28 about +$137M, derived). DCA signals from the Oct 29 closes: QQQ 715.34, VOO 707.32, JPXN 101.85; see the dashboard for zones.

## Paper wallet
LEDGER: {res.stdout.strip()[-700:]}

## The trade
A 20 USDT spot DCA tranche near the flush low. Futures stay flat: no edge mid-range under a negative daily. Cash stays above the 30 USDT cost of living due Nov 1. Reduce on a 1H close under 76,044; add more only on a 1H close above 79,350. Resting stop at 75,900.

## Key risks
A 1H close under 76,044 opens 75,400. Longs are crowded. Brent at 115 and a 4.9% 10-year keep risk assets heavy. The UTC+8 daily candle closes at 03:00 COT.

_Educational quantitative analysis, not individualized financial advice._
"""
open('reports/2026/10/2026-10-30-midnight.md','w').write(md)
for f in ['2026/10/2026-10-30-midnight.json','manifest.json','calibration.json','portfolio.json']:
    d=json.load(open(f));print('ok',f)
print(open('2026/10/2026-10-30-midnight.json').read().count('-04:00'),open('portfolio.json').read().count('2026-10-30T')) 
