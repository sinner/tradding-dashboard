import fs from 'fs';
import * as T from '../src/lib/types.ts';
const names = Object.keys(T).filter(k=>/Schema$/.test(k));
console.log('schemas:', names.join(','));
const m = JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
for (const n of ['ManifestSchema']) {
  if (T[n]) { const r = T[n].safeParse(m); console.log(n, r.success?'OK':'FAIL '+JSON.stringify(r.error.issues.slice(0,5))); }
}
if (T.PortfolioSchema) { const p=JSON.parse(fs.readFileSync('public/data/portfolio.json','utf8')); const r=T.PortfolioSchema.safeParse(p); console.log('PortfolioSchema', r.success?'OK':'FAIL '+JSON.stringify(r.error.issues.slice(0,5))); }
