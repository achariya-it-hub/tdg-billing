const fs = require('fs');
const path = require('path');

async function backup() {
  try {
    const dbPath = 'server/db.json';
    if (!fs.existsSync(dbPath)) return;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const orders = db.orders || [];
    
    const filteredOrders = orders.filter(o => {
      const d = o.createdAt || o.date || '';
      return d.includes('2026-08-28') || d.includes('2026-08-29') || d.includes('2026-08-30')
          || d.includes('2026-06-28') || d.includes('2026-06-29') || d.includes('2026-06-30');
    });
    
    // Output directly to the project folder
    const outDir = __dirname;
    
    // 1. JSON Backup
    const jsonPath = path.join(outDir, 'local_backup_sales_28-30.json');
    fs.writeFileSync(jsonPath, JSON.stringify(filteredOrders, null, 2));
    
    // 2. CSV Backup
    const csvPath = path.join(outDir, 'local_backup_sales_28-30.csv');
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
    
    console.log('Saved local JSON backup to:', jsonPath);
    console.log('Saved local CSV to:', csvPath);
    console.log('Count:', filteredOrders.length);
    
  } catch (e) {
    console.error(e.message);
  }
}
backup();
