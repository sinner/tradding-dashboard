import { readFileSync } from 'node:fs';
import * as T from './src/lib/types.ts';
const j = (p:string)=>JSON.parse(readFileSync(p,'utf8'));
const tries: [string, any, string][] = [
  ['report', (T as any).ReportSchema, 'public/data/2026/08/2026-08-09-endday.json'],
  ['manifest', (T as any).ManifestSchema, 'public/data/manifest.json'],
  ['portfolio', (T as any).PortfolioSchema, 'public/data/portfolio.json'],
];
for (const [name, schema, path] of tries) {
  if (!schema) { console.log(name, 'schema not exported, skipped'); continue; }
  const r = schema.safeParse(j(path));
  console.log(name, r.success ? 'VALID' : 'INVALID');
  if (!r.success) console.log(JSON.stringify(r.error.issues.slice(0,10), null, 1));
}
