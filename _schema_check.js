const Database = require('better-sqlite3');
const db = new Database('server/billing.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
  console.log('=== ' + t.name + ' ===');
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  cols.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')'));
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  console.log('  Rows: ' + count.c);
});
db.close();
