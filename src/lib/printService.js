import { useEffect } from 'react'

// Print service for generating and printing KOT tickets
const PrintService = {
  // Generate KOT ticket content as HTML
  generateKOTHTML: (kot) => {
    const items = kot.items || []
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity || item.qty || 1}x</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">${item.menuItemName || item.name || 'Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.notes || ''}</td>
      </tr>
    `).join('');

    const priority = kot.priority || 'normal'
    const orderNum = kot.orderNumber || kot.id || 'KOT'
    const orderType = kot.type || 'dine-in'
    const tableNum = kot.tableNumber || kot.table || ''
    const createdAt = kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>KOT #${orderNum}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 10px; 
              width: 80mm;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px; 
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .title { 
              font-size: 20px; 
              font-weight: bold; 
              letter-spacing: 2px;
              color: #e63946;
            }
            .order-info { 
              margin: 10px 0; 
              font-size: 11px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0;
            }
            .items-table th { 
              text-align: left; 
              font-size: 10px; 
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding: 5px;
            }
            .items-table td { 
              padding: 5px;
            }
            .footer { 
              margin-top: 15px; 
              text-align: center; 
              font-size: 10px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .priority { 
              display: inline-block; 
              padding: 2px 6px; 
              border-radius: 3px; 
              font-size: 9px; 
              font-weight: bold;
              text-transform: uppercase;
            }
            .priority-high { background: #ffebee; color: #c62828; }
            .priority-medium { background: #fff8e1; color: #ef6c00; }
            .priority-low, .priority-normal { background: #e8f5e8; color: #2e7d32; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KITCHEN ORDER TICKET</div>
            <div class="order-info">
              <span><strong>#${orderNum}</strong></span> | 
              <span>${createdAt}</span> | 
              <span>${orderType === 'dine-in' ? 'Table ' + tableNum : orderType}</span>
            </div>
          </div>
          
          <div class="priority priority-${priority.toLowerCase()}">${priority}</div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Item</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            ${kot.notes ? `<div><strong>Notes:</strong> ${kot.notes}</div>` : ''}
            <div>TDG Billing System</div>
          </div>
        </body>
      </html>
    `;
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