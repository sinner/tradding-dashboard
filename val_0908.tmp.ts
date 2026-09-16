import fs from 'node:fs';
import { ReportSchema, ManifestSchema, CalibrationSchema, PortfolioSchema } from './src/lib/types';
const j = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const checks: [string, any, string][] = [
  ['report', ReportSchema, 'public/data/2026/09/2026-09-08-midnight.json'],
  ['manifest', ManifestSchema, 'public/data/manifest.json'],
  ['calibration', CalibrationSchema, 'public/data/calibration.json'],
  ['portfolio', PortfolioSchema, 'public/data/portfolio.json'],
];
let bad = 0;
for (const [name, schema, path] of checks) {
  const r = schema.safeParse(j(path));
  if (r.success) console.log('VALID  ', name);
  else { bad++; console.log('INVALID', name, JSON.stringify(r.error.issues.slice(0, 8), null, 1)); }
}
// every manifest day must carry all four keys
const m = j('public/data/manifest.json');
const missing = m.days.filter((d: any) => ['midnight','morning','midday','endday'].some(k => !(k in d.sessions)));
console.log('days missing keys:', missing.length);
process.exit(bad || missing.length ? 1 : 0);
