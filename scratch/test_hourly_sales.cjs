const fs = require('fs');

const db = JSON.parse(fs.readFileSync('deploy-hostinger/server/seed-db.json', 'utf8'));
const orders = [...(db.orders || []), ...(db.ordersVault || [])];

// Filter for 2026-07-31 orders
const july31Orders = orders.filter(o => {
  const d = o.createdAt || o.paidAt || o.date || '';
  return d.includes('2026-07-31');
});

console.log(`Testing computeHourlySales on ${july31Orders.length} orders for 2026-07-31...`);

function computeHourlySales(orderList) {
  let totalRev = 0;
  const buckets = Array.from({ length: 24 }, (_, hour24) => {
    let period = hour24 >= 12 ? 'PM' : 'AM';
    let h12 = hour24 % 12;
    if (h12 === 0) h12 = 12;
    const nextH = (hour24 + 1) % 24;
    let nextPeriod = nextH >= 12 ? 'PM' : 'AM';
    let nextH12 = nextH % 12;
    if (nextH12 === 0) nextH12 = 12;
    
    const hourLabel = `${h12}${period}`;
    const timeSlot = `${String(h12).padStart(2, '0')}:00 ${period} - ${String(nextH12).padStart(2, '0')}:00 ${nextPeriod}`;
    
    return {
      hour: hour24,
      hourLabel,
      timeSlot,
      revenue: 0,
      orderCount: 0,
      avgOrder: 0,
      pct: 0
    };
  });

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
        buckets[hour24].revenue += amt;
        buckets[hour24].orderCount += 1;
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

const result = computeHourlySales(july31Orders);
const activeSlots = result.filter(b => b.orderCount > 0);

console.log(`Active hourly slots found: ${activeSlots.length}`);
activeSlots.forEach(s => {
  console.log(`  Time: ${s.timeSlot} | Bills: ${s.orderCount} | Revenue: Rs.${s.revenue} | Avg: Rs.${s.avgOrder} | Share: ${s.pct}%`);
});
