import { useEffect } from 'react'

// Print service for generating and printing KOT tickets
const PrintService = {
  // Generate KOT ticket content as HTML
  generateKOTHTML: (kot) => {
    const itemsHtml = kot.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">${item.menuItemName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.notes || ''}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>KOT #${kot.orderNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 10px; 
              width: 3in;
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
            .priority-low { background: #e8f5e8; color: #2e7d32; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KITCHEN ORDER TICKET</div>
            <div class="order-info">
              <span>#${kot.orderNumber}</span>
              <span>${new Date(kot.createdAt).toLocaleTimeString()}</span>
              <span>${kot.type === 'dine-in' ? `T${kot.tableNumber}` : kot.type}</span>
            </div>
          </div>
          
          <div class="priority priority-${kot.priority.toLowerCase()}">${kot.priority}</div>
          
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
            ${kot.notes ? `<div>Notes: ${kot.notes}</div>` : ''}
            <div>TDG Billing System</div>
          </div>
        </body>
      </html>
    `;
  },

  // Print KOT ticket using browser print
  printKOT: (kot) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(PrintService.generateKOTHTML(kot));
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print after content loads
      printWindow.onload = () => {
        printWindow.print();
        // Optional: close window after print
        // setTimeout(() => printWindow.close(), 1000);
      };
    } else {
      alert('Please allow pop-ups for printing');
    }
  },

  // Print directly to POS printer (if available)
  printToPOSPrinter: (kot) => {
    // This would require a native print service or browser print API
    // For now, fallback to browser print
    return PrintService.printKOT(kot);
  }
};

export default PrintService;