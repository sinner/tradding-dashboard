import json,copy,subprocess,sys
R='public/data'
TZ='-05:00'; NOW='2026-11-03T08:50:00'+TZ; D='2026-11-03'; ID=D+'-midnight'
px=77550.2
def rsi(c,p=14):
    g=l=0
    for i in range(1,p+1):
        d=c[i]-c[i-1]; g+=max(d,0); l+=max(-d,0)
    g/=p;l/=p
    for i in range(p+1,len(c)):
        d=c[i]-c[i-1]; g=(g*(p-1)+max(d,0))/p; l=(l*(p-1)+max(-d,0))/p
    return 100-100/(1+g/(l or 1e-9))
def dca(closes_new_first):
    c=closes_new_first[::-1]; w=c[-21:]; last=w[-1]; mn,mx=min(w),max(w)
    pct=round((last-mn)/(mx-mn)*100); m20=sum(c[-20:])/20
    r=round(rsi(c),1)
    z='very-cheap' if (pct<=10 or (pct<=20 and r<35)) else 'cheap' if pct<=30 else 'fair' if pct<=70 else 'rich'
    return {"percentileInMonth":pct,"pctVs20dAvg":round((last/m20-1)*100,2),"pctFromHigh":round((last/mx-1)*100,2),"rsi14":r,"zone":z,"note":"Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."}
Q=[681.09,690.49,715.34,725.61,721.25,712.20,704.40,704.47,725.20,717.63,718.36,709.80,728.00,728.95,743.57,746.04,751.27,747.58,757.73,759.66,756.20,749.58,742.03]
V=[691.32,694.81,707.32,709.90,707.52,703.41,698.58,702.30,710.72,706.80,704.60,701.61,709.43,707.43,715.20,715.13,715.59,711.28,714.34,716.20,712.32,707.54,702.35]
J=[100.58,100.31,101.85,102.13,102.89,102.20,101.93,102.44,103.11,102.98,102.43,102.48,102.71,103.09,104.40,104.10,104.45,103.82,104.58,105.30,105.18,104.82,103.05]
def ix(t,s,b,note,bias):
    return {"ticker":t,"price":s[0],"changePct":round((s[0]/s[1]-1)*100,2),"bias":bias,"note":note,"dcaSignal":dca(s),"source":{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/"+t.lower()+"/"}}
note="Nov 2 close %s (%s vs %s, StockAnalysis). US cash session for Nov 3 not open yet; latest verified close."
idx=[ix('QQQ',Q,0,note%(Q[0],'-1.36%',Q[1]),"Nasdaq 100 keeps sliding, a fresh 21-day low"),
     ix('VOO',V,0,note%(V[0],'-0.50%',V[1]),"S&P 500 at a 21-day low, milder than the Nasdaq"),
     ix('JPXN',J,0,note%(J[0],'+0.27%',J[1]),"Japan equities steady near the bottom of the 21-day range")]
tf=lambda tfn,r,m,e,s,b:{"tf":tfn,"rsi":r,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":s,"bias":b,"source":"OKX BTC-USDT candles (300 bars, confirmed), computed (EMA/RSI Wilder/MACD 12-26-9)","asOf":NOW}
rep={
"schemaVersion":"1.0.0","id":ID,"date":D,"session":"midnight","generatedAt":NOW,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":4.8,
"priceSnapshot":{"value":px,"currency":"USD","changePct":-0.56,"source":"OKX BTC-USDT ticker (24h open 77,984.5)","asOf":NOW,"note":"Compared with the Nov 2 endday report (76,928). Overnight low 76,386 held above the Oct 30 low (76,265) and the daily EMA200 (76,054); the bounce reclaimed the 1H EMA20/EMA50.","sessionRange":{"low":76386.0,"high":77884.6}},
"decisionBox":{"position":"ADD","reduceIf":{"price":76053.99,"confirmation":"A 1H close under the daily EMA200 (76,054), after 76,265 (Oct 30 low) breaks, would justify trimming spot."},
 "addIf":{"price":78866.5,"confirmation":"A 1H close above 78,867 (Nov 1 high) after the 4H EMA20 (77,668) and 1H EMA100 (77,839) are reclaimed would justify a bigger add."},
 "invalidatesAt":78866.5,"stopOrder":{"recommended":True,"price":75900.0},
 "changed":"Nothing fired since the Nov 2 endday call: low 76,386 held above both reduce triggers. BTC bounced 1.5% off the low, shorts were squeezed at 77.7k in the last minutes, and the 1H EMA20/EMA50 are reclaimed. The 4H and daily stacks stay bearish, so the wallet only starts a small spot tranche."},
"probabilities":{"bullish":25.0,"range":45.0,"bearish":30.0},
"levels":{"support":[77000.0,76386.0,76265.2,76053.99,75400.0],"resistance":[77667.97,77838.54,78147.4,78866.5,80000.0],
 "liquidation":[
  {"price":77750,"side":"above","intensity":"low","magnet":False,"note":"OKX realized (fresh, 13:29-13:34 UTC): about $330k of shorts liquidated at 77.65-77.85k, mostly 77.7-77.75k, plus $29k of longs. Measured, approximate (0.01 BTC contract x fill price). Small squeeze already spent."},
  {"price":75400,"side":"below","intensity":"medium","magnet":True,"note":"Estimated leverage-bracket magnet: 25x longs opened near 78.5k liquidate near 75.4k. Not exchange resting-order data. Longs stay crowded (ratio 2.71)."},
  {"price":80000,"side":"above","intensity":"low","magnet":False,"note":"Estimated leverage-bracket magnet: 25x shorts opened near 76.9k liquidate near 80.0k. Not exchange resting-order data."}],
 "liquidityMagnet":{"nearestAbove":80000.0,"nearestBelow":75400.0,"pull":"down","source":"OKX liquidation-orders, long-short-account-ratio, open-interest, funding-rate via in-page browser fetch; leverage-bracket estimates","asOf":NOW,"note":"1H long/short account ratio 2.71 (longs crowded) keeps the pull down. Forward levels are estimates, not a heatmap read; the OKX feed was fresh, so CoinGlass was not needed."}},
"atr":{"value":745.3,"period":14,"pct":0.96,"source":"OKX 4H candles, Wilder ATR14","asOf":NOW},
"timeframes":[
 tf("15m",69.39,[177.7,127.68,50.02],[77222.36,77084.78,77186.49,77383.74],"Price above the full EMA stack, RSI 69 near overbought, MACD positive and rising: a sharp bounce that may stall at 77.8k","bullish-short-term"),
 tf("1h",55.21,[-139.46,-228.78,89.33],[77102.64,77410.48,77838.54,78682.13],"Price back above EMA20/EMA50, still under EMA100/EMA200; MACD histogram turned positive but the line is below zero","neutral"),
 tf("4h",39.74,[-494.22,-480.28,-13.93],[77667.97,78683.47,79845.96,80833.96],"Under the whole stack, RSI 40; MACD far below zero with the histogram near flat","bearish"),
 tf("daily",37.37,[-1116.31,-660.43,-455.88],[80366.32,80340.54,77830.84,76053.99],"Under EMA20/50/100, 2.0% above the EMA200 (76,054); MACD histogram still widening negative, RSI 37","bearish")],
"operations":[
 {"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.2,"hold":"days-weeks"},
 {"horizon":"position","market":"spot","action":"add","entry":None,"stop":75900.0,"tp":[78866.5,80000.0],"rr":None,"confidence":4.6,"hold":"weeks-months"},
 {"horizon":"spot_core","market":"spot","action":"ADD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.6,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Bounce inside a 76.4k-77.9k range; 77,668-77,839 (4H EMA20 / 1H EMA100) caps rallies, 77,000 and 76,386 are the floor","longAbove":77839.0,"shortBelow":77000.0,"invalidates":78866.5,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":102.40,"changePct":-2.26},"dxy":{"value":101.778},"us10y":{"value":4.913},
 "etfFlows":{"streakDays":-2,"note":"US spot BTC ETFs: Oct 30 -$643.2M, Nov 2 -$398.6M (Farside); Nov 3 not yet posted. Two straight outflow days."},
 "liquidations":{"longsUsd":28933,"shortsUsd":332682,"skew":2.71,"traders":None,"openInterestUsd":2584753030.0,"note":"OKX realized fills, 100 most recent (fresh, 13:29-13:34 UTC): about $333k of shorts vs $29k of longs, a small short squeeze near 77.7k (approximate, 0.01 BTC contracts). OKX OI $2.58B, funding +0.010%, 1H long/short account ratio 2.71 (longs crowded, used as skew). Fear and Greed 26 (Fear, alternative.me)."},
 "fearGreed":26,"earnings":[]},
"nonCrypto":{"indices":idx,"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":False,"rollingRecord":"Nov 2 endday range-bear: reduce 76,063 and add 78,867 never fired; low 76,386, high 77,885 since.","note":"Compared with yesterday's endday. The 76,265 low and the daily EMA200 held, the 75,900 stop was never touched, and the 25% spot trim at 76,928 sold slightly below today's 77,550, so acting helped little."},
"sources":[{"title":"OKX public API (ticker, candles, open interest, funding, long/short ratio, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},
 {"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/history/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/history/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/history/"},
 {"title":"Farside Investors — Bitcoin ETF flows","url":"https://farside.co.uk/btc/"},{"title":"Fear and Greed Index — alternative.me","url":"https://api.alternative.me/fng/"},
 {"title":"CNBC quotes (Brent, DXY, US10Y)","url":"https://www.cnbc.com/quotes/@LCO.1"}]}
import os
os.makedirs(f'{R}/2026/11',exist_ok=True)
json.dump(rep,open(f'{R}/2026/11/{ID}.json','w'),indent=2)
# manifest
m=json.load(open(f'{R}/manifest.json'))
if not any(d['date']==D for d in m['days']):
    m['days'].insert(0,{"date":D,"sessions":{"midnight":None,"morning":None,"midday":None,"endday":None}})
day=[d for d in m['days'] if d['date']==D][0]
for k in ('midnight','morning','midday','endday'): day['sessions'].setdefault(k,None)
day['sessions']['midnight']=f'data/2026/11/{ID}.json'
m['latest']=f'data/2026/11/{ID}.json'; m['updatedAt']=NOW
json.dump(m,open(f'{R}/manifest.json','w'),indent=2)
# calibration
c=json.load(open(f'{R}/calibration.json'))
for r in c:
    if r['date']=='2026-11-02' and r['session']=='endday' and r.get('price_next_report') is None: r['price_next_report']=px
c.append({"date":D,"session":"midnight","bias":"range-bear","bull_pct":25.0,"range_pct":45.0,"bear_pct":30.0,"reduce_level":76053.99,"reduce_fired":None,"add_level":78866.5,"add_fired":None,"price_at_report":px,"price_next_report":None,"acting_helped":None})
json.dump(c,open(f'{R}/calibration.json','w'),indent=2)
intent={"session":"midnight","reportId":ID,"ts":NOW,"today":D,"markPrice":px,"sessionHigh":77884.6,"sessionLow":76386.0,"isSeeder":True,
"rationale":"The 76,386 low held above the daily EMA200 (76,054) and BTC bounced to 77.55k, reclaiming the 1H EMA20/EMA50 while shorts got squeezed. The daily and 4H stacks stay bearish and longs are crowded (2.71), so there is no edge for leverage. Cost of living is paid until Dec 1, so I deploy a small 20 USDT spot DCA tranche near support and keep about 15 USDT in cash.",
"message":{"to":"morning","text":"Added 20 USDT spot at 77.55k; futures flat. Reduce on a 1H close under 76,054; add more only above 78,867."},
"decision":{"type":"spot_buy","usd":20}}
json.dump(intent,open('intent-20261103-midnight.tmp.json','w'),indent=2)
