import { createJiti } from 'jiti';
import fs from 'node:fs';
const jiti = createJiti(import.meta.url);
const t = await jiti.import('./src/lib/types.ts');
const D='public/data/';
const chk=(n,s,f)=>{ if(!s){console.log('NO SCHEMA',n);return;}
  const j=JSON.parse(fs.readFileSync(D+f,'utf8'));
  const r=s.safeParse(j);
  console.log(n, r.success?'VALID':'INVALID');
  if(!r.success) console.log(JSON.stringify(r.error.issues.slice(0,15),null,1));
};
console.log('schemas:',Object.keys(t).filter(k=>/Schema$/.test(k)).join(','));
chk('report 2026-09-02-midnight', t.ReportSchema, '2026/09/2026-09-02-midnight.json');
chk('report 2026-09-01-endday (prior, regression)', t.ReportSchema, '2026/09/2026-09-01-endday.json');
chk('manifest', t.ManifestSchema, 'manifest.json');
if(t.PortfolioSchema) chk('portfolio', t.PortfolioSchema, 'portfolio.json');
