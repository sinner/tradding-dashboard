import { readFileSync } from 'node:fs';
import * as T from './src/lib/types';
const c = JSON.parse(readFileSync('public/data/calibration.json','utf8'));
const s = (T as unknown as Record<string, { safeParse: (d: unknown) => { success: boolean; error?: { issues: unknown[] } } }>)['CalibrationSchema'];
const r = s.safeParse(c);
console.log('CalibrationSchema', r.success ? 'PASS' : 'FAIL ' + JSON.stringify(r.error!.issues.slice(0,6)));
