const path=require('path');
module.paths.push('/sessions/lucid-charming-hamilton/mnt/tradding-dashboard/node_modules');
const t=require('/sessions/lucid-charming-hamilton/btc/val/types.js');
const fs=require('fs');
const D='/sessions/lucid-charming-hamilton/mnt/tradding-dashboard/public/data/';
function chk(name,schema,file){
  if(!schema){console.log('NO SCHEMA',name);return;}
  const j=JSON.parse(fs.readFileSync(D+file,'utf8'));
  const r=schema.safeParse(j);
  console.log(name, r.success?'VALID':'INVALID');
  if(!r.success) console.log(JSON.stringify(r.error.issues.slice(0,10),null,1));
}
console.log('exports:',Object.keys(t).filter(k=>/Schema$/.test(k)).join(','));
chk('report(morning)',t.ReportSchema,'2026/08/2026-08-21-morning.json');
chk('report(midnight)',t.ReportSchema,'2026/08/2026-08-21-midnight.json');
chk('manifest',t.ManifestSchema,'manifest.json');
if(t.PortfolioSchema) chk('portfolio',t.PortfolioSchema,'portfolio.json');
