import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "paper_wallet.py")
TMP = tempfile.mkdtemp()
PORT = os.path.join(TMP, "portfolio.json")
fails = []

def run(intent, expect=0):
    ip = os.path.join(TMP, "intent.json")
    json.dump(intent, open(ip, "w"))
    p = subprocess.run([sys.executable, SCRIPT, "--portfolio", PORT, "--intent", ip],
                       capture_output=True, text=True)
    if p.returncode != expect:
        fails.append(f"exit {p.returncode}!={expect} :: {p.stdout}{p.stderr}")
    return p

def load(): return json.load(open(PORT))
def check(name, cond, extra=""):
    print(("ok  " if cond else "FAIL") + " " + name + ("" if cond else f"  [{extra}]"))
    if not cond: fails.append(name)

# 1) INIT by seeder (midnight)
run({"session":"midnight","ts":"2026-07-25T02:00:00-04:00","today":"2026-07-25",
     "markPrice":64000,"isSeeder":True,"decision":{"type":"hold"}})
p=load(); check("init cash 100", p["latest"]["cashUsd"]==100.0)
check("init nextCharge = Aug 1", p["expenses"]["nextChargeAt"]=="2026-08-01", p["expenses"]["nextChargeAt"])

# 2) morning opens futures long 60usd @2x, stop 62000, tp 70000
run({"session":"morning","ts":"2026-07-25T06:50:00-04:00","today":"2026-07-25","markPrice":64000,
     "decision":{"type":"fut_open","side":"long","sizeUsd":60,"leverage":2,"stop":62000,"tp":[70000]}})
p=load(); f=p["latest"]["futures"]
check("fut open long", f["side"]=="long" and abs(f["marginUsd"]-30)<0.01, f)
check("cash after margin ~70", abs(p["latest"]["cashUsd"]-70)<0.01, p["latest"]["cashUsd"])
check("liq price set (long<entry)", f["liquidationPrice"] and f["liquidationPrice"]<64000, f["liquidationPrice"])

# 3) midday: TP 70000 hit (range low 63900 high 71000) -> auto close in profit, savings sweep
run({"session":"midday","ts":"2026-07-25T12:40:00-04:00","today":"2026-07-25","markPrice":71000,
     "sessionLow":63900,"sessionHigh":71000,"decision":{"type":"hold"}})
p=load()
check("TP auto-resolved flat", p["latest"]["futures"]["side"]=="flat", p["latest"]["action"])
check("savings swept >0", p["savingsUsd"]>0, p["savingsUsd"])
check("morning credited profit", any(r["session"]=="morning" and r["attributedPnlUsd"]>0 for r in p["scoreboard"]))

# 4) endday: spot buy 50 usd, leave message + lesson
run({"session":"endday","ts":"2026-07-25T19:30:00-04:00","today":"2026-07-25","markPrice":70000,
     "decision":{"type":"spot_buy","usd":50},"message":{"to":"midnight","text":"bought a little spot"},
     "lesson":{"pattern":"tp discipline","insight":"letting the TP fire beat holding"}})
p=load()
check("spot btc > 0", (p["latest"]["spot"]["btc"] or 0)>0, p["latest"]["spot"])
check("message stored", len(p["messages"])>=1)
check("lesson stored", len(p["lessons"])>=1)

# 5) skip rule: two skips ok, third rejected (exit 2)
for i,(sess,ts) in enumerate([("midnight","2026-07-26T02:00:00-04:00"),("morning","2026-07-26T06:50:00-04:00")]):
    run({"session":sess,"ts":ts,"today":"2026-07-26","markPrice":69000,"decision":{"type":"skip"}})
p=load(); check("consecutiveSkips=2", p["latest"]["consecutiveSkips"]==2, p["latest"]["consecutiveSkips"])
run({"session":"midday","ts":"2026-07-26T12:40:00-04:00","today":"2026-07-26","markPrice":69000,
     "decision":{"type":"skip"}}, expect=2)
check("3rd skip rejected (exit2)", True)

# 6) bankruptcy: force a due expense with tiny equity
# craft a near-empty wallet directly
p=load()
p["latest"]["cashUsd"]=1.0; p["latest"]["spot"]={"btc":0.0,"avgEntry":None,"costBasisUsd":0.0,"valueUsd":0.0}
p["latest"]["futures"]={"side":"flat","sizeUsd":0.0,"btc":None,"leverage":1,"entryPrice":None,"marginUsd":0.0,"stopPrice":None,"liquidationPrice":None,"takeProfit":[],"unrealizedPnlUsd":0.0}
p["savingsUsd"]=2.0; p["latest"]["equityUsd"]=1.0; p["latest"]["netWorthUsd"]=3.0
p["expenses"]["nextChargeAt"]="2026-08-01"
json.dump(p, open(PORT,"w"))
b0=p["bankruptcies"]
run({"session":"midnight","ts":"2026-08-01T02:00:00-04:00","today":"2026-08-01","markPrice":68000,
     "isSeeder":True,"decision":{"type":"hold"}})
p=load()
check("bankruptcy incremented", p["bankruptcies"]==b0+1, p["bankruptcies"])
check("reset cash 100", p["latest"]["cashUsd"]==100.0, p["latest"]["cashUsd"])
check("hall of shame entry", len(p["hallOfShame"])>=1)

print("\n" + ("ALL TESTS PASSED" if not fails else f"{len(fails)} FAILED: {fails}"))
sys.exit(1 if fails else 0)
