import { getCompanyInfoSync } from './getCompanyInfo'

// Global Print Deduplication Lock Guard (15s TTL)
const printedJobsSet = new Set()

const isAlreadyPrintedJob = (type, order) => {
  if (!order) return true
  const orderId = String(order.id || order.orderNumber || order._id || '')
  const itemsHash = (order.items || []).map(i => `${i.menuItemId || i.id || i.name}_${i.quantity || i.qty || 1}`).join(',')
  const jobKey = `${type}_${orderId}_${itemsHash}`

  if (printedJobsSet.has(jobKey)) {
    console.log(`[PRINT DEDUPLICATION] Blocked duplicate auto ${type} print job for:`, orderId)
    return true
  }
  printedJobsSet.add(jobKey)
  setTimeout(() => printedJobsSet.delete(jobKey), 15000)
  return false
}

// Print service for generating and printing KOT tickets
const PrintService = {
  // Synchronous print runner that triggers native print dialog in user gesture context
  executePrintHTML: (html, title = 'Print Ticket') => {
    try {
      const oldFrame = document.getElementById('pos_active_print_frame')
      if (oldFrame && oldFrame.parentNode) {
        oldFrame.parentNode.removeChild(oldFrame)
      }

      const iframe = document.createElement('iframe')
      iframe.id = 'pos_active_print_frame'
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.bottom = '-9999px'
      iframe.style.width = '80mm'
      iframe.style.height = '0px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const win = iframe.contentWindow
      const doc = iframe.contentDocument || win.document

      doc.open()
      doc.write(html)
      doc.close()

      const doPrint = () => {
        try {
          win.focus()
          win.print()
        } catch (err) {
          console.error('Iframe print error:', err)
          try {
            window.focus()
            window.print()
          } catch (e2) {}
        }
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
        }, 3000)
      }

      setTimeout(doPrint, 100)
    } catch (e) {
      console.error('Print execution error:', e)
    }
  },

  // Generate KOT ticket content as HTML (Synchronous)
  generateKOTHTML: (kot) => {
    const company = getCompanyInfoSync()
    const items = kot.items || []
    const itemsHtml = items.map((item) => {
      const name = item.menuItemName || item.name || 'Item'
      const qty = item.quantity || item.qty || 1
      const note = item.notes || ''

      let customDetails = ''
      if (item.customization) {
        const c = item.customization
        const parts = []
        if (c.gyro1) parts.push(c.gyro1)
        if (c.gyro2) parts.push(c.gyro2)
        if (c.drink) parts.push(`Drink: ${c.drink}`)
        if (!c.gyro1) {
          if (c.protein) parts.push(`Protein: ${c.protein}`)
          if (c.bread) parts.push(`Bread: ${c.bread}`)
          if (c.spread) parts.push(`Spread: ${c.spread}`)
          if (c.sauces && c.sauces.length > 0) parts.push(`Sauces: ${c.sauces.join(', ')}`)
          if (c.veggies && c.veggies.length > 0) parts.push(`Veggies: ${c.veggies.join(', ')}`)
        }
        if (parts.length > 0) {
          customDetails = `<div class="item-custom">• ${parts.join('<br/>• ')}</div>`
        }
      }

      return `
        <div class="item-row">
          <span class="item-qty">${qty}x</span>
          <span class="item-name">${name}</span>
        </div>
        ${customDetails}
        ${note ? `<div class="item-note">>> NOTE: ${note}</div>` : ''}
      `
    }).join('')

    const priority = kot.priority || 'NORMAL'
    const orderNum = kot.orderNumber || kot.id || '1001'
    const orderType = (kot.type || 'dine-in').toUpperCase()
    const tableNum = kot.tableNumber || kot.table || ''
    const createdAt = kot.createdAt ? new Date(kot.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

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
              font-family: 'Helvetica Neue', Arial, 'Segoe UI', sans-serif;
              width: 76mm;
              margin: 0 auto;
              padding: 6px 8px;
              font-size: 13px;
              color: #000;
              line-height: 1.25;
              -webkit-print-color-adjust: exact;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .header { text-align: center; padding-bottom: 6px; border-bottom: 2px solid #000; margin-bottom: 8px; }
            .brand-name { font-size: 17px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
            .kot-title { display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; background: #000; color: #fff; padding: 3px 12px; border-radius: 3px; margin: 4px 0 6px; }
            .order-badge-container { border: 2px solid #000; border-radius: 6px; padding: 6px; margin: 6px 0; background: #fff; text-align: center; }
            .order-number { font-size: 26px; font-weight: 900; letter-spacing: 1px; line-height: 1; }
            .order-meta { font-size: 11px; font-weight: 900; margin-top: 4px; text-transform: uppercase; }
            .col-header { display: flex; font-size: 11px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding: 4px 0; margin-bottom: 6px; }
            .col-header .item-qty { width: 36px; text-align: left; }
            .col-header .item-name { flex: 1; }
            .item-row { display: flex; font-size: 14px; font-weight: 900; padding: 4px 0; border-bottom: 1px dashed #ccc; }
            .item-qty { width: 36px; font-size: 16px; font-weight: 900; }
            .item-name { flex: 1; font-weight: 900; text-transform: uppercase; }
            .item-note { font-size: 11px; font-weight: 900; background: #eee; padding: 3px 6px; border-left: 3px solid #000; margin: 3px 0 5px 36px; }
            .item-custom { font-size: 11px; font-weight: 700; color: #222; margin: 2px 0 6px 36px; line-height: 1.3; }
            .footer { text-align: center; margin-top: 10px; padding-top: 6px; border-top: 2px solid #000; font-size: 10px; font-weight: 900; text-transform: uppercase; }
            @media print { body { width: 76mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-name">${company.name || 'Ten Dens Gyros'}</div>
            <div><span class="kot-title">Kitchen Order Ticket</span></div>
          </div>

          <div class="order-badge-container">
            <div class="order-number">ORDER #${orderNum}</div>
            <div class="order-meta">${orderType} ${tableNum ? `• TABLE ${tableNum}` : ''} • ${createdAt}</div>
          </div>

          <div class="col-header">
            <span class="item-qty">QTY</span>
            <span class="item-name">ITEM DETAILS</span>
          </div>

          ${itemsHtml}

          ${kot.notes ? `<div style="margin-top:8px;padding:6px;border:1px solid #000;font-size:11px;font-weight:900"><strong>ORDER NOTES:</strong> ${kot.notes}</div>` : ''}

          <div class="footer">
            --- END OF KOT ---
          </div>
        </body>
      </html>
    `
  },

  // Print KOT ticket
  printKOT: (kot, force = false) => {
    if (!force && isAlreadyPrintedJob('kot', kot)) return
    console.log('Printing KOT:', kot)
    try {
      const html = PrintService.generateKOTHTML(kot)
      PrintService.executePrintHTML(html, `KOT #${kot.orderNumber || kot.id || ''}`)
    } catch (err) {
      console.error('KOT print error:', err)
    }
  },

  // Generate Bill / Invoice Receipt Content as HTML (Synchronous)
  generateBillHTML: (bill) => {
    const company = getCompanyInfoSync()
    const items = bill.items || []
    const subtotal = bill.subtotal || items.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)), 0)
    const tax = bill.tax !== undefined ? bill.tax : subtotal * 0.05
    const total = bill.total || (subtotal + tax)
    const dateStr = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const orderNum = bill.orderNumber || bill.id || '1001'
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
            font-family: 'Helvetica Neue', Arial, 'Segoe UI', sans-serif;
            width: 76mm;
            margin: 0 auto;
            padding: 6px 8px;
            font-size: 12px;
            color: #000;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .header { text-align: center; padding-bottom: 8px; border-bottom: 2px solid #000; margin-bottom: 6px; }
          .brand-name { font-size: 20px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; }
          .brand-address { font-size: 10px; font-weight: 700; color: #222; margin-top: 3px; line-height: 1.35; }
          .invoice-badge { display: inline-block; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #000; padding: 2px 8px; border-radius: 3px; margin-top: 5px; }
          .meta-section { margin: 6px 0; font-size: 11px; font-weight: 800; border-bottom: 1px dashed #000; padding-bottom: 6px; }
          .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .col-header { display: flex; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding: 4px 0; margin-bottom: 4px; }
          .col-header .col-item { flex: 1; }
          .col-header .col-qty { width: 32px; text-align: center; }
          .col-header .col-price { width: 45px; text-align: right; }
          .col-header .col-amt { width: 55px; text-align: right; }
          .item-row { display: flex; font-size: 11.5px; font-weight: 800; padding: 3px 0; border-bottom: 1px dotted #ccc; align-items: flex-start; }
          .item-name { flex: 1; word-break: break-word; }
          .item-qty { width: 32px; text-align: center; font-weight: 900; }
          .item-price { width: 45px; text-align: right; }
          .item-amt { width: 55px; text-align: right; font-weight: 900; }
          .totals-section { margin-top: 6px; font-size: 11px; font-weight: 800; }
          .total-row-sub { display: flex; justify-content: space-between; padding: 2px 0; }
          .total-box { display: flex; justify-content: space-between; font-size: 17px; font-weight: 900; padding: 6px 8px; border: 2px solid #000; border-radius: 4px; margin: 8px 0 4px; background: #fff; }
          .footer { text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px dashed #000; font-size: 10px; font-weight: 800; line-height: 1.4; }
          @media print { body { width: 76mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-name">${company.name || 'Tendens Gyros'}</div>
          <div class="brand-address">
            ${company.address ? company.address.replace(/,\s*/g, ',<br/>') : 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram'}<br/>
            Ph: <strong>${company.phone || '8877661150'}</strong><br/>
            GSTIN: <strong>${company.gstNo || company.gst || company.gstin || '33FJSPA2544H1Z9'}</strong><br/>
            Email: <strong>${company.email || company.mailId || 'info@tendengyros.com'}</strong>
          </div>
          <div><span class="invoice-badge">Tax Invoice</span></div>
        </div>

        <div class="meta-section">
          <div class="meta-row"><span>Bill No: <strong>#${String(orderNum).padStart(6, '0')}</strong></span><span>KOT No: <strong>${bill.kotNumber || (bill.orderNumber ? `KOT-${bill.orderNumber}` : `KOT-${orderNum}`)}</strong></span></div>
          <div class="meta-row"><span>Date: ${dateStr}</span><span>Time: ${timeStr}</span></div>
          <div class="meta-row"><span>Mode: <strong>${(bill.type || 'DINE-IN').toUpperCase()}</strong></span><span>Payment: <strong>${paymentMethod}</strong></span></div>
          ${(bill.customerName || bill.customerPhone) ? `<div class="meta-row">${bill.customerName ? `<span>Cust: <strong>${bill.customerName}</strong></span>` : ''}${bill.customerPhone ? `<span>Mob: <strong>${bill.customerPhone}</strong></span>` : ''}</div>` : ''}
        </div>

        <div class="col-header">
          <span class="col-item">Item</span>
          <span class="col-qty">Qty</span>
          <span class="col-price">Rate</span>
          <span class="col-amt">Amt (₹)</span>
        </div>

        ${items.map(item => {
          const name = item.menuItemName || item.name || 'Item'
          const qty = item.quantity || item.qty || 1
          const unitPrice = item.unitPrice || item.price || 0
          const amt = item.totalPrice || unitPrice * qty

          let custDetails = ''
          if (item.customization) {
            const c = item.customization
            const parts = []
            if (c.gyro1) parts.push(c.gyro1)
            if (c.gyro2) parts.push(c.gyro2)
            if (c.drink) parts.push(`Drink: ${c.drink}`)
            if (!c.gyro1) {
              if (c.bread) parts.push(`Bread: ${c.bread}`)
              if (c.protein) parts.push(`Protein: ${c.protein}`)
              if (c.sauces && c.sauces.length) parts.push(`Sauces: ${c.sauces.join(', ')}`)
              if (c.veggies && c.veggies.length) parts.push(`Veggies: ${c.veggies.join(', ')}`)
            }
            if (c.notes) parts.push(`Note: ${c.notes}`)
            if (parts.length > 0) {
              custDetails = `<div style="font-size:10px; font-weight:700; color:#333; margin:2px 0 4px 10px; line-height:1.2;">• ${parts.join('<br/>• ')}</div>`
            }
          }

          return `
            <div class="item-row">
              <span class="item-name">${name}</span>
              <span class="item-qty">${qty}</span>
              <span class="item-price">${unitPrice.toFixed(0)}</span>
              <span class="item-amt">${amt.toFixed(0)}</span>
            </div>
            ${custDetails}
          `
        }).join('')}

        <div class="totals-section">
          ${bill.discount > 0 || bill.inaugurationOffer || bill.specialOffer20 ? `
            <div class="total-row-sub"><span>Subtotal:</span><span>₹${(bill.rawSubtotal || (subtotal + (bill.discount || 0))).toFixed(0)}</span></div>
            <div class="total-row-sub" style="font-weight:900"><span>${bill.inaugurationOffer ? 'Inauguration Offer (50% OFF)' : 'Special Offer (20% OFF)'}:</span><span>-₹${(bill.discount || 0).toFixed(0)}</span></div>
          ` : `
            <div class="total-row-sub"><span>Subtotal:</span><span>₹${subtotal.toFixed(0)}</span></div>
          `}
          <div class="total-row-sub"><span>CGST (2.5%):</span><span>₹${(tax / 2).toFixed(0)}</span></div>
          <div class="total-row-sub"><span>SGST (2.5%):</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        </div>

        <div class="total-box">
          <span>NET TOTAL:</span>
          <span>₹${total.toFixed(0)}</span>
        </div>

        <div class="footer">
          <div><strong>Thank You for Dining at Ten Dens Gyros!</strong></div>
          <div>Visit Us Again • www.tendengyros.com</div>
        </div>
      </body>
      </html>
    `
  },

  // Print Bill ticket
  printBill: (bill, force = false) => {
    if (!force && isAlreadyPrintedJob('bill', bill)) return
    console.log('Printing Bill:', bill)
    try {
      const html = PrintService.generateBillHTML(bill)
      PrintService.executePrintHTML(html, `Invoice #${bill.orderNumber || bill.id || ''}`)
    } catch (err) {
      console.error('Bill print error:', err)
    }
  },

  // Automatically print BOTH KOT ticket and Bill ticket
  printKOTAndBill: (order, force = false) => {
    if (!order) return
    if (!force && isAlreadyPrintedJob('kot_and_bill', order)) return
    console.log('Printing KOT + Bill for Order:', order)
    try {
      const kotHtml = PrintService.generateKOTHTML(order)
      const billHtml = PrintService.generateBillHTML(order)
      const combinedHtml = `
        ${kotHtml}
        <div style="page-break-before: always; break-before: page; margin-top: 20px;"></div>
        ${billHtml}
      `
      PrintService.executePrintHTML(combinedHtml, `Order #${order.orderNumber || order.id || ''}`)
    } catch (err) {
      console.error('KOT + Bill combined print error:', err)
    }
  },

  // Print directly to POS printer
  printToPOSPrinter: (kot, force = false) => {
    return PrintService.printKOTAndBill(kot, force);
  }
};

export default PrintService;