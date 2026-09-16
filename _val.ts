import { ReportSchema, ManifestSchema } from './src/lib/types';
import fs from 'node:fs';
const r = ReportSchema.safeParse(JSON.parse(fs.readFileSync('public/data/2026/08/2026-08-31-endday.json','utf8')));
console.log('REPORT', r.success ? 'VALID' : JSON.stringify(r.error.issues.slice(0,10),null,1));
const m = ManifestSchema.safeParse(JSON.parse(fs.readFileSync('public/data/manifest.json','utf8')));
console.log('MANIFEST', m.success ? 'VALID' : JSON.stringify(m.error.issues.slice(0,10),null,1));
