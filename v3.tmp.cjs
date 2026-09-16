const jiti = require('/sessions/vigilant-intelligent-ptolemy/mnt/tradding-dashboard/node_modules/.pnpm/jiti@1.21.7/node_modules/jiti')(__filename,{esmResolve:true});
const t = jiti('./src/lib/types.ts');
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('public/data/calibration.json','utf8'));
const r=t.CalibrationSchema.safeParse(j);
console.log('calibration', r.success?'VALID':'INVALID');
if(!r.success) console.log(JSON.stringify(r.error.issues.slice(0,10),null,1));
