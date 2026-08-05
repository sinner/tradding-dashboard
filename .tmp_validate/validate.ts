import { readFileSync } from 'node:fs';
import { ReportSchema, ManifestSchema, PortfolioSchema } from '../src/lib/types.ts';
const j = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const base = '/sessions/beautiful-modest-wright/mnt/tradding-dashboard/public/data';
const checks: [string, unknown, string][] = [
  ['report-midday', ReportSchema, `${base}/2026/08/2026-08-04-midday.json`],
  ['report-morning', ReportSchema, `${base}/2026/08/2026-08-04-morning.json`],
  ['report-midnight', ReportSchema, `${base}/2026/08/2026-08-04-midnight.json`],
  ['manifest', ManifestSchema, `${base}/manifest.json`],
  ['portfolio', PortfolioSchema, `${base}/portfolio.json`],
];
let bad = 0;
for (const [name, schema, path] of checks) {
  const r = (schema as { safeParse: (v: unknown) => { success: boolean; error?: { issues: unknown[] } } }).safeParse(j(path));
  if (r.success) console.log('PASS', name);
  else { bad++; console.log('FAIL', name, JSON.stringify(r.error!.issues.slice(0, 8), null, 1)); }
}
process.exit(bad ? 1 : 0);
