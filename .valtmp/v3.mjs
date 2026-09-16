import fs from 'fs';
import { CalibrationSchema } from '../src/lib/types.ts';
const c = JSON.parse(fs.readFileSync('public/data/calibration.json','utf8'));
const r = CalibrationSchema.safeParse(c);
console.log('CalibrationSchema', r.success?'OK':'FAIL '+JSON.stringify(r.error.issues.slice(0,5)));
