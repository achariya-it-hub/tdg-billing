import { useEffect } from 'react'

// Print service for generating and printing KOT tickets
const PrintService = {
  // Generate KOT ticket content as HTML
  generateKOTHTML: (kot) => {
    const items = kot.items || []
    const itemsHtml = items.map((item, i) => {
      const name = item.menuItemName || item.name || 'Item'
      const qty = item.quantity || item.qty || 1
      const note = item.notes || ''
      return `
        <div class="item-row">
          <span class="item-qty">${qty}x</span>
          <span class="item-name">${name}</span>
        </div>
        ${note ? `<div class="item-note">• ${note}</div>` : ''}
      `
    }).join('')

    const priority = kot.priority || 'normal'
    const orderNum = kot.orderNumber || kot.id || 'KOT'
    const orderType = kot.type || 'dine-in'
    const tableNum = kot.tableNumber || kot.table || ''
    const createdAt = kot.createdAt ? new Date(kot.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>KOT #${orderNum}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 80mm;
              padding: 8px 12px;
              font-size: 12px;
              color: #1a1a1a;
              line-height: 1.4;
            }
            .center { text-align: center; }
            .header { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; margin-bottom: 10px; }
            .brand-name { font-family: 'Georgia', serif; font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #c1121f; }
            .kot-label { font-size: 10px; letter-spacing: 3px; color: #666; margin-top: 2px; text-transform: uppercase; }
            .order-info { display: flex; justify-content: space-between; font-size: 10px; margin-top: 6px; }
            .info-label { color: #888; }
            .info-value { font-weight: 600; }
            .divider { border-top: 1px dashed #999; margin: 8px 0; }
            .divider-thick { border-top: 2px solid #1a1a1a; margin: 8px 0; }
            .priority-tag { display: inline-block; padding: 2px 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-radius: 2px; }
            .priority-high { background: #c1121f; color: white; }
            .priority-medium { background: #f59e0b; color: white; }
            .priority-normal { background: #10b981; color: white; }
            .col-header { display: flex; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #999; padding-bottom: 4px; margin-bottom: 4px; }
            .col-header .item-qty { width: 30px; }
            .col-header .item-name { flex: 1; }
            .item-row { display: flex; font-size: 11px; padding: 3px 0; }
            .item-row .item-qty { width: 30px; }
            .item-row .item-name { flex: 1; font-weight: 600; }
            .item-note { font-size: 9px; color: #888; padding-left: 30px; margin-bottom: 2px; }
            .footer { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #999; }
            .footer-text { font-size: 10px; color: #888; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-name">Ten Den Gyros</div>
            <div class="kot-label">Kitchen Order Ticket</div>
            <div class="order-info">
              <span><span class="info-label">KOT:</span> <span class="info-value">#${orderNum}</span></span>
              <span><span class="info-label">Time:</span> ${createdAt}</span>
              <span><span class="info-value">${orderType === 'dine-in' ? 'T: ' + tableNum : orderType.toUpperCase()}</span></span>
            </div>
          </div>

          <div class="center">
            <div class="priority-tag priority-${priority.toLowerCase()}">${priority}</div>
          </div>

          <div class="col-header">
            <span class="item-qty">Qty</span>
            <span class="item-name">Item</span>
          </div>

          ${itemsHtml}

          ${kot.notes ? `<div class="divider"></div><div style="font-size:10px;color:#666"><strong>Notes:</strong> ${kot.notes}</div>` : ''}

          <div class="footer">
            <div class="footer-text">Ten Den Gyros</div>
          </div>
        </body>
      </html>
    `
  },

  // Print KOT ticket using browser print
  printKOT: (kot) => {
    console.log('Printing KOT:', kot)
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600')
      if (!printWindow) {
        alert('Please allow pop-ups for printing')
        return
      }
      
      const html = PrintService.generateKOTHTML(kot)
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 500)
    } catch (err) {
      console.error('Print error:', err)
      alert('Failed to print: ' + err.message)
    }
  },

  // Print directly to POS printer (if available)
  printToPOSPrinter: (kot) => {
    return PrintService.printKOT(kot);
  }
};

export default PrintService;