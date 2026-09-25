const fs = require('fs');
const path = require('path');

async function backup() {
  try {
    const res = await fetch('https://pos.tendengyros.com/api/sync/pull');
    const db = await res.json();
    const orders = db.orders || [];
    
    const filteredOrders = orders.filter(o => {
      const d = o.createdAt || o.date || '';
      return d.includes('2026-08-28') || d.includes('2026-08-29') || d.includes('2026-08-30')
          || d.includes('2026-06-28') || d.includes('2026-06-29') || d.includes('2026-06-30');
    });
    
    const outDir = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\8a1f26af-1238-4c49-9bbc-6a1de7675923\\scratch';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // 1. JSON Backup
    const jsonPath = path.join(outDir, 'backup_sales_28-30.json');
    fs.writeFileSync(jsonPath, JSON.stringify(filteredOrders, null, 2));
    
    // 2. CSV Backup
    const csvPath = path.join(outDir, 'backup_sales_28-30.csv');
    let csv = 'Order ID,Bill Number,Date,Type,Total,Payment Method,Status\n';
    
    for (const o of filteredOrders) {
      const date = o.createdAt || o.date || '';
      const billNum = o.orderNumber || '';
      const type = o.type || '';
      const total = o.total || 0;
      const method = o.paymentMethod || '';
      const status = o.status || '';
      csv += `${o.id},${billNum},${date},${type},${total},${method},${status}\n`;
    }
    fs.writeFileSync(csvPath, csv);
    
    console.log('Saved backup to:', jsonPath);
    console.log('Saved CSV to:', csvPath);
    console.log('Count:', filteredOrders.length);
    
  } catch (e) {
    console.error(e.message);
  }
}
backup();
