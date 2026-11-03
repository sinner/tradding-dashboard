import json,copy
T="2026-11-02T16:10:00-05:00"
P=76942.6
def tf(t,rsi,m,e,st,b):
    return {"tf":t,"rsi":rsi,"macd":{"line":m[0],"signal":m[1],"hist":m[2]},"emas":{"ema20":e[0],"ema50":e[1],"ema100":e[2],"ema200":e[3]},"structure":st,"bias":b,"source":"OKX BTC-USDT candles (public API via browser), EMAs/RSI/MACD computed from 300 bars","asOf":T}
def idx(t,p,c,dca,note):
    return {"ticker":t,"price":p,"changePct":c,"bias":"bearish drift","note":note,"dcaSignal":dca,"source":{"title":t+" — StockAnalysis","url":"https://stockanalysis.com/etf/"+t.lower()+"/"}}
dn="Computed from trailing daily closes — relative-cheapness for monthly DCA, not a bottom call."
r={"schemaVersion":"1.0.0","id":"2026-11-02-morning","date":"2026-11-02","session":"morning","generatedAt":T,"asset":"BTC-USDT",
"overallBias":"range","biasTilt":"bearish","confidence":5.4,
"priceSnapshot":{"value":P,"currency":"USD","changePct":-1.26,"source":"OKX BTC-USDT ticker (24h open 77,926.7)","asOf":T,"note":"Heavy long flush at 76,700 this afternoon; price sits 1.2% above the daily EMA200 (76,041). Run executed at 16:10 COT; no midnight report existed for Nov 2, compared against the Oct 30 end-day report.","sessionRange":{"low":76700.0,"high":78866.5}},
"decisionBox":{"position":"HOLD","reduceIf":{"price":76041.0,"confirmation":"A 1H close under the daily EMA200 (76,041) after 76,265 (Oct 30 low) fails; next air pocket 75,400."},"addIf":{"price":78866.5,"confirmation":"A 1H close above 78,866 (Nov 1 high), reclaiming the 4H EMA20 (77,929) and 1H EMA100 (78,162)."},"invalidatesAt":78866.5,"stopOrder":{"recommended":True,"price":75900.0},"changed":"Floor 76,700 broke intraday: new weekly low area 76,700 with about $1.2M of longs liquidated on OKX in the last ~80 minutes. Daily EMA200 (76,041) still holds. Brent fell 8.5% and QQQ dropped 1.4%. Reduce and add lines from Friday did not fire."},
"probabilities":{"bullish":18.0,"range":42.0,"bearish":40.0},
"levels":{"support":[76700.0,76265.2,76041.0,75400.0],"resistance":[77115.0,77565.6,77795.6,78866.5,79350.0],
"liquidation":[{"price":76700.0,"side":"below","intensity":"high","magnet":True,"note":"About $1.2M of long liquidations filled at 76,700 on OKX BTC-USDT-SWAP (19:40-20:58 UTC). Realized, fresh."},{"price":76800.0,"side":"below","intensity":"low","magnet":False,"note":"About $58k long liquidations, realized."},{"price":77200.0,"side":"above","intensity":"low","magnet":False,"note":"About $34k short liquidations, realized."}],
"liquidityMagnet":{"nearestAbove":77200.0,"nearestBelow":76700.0,"pull":"down","source":"OKX public liquidation-orders (latest 100 fills), open-interest, long/short ratio","asOf":T,"note":"Longs remain crowded (ratio 2.57) after a flush; sample covers only the last ~80 minutes, not a forward heatmap."}},
"atr":{"value":1986.8,"period":14,"pct":2.58,"source":"OKX daily candles, Wilder ATR(14) computed","asOf":T},
"timeframes":[
tf("15m",41.4,[-212.5,-223.3,10.8],[77114.1,77468.5,77698.8,77711.0],"Below all EMAs; MACD hist turning slightly positive after the 76,700 flush","bearish, early stabilising"),
tf("1h",31.4,[-281.9,-152.5,-129.4],[77565.6,77795.6,78161.7,78987.9],"Under every EMA, near oversold; lower highs since Nov 1 high 78,866","bearish"),
tf("4h",35.7,[-447.1,-464.6,17.5],[77928.8,78908.9,80015.1,81017.6],"Below the full EMA stack; MACD flattening below zero","bearish"),
tf("daily",35.7,[-1243.5,-777.0,-466.4],[80039.1,80207.0,77817.1,76040.9],"Under EMA20/50/100, testing EMA200 (76,041) from above; Oct 30 low 76,265","bearish, floor at EMA200")],
"operations":[
{"horizon":"swing","market":"futures","action":"wait","entry":None,"stop":None,"tp":[],"rr":None,"confidence":4.0,"hold":"days-weeks"},
{"horizon":"position","market":"spot","action":"hold","entry":None,"stop":75900.0,"tp":[78866.5],"rr":None,"confidence":5.0,"hold":"weeks-months"},
{"horizon":"spot_core","market":"spot","action":"HOLD","entry":None,"stop":None,"tp":[],"rr":None,"confidence":6.0,"hold":"long-term"}],
"scalpContext":{"intradayBias":"Bearish below 77,115, stabilising on 15m","longAbove":77115.0,"shortBelow":76700.0,"invalidates":77796.0,"note":"Scalp only the edges — live signals come from the chart, not this report."},
"macro":{"brent":{"value":103.85,"changePct":-8.45},"dxy":{"value":101.778},"us10y":{"value":4.91},
"etfFlows":{"streakDays":1,"note":"Farside: Oct 30 outflow -643.2M, ending a 3-day inflow run. Nov 2 flow not yet published (0.0)."},
"liquidations":{"longsUsd":1254796,"shortsUsd":40415,"skew":2.57,"traders":None,"openInterestUsd":2592440604,"note":"Realized OKX BTC-USDT-SWAP liquidations in the latest 100 fills (~80 min to 20:58 UTC): longs about 1.25M, shorts about 40k. Skew is OKX 1H long/short account ratio (2.57, longs crowded). Funding 0.01%."},
"fearGreed":37,"earnings":[]},
"nonCrypto":{"indices":[
idx("QQQ",681.13,-1.36,{"percentileInMonth":0,"pctVs20dAvg":-5.98,"pctFromHigh":-10.34,"rsi14":32.5,"zone":"very-cheap","note":dn},"Nov 2 close; a one-month low, down 10% from the recent high."),
idx("VOO",691.16,-0.53,{"percentileInMonth":0,"pctVs20dAvg":-2.26,"pctFromHigh":-3.5,"rsi14":37.9,"zone":"very-cheap","note":dn},"Nov 2 close; at the bottom of its one-month range."),
idx("JPXN",100.6,0.29,{"percentileInMonth":6,"pctVs20dAvg":-2.23,"pctFromHigh":-4.46,"rsi14":37.1,"zone":"very-cheap","note":dn},"Nov 2 close; the only one of the three up on the day.")],"stockWatchlist":[]},
"divergences":[],
"calibration":{"priorReduceFired":False,"actingHelped":False,"rollingRecord":"Oct 30 end-day range-bear: reduce 76,177 and add 78,955 both did not fire through Nov 2 (low 76,700, high 78,866).","note":"Floor held at the daily EMA200 again; bearish tilt still has not paid off."},
"sources":[{"title":"OKX public API (ticker, candles, OI, funding, long/short, liquidation orders)","url":"https://www.okx.com/docs-v5/en/"},{"title":"Farside Bitcoin ETF flows","url":"https://farside.co.uk/btc/"},{"title":"CNBC quotes (DXY, US10Y, Brent)","url":"https://www.cnbc.com/quotes/.DXY"},{"title":"Alternative.me Fear & Greed","url":"https://alternative.me/crypto/fear-and-greed-index/"},{"title":"QQQ — StockAnalysis","url":"https://stockanalysis.com/etf/qqq/"},{"title":"VOO — StockAnalysis","url":"https://stockanalysis.com/etf/voo/"},{"title":"JPXN — StockAnalysis","url":"https://stockanalysis.com/etf/jpxn/"}]}
json.dump(r,open("2026/11/2026-11-02-morning.json","w"),indent=2)
# manifest
m=json.load(open("manifest.json"))
m["days"]=[d for d in m["days"] if d["date"]!="2026-11-02"]
m["days"].insert(0,{"date":"2026-11-02","sessions":{"midnight":None,"morning":"data/2026/11/2026-11-02-morning.json","midday":None,"endday":None}})
m["latest"]="data/2026/11/2026-11-02-morning.json";m["updatedAt"]=T
json.dump(m,open("manifest.json","w"),indent=2)
# calibration
c=json.load(open("calibration.json"))
rows=c if isinstance(c,list) else None
assert rows is not None
for x in rows:
    if x["date"]=="2026-10-30" and x["session"]=="endday" and x["price_next_report"] is None:
        x["price_next_report"]=P;x["reduce_fired"]=False;x["add_fired"]=False
rows.append({"date":"2026-11-02","session":"morning","bias":"range-bear","bull_pct":18.0,"range_pct":42.0,"bear_pct":40.0,"reduce_level":76041.0,"reduce_fired":None,"add_level":78866.5,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None})
json.dump(rows,open("calibration.json","w"),indent=2)
intent={"session":"morning","reportId":"2026-11-02-morning","ts":T,"today":"2026-11-02","markPrice":P,"sessionHigh":78866.5,"sessionLow":76700.0,"isSeeder":False,
"rationale":"BTC lost the 76,700 floor intraday with about 1.2M of longs flushed but still holds the daily EMA200 (76,041). Cash (30.8) is earmarked for the 30 USDT cost-of-living charge, so no new spot buy is possible and futures have no edge. Holding the existing spot position unlevered with a 75,900 stop idea.",
"message":{"to":"midday","text":"Spot unchanged, futures flat, cash reserved for the monthly charge. Reduce on a 1H close under 76,041; add only on a 1H close above 78,866."},
"lesson":{"pattern":"Repeated floor tests","insight":"Each retest of the 76.7k floor flushes crowded longs without breaking the daily EMA200. Do not add before the long/short ratio cools."},
"decision":{"type":"hold"}}
json.dump(intent,open("intent-20261102-morning.tmp.json","w"),indent=2)
