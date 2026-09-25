const fs = require('fs');
const path = require('path');
const baseDir = 'F:/New folder (3)/tdg/User Data';

function scanAll(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scanAll(full);
    } else if (f.endsWith('.ldb') || f.endsWith('.log')) {
      try {
        const text = fs.readFileSync(full).toString('latin1');
        if (text.includes('orderNumber') && (text.includes('2026-08-28') || text.includes('2026-08-29'))) {
          console.log('\n--- MATCH IN ---');
          console.log(full);
          const matches = text.match(/"orderNumber":(\d+).*?"total":(\d+)/g);
          if (matches) console.log(matches.slice(0, 10));
        }
      } catch(e) {}
    }
  }
}
scanAll(baseDir);
