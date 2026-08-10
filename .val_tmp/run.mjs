import { readFileSync } from 'fs';
import { ReportSchema, ManifestSchema } from './types.js';
const base='public/data/';
const rep=JSON.parse(readFileSync(base+'2026/08/2026-08-06-endday.json','utf8'));
const r=ReportSchema.safeParse(rep);
console.log('REPORT valid:', r.success);
if(!r.success) console.log(JSON.stringify(r.error.issues,null,1).slice(0,2500));
else console.log('  divergences kept:', r.data.divergences.length, r.data.divergences[0]?.type, r.data.divergences[0]?.oscillator, '| overnightRisk chars:', r.data.overnightRisk?.length, '| indices:', r.data.nonCrypto?.indices.map(i=>i.ticker).join(','));
const man=JSON.parse(readFileSync(base+'manifest.json','utf8'));
const m=ManifestSchema.safeParse(man);
console.log('MANIFEST valid:', m.success, m.success?('days '+m.data.days.length+' latest '+m.data.latest):JSON.stringify(m.error.issues).slice(0,1500));
let bad=[];
for(const d of man.days){for(const [k,v] of Object.entries(d.sessions)){ if(!v) continue;
  const j=JSON.parse(readFileSync('public/'+v,'utf8'));
  if(!ReportSchema.safeParse(j).success) bad.push(d.date+'/'+k);}}
console.log('ALL', man.days.length,'manifest days -> reports valid:', bad.length===0, bad);
