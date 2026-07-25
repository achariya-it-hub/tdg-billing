import { useEffect } from 'react'
import { getCompanyInfo } from './getCompanyInfo'

// Print service for generating and printing KOT tickets
const PrintService = {
  // Generate KOT ticket content as HTML
  generateKOTHTML: async (kot) => {
    const company = await getCompanyInfo()
    const items = kot.items || []
    const itemsHtml = items.map((item, i) => {
      const name = item.menuItemName || item.name || 'Item'
      const qty = item.quantity || item.qty || 1
      const note = item.notes || ''
      
      // Extract custom gyros details if present
      let customDetails = ''
      if (item.customization) {
        const c = item.customization
        customDetails = `<div class="item-custom">• ${c.protein || ''} | ${c.bread || ''} bread | ${c.spread || ''} spread`
        if (c.sauces && c.sauces.length > 0) {
          customDetails += `<br/>• Sauces: ${c.sauces.join(', ')}`
        }
        if (c.veggies && c.veggies.length > 0) {
          customDetails += `<br/>• Veggies: ${c.veggies.join(', ')}`
        }
        customDetails += `</div>`
      }

      return `
        <div class="item-row">
          <span class="item-qty">${qty}x</span>
          <span class="item-name">${name}</span>
        </div>
        ${customDetails}
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
              font-weight: 900;
              color: #000;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .header { text-align: center; padding-bottom: 10px; border-bottom: 3px solid #000; margin-bottom: 10px; }
            .brand-name { font-family: 'Georgia', serif; font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #000; }
            .kot-label { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #000; margin-top: 2px; text-transform: uppercase; }
            .order-info { display: flex; justify-content: center; font-size: 10px; font-weight: 900; margin-top: 6px; color: #000; }
            .info-label { color: #000; }
            .info-value { font-weight: 900; }
            .order-number { font-size: 22px; font-weight: 900; letter-spacing: 2px; margin: 4px 0; }
            .divider { border-top: 2px dashed #000; margin: 8px 0; }
            .divider-thick { border-top: 3px solid #000; margin: 8px 0; }
            .priority-tag { display: inline-block; padding: 2px 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-radius: 2px; }
            .priority-high { background: #c1121f; color: white; }
            .priority-medium { background: #f59e0b; color: white; }
            .priority-normal { background: #10b981; color: white; }
            .col-header { display: flex; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
            .col-header .item-qty { width: 30px; }
            .col-header .item-name { flex: 1; }
            .item-row { display: flex; font-size: 12px; font-weight: 900; padding: 3px 0; }
            .item-row .item-qty { width: 30px; }
            .item-row .item-name { flex: 1; font-weight: 900; }
            .item-note { font-size: 10px; font-weight: 900; color: #000; padding-left: 30px; margin-bottom: 2px; }
            .item-custom { font-size: 10px; font-weight: 900; color: #000; padding-left: 30px; margin-bottom: 4px; line-height: 1.4; text-transform: uppercase; }
            .footer { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #000; }
            .footer-text { font-size: 10px; font-weight: 900; color: #000; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-name">${company.name || 'Ten Den Gyros'}</div>
            <div class="kot-label">Kitchen Order Ticket</div>
            <div class="order-number center">#${orderNum}</div>
            <div class="order-info center">
              <span>${createdAt} • ${orderType.toUpperCase()}</span>
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
            <div class="footer-text">${company.name || 'Ten Den Gyros'}</div>
          </div>
        </body>
      </html>
    `
  },

  // Print KOT ticket using hidden background iframe (zero user input required)
  printKOT: async (kot) => {
    console.log('Auto-printing KOT:', kot)
    try {
      const html = await PrintService.generateKOTHTML(kot)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.bottom = '-9999px'
      iframe.style.width = '80mm'
      iframe.style.height = '0px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const doc = iframe.contentDocument || iframe.contentWindow.document
      doc.open()
      doc.write(html)
      doc.close()

      setTimeout(() => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        } catch (e) {
          console.error('KOT print execution failed:', e)
        }
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
        }, 3000)
      }, 300)
    } catch (err) {
      console.error('KOT print error:', err)
    }
  },

  // Generate Bill / Invoice Receipt Content as HTML
  generateBillHTML: async (bill) => {
    const company = await getCompanyInfo()
    const items = bill.items || []
    const subtotal = bill.subtotal || items.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)), 0)
    const tax = bill.tax !== undefined ? bill.tax : subtotal * 0.05
    const total = bill.total || (subtotal + tax)
    const dateStr = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const orderNum = bill.orderNumber || bill.id || ''
    const paymentMethod = (bill.paymentMethod || 'cash').toUpperCase()

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${orderNum}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            font-weight: 900;
            width: 80mm;
            padding: 8px 12px;
            color: #000;
            line-height: 1.3;
          }
          .center { text-align: center; }
          .header { padding-bottom: 10px; border-bottom: 3px solid #000; margin-bottom: 10px; text-align: center; }
          .brand-name { font-family: 'Georgia', serif; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000; }
          .brand-details { font-size: 10px; font-weight: 900; color: #000; margin-top: 4px; line-height: 1.3; }
          .divider { border-top: 2px dashed #000; margin: 8px 0; }
          .divider-thick { border-top: 3px solid #000; margin: 8px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; margin: 3px 0; }
          .col-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .item-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; padding: 3px 0; }
          .item-name { flex: 1; font-weight: 900; }
          .item-qty { width: 30px; text-align: center; font-weight: 900; }
          .item-price { width: 55px; text-align: right; font-weight: 900; }
          .subtotal-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; padding: 4px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; padding: 8px 0; border-top: 3px solid #000; border-bottom: 3px solid #000; margin: 8px 0; }
          .footer { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #000; font-size: 10px; font-weight: 900; }
          @media print { body { width: 80mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-name">${company.name || 'Ten Den Gyros'}</div>
          <div class="brand-details">${company.address ? company.address.replace(/,\s*/g, ',<br/>') : ''}<br/>Ph: ${company.phone || ''}</div>
        </div>
        <div class="info-row"><span>Bill No:</span><span>${String(orderNum).padStart(6, '0')}</span></div>
        <div class="info-row"><span>Date & Time:</span><span>${dateStr} ${timeStr}</span></div>
        <div class="info-row"><span>Order Mode:</span><span style="text-transform:uppercase">${bill.type || 'Dine-In'} • ${paymentMethod}</span></div>
        ${bill.customerPhone ? `<div class="info-row"><span>Customer:</span><span>${bill.customerPhone}</span></div>` : ''}
        <div class="divider"></div>
        <div class="col-header"><span class="item-name">Item</span><span class="item-qty">Qty</span><span class="item-price">Amount</span></div>
        ${items.map(item => {
          const name = item.menuItemName || item.name || 'Item'
          const qty = item.quantity || item.qty || 1
          const amt = item.totalPrice || (item.unitPrice || item.price || 0) * qty
          return `<div class="item-row"><span class="item-name">${name}</span><span class="item-qty">${qty}</span><span class="item-price">₹${amt.toFixed(0)}</span></div>`
        }).join('')}
        <div class="divider"></div>
        <div class="subtotal-row"><span>Subtotal</span><span>₹${subtotal.toFixed(0)}</span></div>
        <div class="subtotal-row"><span>CGST (2.5%)</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        <div class="subtotal-row"><span>SGST (2.5%)</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        <div class="divider-thick"></div>
        <div class="total-row"><span>TOTAL</span><span>₹${total.toFixed(0)}</span></div>
        <div class="footer">
          <div>Thank You for Dining with Us!</div>
          <div>Computer Generated Tax Invoice</div>
        </div>
      </body>
      </html>
    `
  },

  // Print Bill ticket using hidden background iframe (zero user input required)
  printBill: async (bill) => {
    console.log('Auto-printing Bill:', bill)
    try {
      const html = await PrintService.generateBillHTML(bill)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.bottom = '-9999px'
      iframe.style.width = '80mm'
      iframe.style.height = '0px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const doc = iframe.contentDocument || iframe.contentWindow.document
      doc.open()
      doc.write(html)
      doc.close()

      setTimeout(() => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        } catch (e) {
          console.error('Bill print execution failed:', e)
        }
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
        }, 3000)
      }, 300)
    } catch (err) {
      console.error('Bill print error:', err)
    }
  },

  // Automatically print BOTH KOT ticket and Bill ticket without user input or popups
  printKOTAndBill: async (order) => {
    if (!order) return
    console.log('Zero-input auto-printing KOT + Bill for Order:', order)
    await PrintService.printKOT(order)
    setTimeout(async () => {
      await PrintService.printBill(order)
    }, 600)
  },

  // Print directly to POS printer (if available)
  printToPOSPrinter: async (kot) => {
    return await PrintService.printKOTAndBill(kot);
  }
};

export default PrintService;