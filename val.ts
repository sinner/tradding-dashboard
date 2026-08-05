import fs from 'node:fs';
import { ReportSchema, ManifestSchema } from './src/lib/types';
const rep = JSON.parse(fs.readFileSync('public/data/2026/07/2026-07-30-midnight.json','utf8'));
const man = JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
const r1 = ReportSchema.safeParse(rep);
console.log('REPORT:', r1.success ? 'VALID' : JSON.stringify(r1.error.issues.slice(0,15), null, 1));
const r2 = ManifestSchema.safeParse(man);
console.log('MANIFEST:', r2.success ? 'VALID' : JSON.stringify(r2.error.issues.slice(0,15), null, 1));
