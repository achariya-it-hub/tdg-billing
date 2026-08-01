const fs = require('fs');

const db = JSON.parse(fs.readFileSync('deploy-hostinger/server/seed-db.json', 'utf8'));
const orders = [...(db.orders || []), ...(db.ordersVault || [])];

const july31Orders = orders.filter(o => {
  const d = o.createdAt || o.paidAt || o.date || '';
  return d.includes('2026-07-31');
});

const THREE_HOUR_SLOTS = [
  { start: 0, end: 9, label: '12:00 AM - 09:00 AM' },
  { start: 9, end: 12, label: '09:00 AM - 12:00 PM' },
  { start: 12, end: 15, label: '12:00 PM - 03:00 PM' },
  { start: 15, end: 18, label: '03:00 PM - 06:00 PM' },
  { start: 18, end: 21, label: '06:00 PM - 09:00 PM' },
  { start: 21, end: 24, label: '09:00 PM - 11:59 PM' }
];

function compute3HourSales(orderList) {
  let totalRev = 0;
  const buckets = THREE_HOUR_SLOTS.map(s => ({
    label: s.label,
    timeSlot: s.label,
    revenue: 0,
    orderCount: 0,
    avgOrder: 0,
    pct: 0
  }));

  orderList.forEach(o => {
    const amt = Number(o.total || 0);
    totalRev += amt;
    const dtVal = o.createdAt || o.paidAt || o.completedAt || o.timestamp || o.date;
    if (dtVal) {
      let hour24 = -1;
      if (typeof dtVal === 'string' && dtVal.includes('T')) {
        const timePart = dtVal.split('T')[1];
        if (timePart) {
          hour24 = parseInt(timePart.split(':')[0], 10);
        }
      }
      if (isNaN(hour24) || hour24 < 0 || hour24 > 23) {
        const d = new Date(dtVal);
        if (!isNaN(d.getTime())) hour24 = d.getHours();
      }
      if (hour24 >= 0 && hour24 <= 23) {
        const slotIdx = THREE_HOUR_SLOTS.findIndex(s => hour24 >= s.start && hour24 < s.end);
        if (slotIdx >= 0) {
          buckets[slotIdx].revenue += amt;
          buckets[slotIdx].orderCount += 1;
        }
      }
    }
  });

  buckets.forEach(b => {
    b.revenue = Math.round(b.revenue);
    b.avgOrder = b.orderCount > 0 ? Math.round(b.revenue / b.orderCount) : 0;
    b.pct = totalRev > 0 ? Number(((b.revenue / totalRev) * 100).toFixed(1)) : 0;
  });

  return buckets;
}

const result = compute3HourSales(july31Orders);
console.log("3-Hour Slot Breakdown for 2026-07-31:");
result.forEach(s => {
  console.log(`  ${s.timeSlot.padEnd(20)} | Bills: ${String(s.orderCount).padStart(2)} | Revenue: Rs.${String(s.revenue).padStart(5)} | Avg: Rs.${String(s.avgOrder).padStart(3)} | Share: ${s.pct}%`);
});
