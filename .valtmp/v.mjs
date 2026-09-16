import fs from 'fs';
import { ReportSchema } from '../src/lib/types.ts';
const d = JSON.parse(fs.readFileSync('public/data/2026/09/2026-09-02-endday.json','utf8'));
const r = ReportSchema.safeParse(d);
console.log(r.success ? 'ZOD OK' : 'ZOD FAIL '+JSON.stringify(r.error.issues.slice(0,10),null,1));
