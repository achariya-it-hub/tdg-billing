const fs = require('fs');

const db = JSON.parse(fs.readFileSync('server/db.json', 'utf8'));
const orders = db.orders || [];
const ordersVault = db.ordersVault || [];

console.log(`orders count: ${orders.length}`);
console.log(`ordersVault count: ${ordersVault.length}`);

const o31 = orders.filter(o => strMatch(o, '2026-07-31'));
const v31 = ordersVault.filter(o => strMatch(o, '2026-07-31'));

function strMatch(o, dateStr) {
  const d = str(o.date) || str(o.createdAt) || str(o.paidAt) || str(o.completedAt) || '';
  return d.includes(dateStr);
}
function str(v) { return v ? String(v) : ''; }

console.log(`July 31 orders in 'orders': ${o31.length}`);
console.log(`July 31 orders in 'ordersVault': ${v31.length}`);

const o31Rev = o31.reduce((sum, o) => sum + (o.total || 0), 0);
const v31Rev = v31.reduce((sum, o) => sum + (o.total || 0), 0);

console.log(`orders July 31 total: Rs. ${o31Rev}`);
console.log(`ordersVault July 31 total: Rs. ${v31Rev}`);
console.log(`Combined count: ${o31.length + v31.length}`);
console.log(`Combined total: Rs. ${o31Rev + v31Rev}`);
