import { readFileSync } from 'node:fs';
import * as T from './src/lib/types';
const j = JSON.parse(readFileSync('public/data/2026/08/2026-08-08-endday.json','utf8'));
const m = JSON.parse(readFileSync('public/data/manifest.json','utf8'));
const p = JSON.parse(readFileSync('public/data/portfolio.json','utf8'));
const names = Object.keys(T).filter(k=>/Schema$/.test(k));
console.log('exported schemas:', names.join(', '));
function tryIt(name:string, data:unknown){
  const s:any = (T as any)[name]; if(!s?.safeParse) return;
  const r = s.safeParse(data);
  console.log(name, r.success ? 'PASS' : 'FAIL ' + JSON.stringify(r.error.issues.slice(0,6)));
}
for (const n of names){ if(/Report/.test(n)) tryIt(n,j); }
for (const n of names){ if(/Manifest/.test(n) && !/Day/.test(n)) tryIt(n,m); }
for (const n of names){ if(/Portfolio/.test(n)) tryIt(n,p); }
