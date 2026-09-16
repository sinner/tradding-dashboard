import { createJiti } from 'jiti';
import fs from 'node:fs';
const jiti = createJiti(import.meta.url);
const t = await jiti.import('./src/lib/types.ts');
const files = [
  'public/data/2026/08/2026-08-24-midnight.json',
  'public/data/2026/08/2026-08-24-endday.json',
];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const r = t.ReportSchema.safeParse(j);
  console.log(f, r.success ? 'VALID' : 'INVALID');
  if (!r.success) console.log(JSON.stringify(r.error.issues.slice(0, 12), null, 1));
  else console.log('   divergences parsed:', r.data.divergences.length, '| indices:', r.data.nonCrypto?.indices?.length, '| liq:', r.data.levels.liquidation.length);
}
const m = JSON.parse(fs.readFileSync('public/data/manifest.json', 'utf8'));
const mr = t.ManifestSchema.safeParse(m);
console.log('manifest.json', mr.success ? 'VALID' : 'INVALID');
if (!mr.success) console.log(JSON.stringify(mr.error.issues.slice(0, 10), null, 1));
