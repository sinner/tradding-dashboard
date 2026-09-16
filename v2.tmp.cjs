const path='/sessions/vigilant-intelligent-ptolemy/mnt/tradding-dashboard/node_modules/.pnpm/jiti@1.21.7/node_modules/jiti';
const jiti = require(path)(__filename, {esmResolve:true});
const t = jiti('./src/lib/types.ts');
const fs=require('fs');
const D='/sessions/vigilant-intelligent-ptolemy/mnt/tradding-dashboard/public/data/';
const chk=(n,s,f)=>{ if(!s){console.log('NO SCHEMA',n);return;}
  const j=JSON.parse(fs.readFileSync(D+f,'utf8'));
  const r=s.safeParse(j);
  console.log(n, r.success?'VALID':'INVALID');
  if(!r.success) console.log(JSON.stringify(r.error.issues.slice(0,15),null,1));
};
console.log('schemas:',Object.keys(t).filter(k=>/Schema$/.test(k)).join(','));
chk('report 2026-09-02-midnight', t.ReportSchema, '2026/09/2026-09-02-midnight.json');
chk('report 2026-09-01-endday', t.ReportSchema, '2026/09/2026-09-01-endday.json');
chk('manifest', t.ManifestSchema, 'manifest.json');
if(t.PortfolioSchema) chk('portfolio', t.PortfolioSchema, 'portfolio.json');
