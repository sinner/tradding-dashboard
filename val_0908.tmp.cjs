const fs=require('fs');
const createJiti=require('jiti');
const jiti=(createJiti.default||createJiti)(__filename,{interopDefault:true,esmResolve:true});
const T=jiti('./src/lib/types.ts');
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const checks=[['report',T.ReportSchema,'public/data/2026/09/2026-09-08-midnight.json'],
 ['manifest',T.ManifestSchema,'public/data/manifest.json'],
 ['calibration',T.CalibrationSchema,'public/data/calibration.json'],
 ['portfolio',T.PortfolioSchema,'public/data/portfolio.json']];
let bad=0;
for(const [n,s,p] of checks){
  const r=s.safeParse(j(p));
  if(r.success) console.log('VALID  ',n);
  else{bad++;console.log('INVALID',n,JSON.stringify(r.error.issues.slice(0,8),null,1));}
}
const m=j('public/data/manifest.json');
const miss=m.days.filter(d=>['midnight','morning','midday','endday'].some(k=>!(k in d.sessions)));
console.log('days missing keys:',miss.length,'| total days:',m.days.length);
process.exit(bad||miss.length?1:0);
