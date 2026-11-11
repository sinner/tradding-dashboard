import json,subprocess,copy
R='public/data'
NOW='2026-11-05T08:22:00-05:00'; ASOF='2026-11-05T08:20:30-05:00'
P=79629.3
rep=json.load(open(f'{R}/2026/11/2026-11-05-morning.json'))
prev=json.load(open(f'{R}/2026/11/2026-11-04-endday.json'))
rep.update({"id":"2026-11-05-midnight","session":"midnight","generatedAt":NOW,"confidence":4.9})
rep["priceSnapshot"].update({"value":P,"changePct":round((P/78353.3-1)*100,2),"source":"OKX BTC-USDT ticker (24h open 78,353.3)","asOf":ASOF,
 "note":"LATE midnight run: the 02:00 COT slot fired at 08:20 COT, after the morning report. Versus the 19:35 COT endday report (80,767): -1.41%. Spot barely moved since the 08:17 morning read (79,742). Technicals, liquidation map and macro are carried from that morning run (about 5 minutes old), only price is refreshed."})
rep["decisionBox"]["changed"]="Late midnight catch-up, no change to the plan: endday trimmed into 80.7k, BTC tagged 79,538 overnight and the 79.6k-78.9k rebuy zone is in play. Wallet already added 20 USDT at the 08:17 morning run, so this run only marks."
rep["levels"]["liquidityMagnet"]["asOf"]=ASOF
rep["levels"]["liquidityMagnet"]["note"]="Carried from the 08:17 COT morning run (OKX realized fills, fresh then). Longs still crowded (1H ratio 1.57), pull stays down. Forward levels are estimates, not a heatmap read."
for t in rep["timeframes"]: t["asOf"]=ASOF; t["source"]+=" — carried from 08:17 COT morning run"
rep["atr"]["asOf"]=ASOF
rep["macro"]["liquidations"]["note"]="Carried from the 08:17 COT morning run: "+rep["macro"]["liquidations"]["note"]
rep["calibration"]["note"]="Compared against yesterday's endday (range-bull 38/42/20, price 80,767): its reduce level 79,598 was touched overnight and the trim helped."
json.dump(rep,open(f'{R}/2026/11/2026-11-05-midnight.json','w'),indent=2,ensure_ascii=False)
intent={"session":"midnight","reportId":"2026-11-05-midnight","ts":NOW,"today":"2026-11-05","markPrice":P,"sessionHigh":80914.2,"sessionLow":79537.8,"isSeeder":True,
"rationale":"Late midnight run after the 08:17 morning run already redeployed 20 USDT into spot near 79.7k. Price is flat (79,629), so I mark the books only. No leverage: 4H EMA200 lost, no perp edge. Reduce level stays 78,866.",
"decision":{"type":"hold"}}
json.dump(intent,open('scripts/intent-20261105-midnight.tmp.json','w'))
r=subprocess.run(['python3','scripts/paper_wallet.py','--portfolio',f'{R}/portfolio.json','--intent','scripts/intent-20261105-midnight.tmp.json'],capture_output=True,text=True)
print('RC',r.returncode,r.stdout,r.stderr)
m=json.load(open(f'{R}/manifest.json'))
d=m['days'][0]; assert d['date']=='2026-11-05'
d['sessions']['midnight']='data/2026/11/2026-11-05-midnight.json'
m['latest']='data/2026/11/2026-11-05-midnight.json'; m['updatedAt']=NOW
json.dump(m,open(f'{R}/manifest.json','w'),indent=2,ensure_ascii=False)
c=json.load(open(f'{R}/calibration.json'))
row={"date":"2026-11-05","session":"midnight","bias":"range-bear","bull_pct":28.0,"range_pct":45.0,"bear_pct":27.0,"reduce_level":78866.5,"reduce_fired":None,"add_level":80582.13,"add_fired":None,"price_at_report":P,"price_next_report":None,"acting_helped":None}
c.insert(len(c)-1,row)  # before morning row (chronological)
json.dump(c,open(f'{R}/calibration.json','w'),indent=2,ensure_ascii=False)
md=f"""# BTC Midnight Analysis — 2026-11-05

**Bias: range, bearish tilt. Confidence 4.9/10.** BTC {P:,.1f} (OKX, 08:20 COT).

This midnight slot fired late, at 08:20 COT, after the morning report had already run. Price barely moved since 08:17, so technicals, liquidation map and macro are carried from the morning run and only the price is refreshed.

## Bias review
Yesterday's endday read was range-bull (38/42/20) at 80,767. It set 79,598 as the reduce level and that level was touched overnight (low 79,538). The trim helped. The 81,200 add trigger never fired.

## What changed
BTC rejected 80,914, flushed to 79,538 and now sits at 79.6k. It is under the 1H EMA20 (80,066) and the 4H EMA200 (80,582). The tilt moves from bullish to bearish.

## Technical read
15m: RSI 29, oversold, price under EMA20/50/100. 1h: RSI 47, under EMA20, above EMA50/100/200. 4h: RSI 58, back under EMA200 (80,582), sitting on EMA100 (79,682). Daily: RSI 47, under EMA20/50 (about 80.1k-80.2k), above EMA100/200. ATR14 (4H) 916, 1.15%.

## Liquidation map
Data from the morning run: OKX realized fills were fresh. About $1.15M of longs flushed at 79.5k-79.7k (magnet at 79.7k). Estimated brackets sit at 77.5k below and 82.0k above, labelled as estimates. Longs are still crowded (1H ratio 1.57, funding +0.01%, OI $2.70B), so the pull stays down.

## Macro & flows
Brent 96.67, DXY 101.61, US10Y 4.904%. Spot BTC ETFs: outflow streak broke Nov 4 with +$74.6M. Fear and Greed 50. QQQ, VOO and JPXN carry their Nov 4 close with DCA signals from that close; US markets are not open yet.

## Paper wallet
Ledger summary: see below.

## The trade
No new trade. The wallet added 20 USDT of spot at the 08:17 morning run. Reduce below 78,866 on a 1H close, invalidation 77,986. A 4H close above 80,582 would justify a bigger add.

## Key risks
Crowded longs below 79.5k, a failed 78.9k floor, and 4H EMA200 acting as resistance.

_Educational quantitative analysis, not individualized financial advice._
"""
import os
os.makedirs(f'{R}/reports/2026/11',exist_ok=True)
open(f'{R}/reports/2026/11/2026-11-05-midnight.md','w').write(md)
