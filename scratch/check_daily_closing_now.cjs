const fs = require('fs');

const db = JSON.parse(fs.readFileSync('server/db.json', 'utf8'));
const orders = db.orders || [];

const july31Orders = orders.filter(o => strMatch(o, '2026-07-31'));

function strMatch(o, dateStr) {
  const d = str(o.date) || str(o.createdAt) || str(o.paidAt) || str(o.completedAt) || '';
  return d.includes(dateStr);
}
function str(v) { return v ? String(v) : ''; }

const totalInvoices = july31Orders.length;
const totalSales = july31Orders.reduce((sum, o) => sum + (o.total || 0), 0);
const avgBasketValue = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;

console.log("Updated Daily Closing for 2026-07-31:");
console.log(`  Total Invoices: ${totalInvoices}`);
console.log(`  Total Sales: Rs. ${totalSales}`);
console.log(`  Avg Basket Value: Rs. ${avgBasketValue}`);
