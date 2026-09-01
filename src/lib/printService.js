
const getComboItemsBreakdown = (item) => {
  if (!item) return []
  const name = (item.menuItemName || item.name || '').toLowerCase()
  const c = (typeof item.customization === 'object' && item.customization !== null) ? item.customization : {}

  const protein = item.protein || item.proteinType || c.protein || ''
  const drink = item.drink || c.drink || ''
  const dips = item.dips || c.dips || ''
  const gyro1 = item.gyro1 || c.gyro1 || ''
  const gyro2 = item.gyro2 || c.gyro2 || ''
  const bread = item.bread || c.bread || ''
  const spread = item.spread || c.spread || ''
  const flavor = item.flavor || c.flavor || ''
  const seasoning = item.seasoning || c.seasoning || 'Salted'

  const itemsList = []

  if (name.includes('express meal')) {
    const gyroDesc = protein ? `${protein} Gyro` : 'Gyro Wrap'
    const gyroOpts = [flavor, spread ? `${spread} Spread` : '', bread ? `${bread} Pita` : ''].filter(Boolean).join(', ')
    itemsList.push(`1x ${gyroDesc}${gyroOpts ? ` (${gyroOpts})` : ''}`)
    itemsList.push(`1x Regular Drink${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('signature gyro meal') || name.includes('sig gyro meal')) {
    const gyroDesc = protein ? `${protein} Gyro` : 'Signature Gyro Wrap'
    const gyroOpts = [flavor, spread ? `${spread} Spread` : '', bread ? `${bread} Pita` : ''].filter(Boolean).join(', ')
    itemsList.push(`1x ${gyroDesc}${gyroOpts ? ` (${gyroOpts})` : ''}`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`1x Regular Drink${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('lebanese rice box') || name.includes('rice box')) {
    const riceDesc = protein ? `Lebanese Rice Bowl (${protein})` : 'Lebanese Rice Bowl'
    itemsList.push(`1x ${riceDesc}`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`1x Regular Drink${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('classic gyro meal')) {
    const gyroDesc = protein ? `${protein} Gyro` : 'Gyro Wrap'
    const gyroOpts = [flavor, spread ? `${spread} Spread` : '', bread ? `${bread} Pita` : ''].filter(Boolean).join(', ')
    itemsList.push(`1x ${gyroDesc}${gyroOpts ? ` (${gyroOpts})` : ''}`)
    itemsList.push(`2x Crispy Chicken Wings`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`1x Regular Drink${drink ? ` (${drink})` : ''}`)
    itemsList.push(`1x Choice Dip${dips ? ` (${dips})` : ''}`)
  } else if (name.includes('duo gyro feast')) {
    itemsList.push(`1x ${gyro1 || 'Gyro 1 (Chicken/Paneer)'}`)
    itemsList.push(`1x ${gyro2 || 'Gyro 2 (Chicken/Paneer)'}`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`2x Regular Drinks${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('double crunch box')) {
    itemsList.push(`1x ${gyro1 || 'Gyro 1'}`)
    itemsList.push(`1x ${gyro2 || 'Gyro 2'}`)
    itemsList.push(`6x Crispy Chicken Wings`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`2x Regular Drinks${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('mega feast meal')) {
    itemsList.push(`1x ${gyro1 || 'Gyro 1'}`)
    itemsList.push(`1x ${gyro2 || 'Gyro 2'}`)
    itemsList.push(`2x Crispy Leg & Thighs`)
    itemsList.push(`2x Crispy Chicken Wings`)
    itemsList.push(`2x Crispy Chicken Strips`)
    itemsList.push(`1x French Fries (${seasoning})`)
    itemsList.push(`2x Regular Drinks${drink ? ` (${drink})` : ''}`)
    itemsList.push(`3x Choice Dips${dips ? ` (${dips})` : ''}`)
  } else if (name.includes('den\'s party meal') || name.includes('party meal')) {
    itemsList.push(`1x ${gyro1 || 'Gyro 1'}`)
    itemsList.push(`1x ${gyro2 || 'Gyro 2'}`)
    itemsList.push(`6x Crispy Chicken Wings`)
    itemsList.push(`4x Crispy Leg & Thighs`)
    itemsList.push(`2x French Fries (${seasoning})`)
    itemsList.push(`3x Regular Drinks${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('super 5 bucket') || name.includes('super 5')) {
    itemsList.push(`5x Crispy Leg & Thighs`)
    itemsList.push(`10x Crispy Chicken Wings`)
    itemsList.push(`10x Crispy Chicken Strips`)
    itemsList.push(`5x Regular Drinks${drink ? ` (${drink})` : ''}`)
  } else if (name.includes('wednesday combo - 1') || name.includes('wednesday combo 1')) {
    const gyroDesc = protein ? `${protein} Gyro` : 'Gyro Wrap'
    const gyroOpts = [flavor, spread ? `${spread} Spread` : '', bread ? `${bread} Pita` : ''].filter(Boolean).join(', ')
    itemsList.push(`1x ${gyroDesc}${gyroOpts ? ` (${gyroOpts})` : ''}`)
    itemsList.push(`1x Crispy Leg & Thigh`)
    itemsList.push(`2x Crispy Chicken Wings`)
    itemsList.push(`2x Crispy Chicken Strips`)
  } else if (name.includes('wednesday combo - 2') || name.includes('wednesday combo 2') || name.includes('wednesday combo')) {
    const gyroDesc = protein ? `${protein} Gyro` : 'Gyro Wrap'
    const gyroOpts = [flavor, spread ? `${spread} Spread` : '', bread ? `${bread} Pita` : ''].filter(Boolean).join(', ')
    itemsList.push(`1x ${gyroDesc}${gyroOpts ? ` (${gyroOpts})` : ''}`)
    itemsList.push(`2x Crispy Leg & Thighs`)
    itemsList.push(`2x Crispy Chicken Wings`)
    itemsList.push(`2x Crispy Chicken Strips`)
  } else if (gyro1 || gyro2 || (drink && (name.includes('meal') || name.includes('combo') || name.includes('box') || name.includes('feast') || name.includes('bucket')))) {
    if (gyro1) itemsList.push(`1x ${gyro1}`)
    if (gyro2) itemsList.push(`1x ${gyro2}`)
    if (protein && !gyro1) itemsList.push(`1x ${protein} Wrap/Bowl`)
    itemsList.push(`1x French Fries (${seasoning})`)
    if (drink) itemsList.push(`1x Regular Drink (${drink})`)
    if (dips) itemsList.push(`1x Choice Dip (${dips})`)
  }

  return itemsList
}

const getPrintItemDetailsList = (item) => {
  if (!item) return []
  const details = []
  const c = (typeof item.customization === 'object' && item.customization !== null) ? item.customization : {}

  // Include full items breakdown for Combo Meals
  const comboBreakdown = getComboItemsBreakdown(item)
  if (comboBreakdown.length > 0) {
    details.push(`[INCLUDED COMBO ITEMS]`)
    comboBreakdown.forEach(cb => details.push(` ${cb}`))
  }

  let protein = item.protein || item.proteinType || item.variant || item.variantName || item.selectedVariant || c.protein || c.proteinType || c.variant
  if (!protein) {
    const itemNameLower = (item.menuItemName || item.name || '').toLowerCase()
    const custStr = typeof item.customization === 'string' ? item.customization : JSON.stringify(c)
    const notesStr = item.notes || item.instruction || c.notes || ''
    const combinedStr = `${itemNameLower} ${custStr} ${notesStr}`
    if (/paneer/i.test(combinedStr)) protein = 'Paneer'
    else if (/chicken/i.test(combinedStr)) protein = 'Chicken'
  }
  if (protein && comboBreakdown.length === 0) details.push(`Protein: ${protein}`)

  const bread = item.bread || item.breadType || c.bread || c.breadType
  if (bread && comboBreakdown.length === 0) details.push(`Bread: ${bread}`)

  const flavor = item.flavor || c.flavor
  if (flavor && comboBreakdown.length === 0) details.push(`Flavor: ${flavor}`)

  const spread = item.spread || item.spreadType || c.spread
  if (spread && comboBreakdown.length === 0) details.push(`Spread: ${spread}`)

  const gyro1 = item.gyro1 || c.gyro1
  if (gyro1 && comboBreakdown.length === 0) details.push(`Gyro 1: ${gyro1}`)
  const gyro2 = item.gyro2 || c.gyro2
  if (gyro2 && comboBreakdown.length === 0) details.push(`Gyro 2: ${gyro2}`)

  const drink = item.drink || c.drink
  if (drink && comboBreakdown.length === 0) details.push(`Drink: ${drink}`)

  const dips = item.dips || c.dips
  if (dips && comboBreakdown.length === 0) details.push(`Dips: ${dips}`)

  const sauces = item.sauces || c.sauces
  if (Array.isArray(sauces) && sauces.length > 0) {
    details.push(`Sauces: ${sauces.join(', ')}`)
  } else if (typeof sauces === 'string' && sauces.trim()) {
    details.push(`Sauces: ${sauces.trim()}`)
  }

  const veggies = item.veggies || c.veggies
  if (Array.isArray(veggies) && veggies.length > 0) {
    details.push(`Veggies: ${veggies.join(', ')}`)
  } else if (typeof veggies === 'string' && veggies.trim()) {
    details.push(`Veggies: ${veggies.trim()}`)
  }

  const addons = item.addons || item.addOns || c.addons
  if (Array.isArray(addons) && addons.length > 0) {
    const addStr = addons.map(a => typeof a === 'object' ? (a.name || a.title) : a).filter(Boolean).join(', ')
    if (addStr) details.push(`Add-ons: ${addStr}`)
  } else if (typeof addons === 'string' && addons.trim()) {
    details.push(`Add-ons: ${addons.trim()}`)
  }

  if (typeof item.customization === 'string' && item.customization.trim()) {
    details.push(`Details: ${item.customization.trim()}`)
  }
  if (typeof item.details === 'string' && item.details.trim()) {
    details.push(`Details: ${item.details.trim()}`)
  }

  const notes = item.notes || item.instruction || c.notes
  if (notes) details.push(`Note: ${notes}`)

  return [...new Set(details)]
}

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
      const detailsList = getPrintItemDetailsList(item)
      if (detailsList.length > 0) {
        customDetails = `<div class="item-custom">• ${detailsList.join('<br/>• ')}</div>`
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
    const createdDate = kot.createdAt ? new Date(kot.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const createdTime = kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

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
            <div class="brand-name">${company.name || 'Tendens Gyros'}</div>
            <div><span class="kot-title">Kitchen Order Ticket</span></div>
          </div>

          <div class="order-badge-container">
            <div class="order-number">ORDER #${orderNum}</div>
            <div class="order-meta">${orderType} ${tableNum ? `• TABLE ${tableNum}` : ''}</div>
            <div class="order-meta" style="font-size: 10.5px; margin-top: 3px; font-weight: 800;">DATE: ${createdDate} • TIME: ${createdTime}</div>
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
    const rawSub = bill.rawSubtotal || items.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)), 0)
    let discountAmt = Number(bill.discount || bill.discountGiven || bill.discountAmount || 0)
    if (discountAmt === 0) {
      if (bill.inaugurationOffer) discountAmt = Math.round(rawSub * 0.5)
      else if (bill.specialOffer20) discountAmt = Math.round(rawSub * 0.2)
      else if (bill.vip50) discountAmt = Math.round(rawSub * 0.5)
      else if (bill.discountPct > 0) discountAmt = Math.round(rawSub * (bill.discountPct / 100))
    }
    const netSub = Math.max(0, rawSub - discountAmt)
    const tax = Math.round(netSub * 0.05)
    const total = bill.total !== undefined ? bill.total : Math.round(netSub + tax)
    const dateStr = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const orderNum = bill.orderNumber || bill.id || '1001'
    const kotNum = bill.kotNumber || bill.orderNumber || bill.id
    let paymentMethod = (bill.paymentMethod || 'cash').toUpperCase()
    if ((bill.paymentMethod === 'split' || bill.splitPayments) && bill.splitPayments) {
      const parts = []
      if (bill.splitPayments.cash) parts.push(`Cash: ₹${bill.splitPayments.cash}`)
      if (bill.splitPayments.upi) parts.push(`UPI: ₹${bill.splitPayments.upi}`)
      if (bill.splitPayments.card) parts.push(`Card: ₹${bill.splitPayments.card}`)
      if (parts.length > 0) paymentMethod = `SPLIT (${parts.join(', ')})`
    }
    const discountLabel = bill.discountName || (bill.inaugurationOffer ? 'Inauguration Offer 50%' : (bill.specialOffer20 ? 'Special Offer 20%' : 'Discount'))

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
            Ph: <strong>${company.phone || '7548808877'}</strong><br/>
            GSTIN: <strong>${company.gstNo || company.gst || company.gstin || '33FJSPA2544H1Z9'}</strong><br/>
            Email: <strong>${company.email || company.mailId || 'info@tendengyros.com'}</strong>
          </div>
          <div><span class="invoice-badge">Tax Invoice</span></div>
        </div>

        <div class="meta-section">
          <div class="meta-row"><span>Bill No: <strong>#${String(orderNum).padStart(6, '0')}</strong></span><span>KOT No: <strong>${kotNum ? `KOT-${kotNum}` : `KOT-${orderNum}`}</strong></span></div>
          <div class="meta-row"><span>Date: ${dateStr}</span><span>Time: ${timeStr}</span></div>
          <div class="meta-row"><span>Source: <strong>${bill.orderSource || ((bill.source === 'qr_self_order' || bill.source === 'self_order' || bill.source === 'kiosk') ? 'Kiosk' : ((bill.source === 'mobile' || bill.source === 'mobile_app' || bill.source === 'app') ? 'APP' : 'POS'))}</strong></span><span>Mode: <strong>${(bill.type || 'DINE-IN').toUpperCase()}</strong></span><span>Payment: <strong>${paymentMethod}</strong></span></div>
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
          const bDetailsList = getPrintItemDetailsList(item)
          if (bDetailsList.length > 0) {
            custDetails = `<div style="font-size:10px; font-weight:700; color:#333; margin:2px 0 4px 10px; line-height:1.2;">• ${bDetailsList.join('<br/>• ')}</div>`
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
          <div class="total-row-sub"><span>Subtotal:</span><span>₹${rawSub.toFixed(0)}</span></div>
          ${discountAmt > 0 ? `
            <div class="total-row-sub" style="font-weight:900;">
              <span>Discount (${discountLabel}):</span>
              <span>-₹${discountAmt.toFixed(0)}</span>
            </div>
          ` : ''}
          <div class="total-row-sub"><span>CGST (2.5%):</span><span>₹${(tax / 2).toFixed(0)}</span></div>
          <div class="total-row-sub"><span>SGST (2.5%):</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        </div>

        <div class="total-box">
          <span>TOTAL COLLECTED:</span>
          <span>₹${Math.round(total).toFixed(0)}</span>
        </div>

        ${(bill.cashTendered && Number(bill.cashTendered) > 0) ? `
          <div class="totals-section" style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px;">
            <div class="total-row-sub"><span>Cash Received:</span><span>₹${Number(bill.cashTendered).toFixed(0)}</span></div>
            <div class="total-row-sub" style="font-weight:900;"><span>Change Returned:</span><span>₹${Number(bill.changeReturned !== undefined ? bill.changeReturned : (bill.cashTendered - Math.round(total))).toFixed(0)}</span></div>
          </div>
        ` : ''}

        <div class="footer">
          <div><strong>Thank You for Dining at Tendens Gyros!</strong></div>
          <div>Visit Us Again • www.tendengyros.com</div>
        </div>
      </body>
      </html>
    `
  },

  // Generate Guest Order Token HTML (Displays ONLY the Order/Token Number for the guest)
  generateGuestTokenHTML: (kot) => {
    const company = getCompanyInfoSync()
    const orderNum = kot.orderNumber || kot.id || '1001'
    const orderType = (kot.type || 'dine-in').toUpperCase()
    const tableNum = kot.tableNumber || kot.table || ''
    const custName = kot.customerName || ''
    const custPhone = kot.customerPhone || ''
    const dateStr = kot.createdAt ? new Date(kot.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Token #${orderNum}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              width: 76mm;
              margin: 0 auto;
              padding: 8px;
              font-size: 13px;
              color: #000;
              text-align: center;
              -webkit-print-color-adjust: exact;
            }
            .header { padding-bottom: 6px; border-bottom: 2px solid #000; margin-bottom: 8px; }
            .brand-name { font-size: 18px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
            .token-badge { display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; background: #000; color: #fff; padding: 3px 12px; border-radius: 3px; margin: 4px 0; }
            .token-box { border: 3px solid #000; border-radius: 10px; padding: 14px 6px; margin: 8px 0; background: #fff; }
            .token-label { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #000; margin-bottom: 2px; }
            .token-number { font-size: 48px; font-weight: 900; line-height: 1; letter-spacing: 2px; color: #000; }
            .order-meta { font-size: 11px; font-weight: 900; margin-top: 6px; text-transform: uppercase; border-top: 1px dashed #000; padding-top: 5px; }
            .customer-box { margin: 6px 0; font-size: 12px; font-weight: 800; text-align: left; border: 1px solid #000; padding: 6px; border-radius: 4px; }
            .footer { margin-top: 10px; padding-top: 6px; border-top: 2px solid #000; font-size: 10px; font-weight: 900; text-transform: uppercase; line-height: 1.3; }
            @media print { body { width: 76mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-name">${company.name || 'Tendens Gyros'}</div>
            <div><span class="token-badge">GUEST ORDER TOKEN</span></div>
          </div>

          <div class="token-box">
            <div class="token-label">ORDER TOKEN NUMBER</div>
            <div class="token-number">#${orderNum}</div>
            <div class="order-meta">
              MODE: ${orderType} ${tableNum ? `• TABLE ${tableNum}` : ''}<br/>
              DATE: ${dateStr} • TIME: ${timeStr}
            </div>
          </div>

          ${(custName || custPhone) ? `
            <div class="customer-box">
              ${custName ? `<div>Customer: <strong>${custName}</strong></div>` : ''}
              ${custPhone ? `<div>Phone: <strong>${custPhone}</strong></div>` : ''}
            </div>
          ` : ''}

          <div class="footer">
            <div>Please keep this order token number</div>
            <div>Thank You for Dining with Us!</div>
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

  // Automatically print Guest Order Token + Bill ticket (Combined First Printout)
  printKOTAndBill: (order, force = false) => {
    if (!order) return
    if (!force && isAlreadyPrintedJob('kot_and_bill', order)) return
    console.log('Printing Guest Token + Bill for Order:', order)
    try {
      const tokenHtml = PrintService.generateGuestTokenHTML(order)
      const billHtml = PrintService.generateBillHTML(order)
      const combinedHtml = `
        ${tokenHtml}
        <div style="page-break-before: always; break-before: page; margin-top: 20px;"></div>
        ${billHtml}
      `
      PrintService.executePrintHTML(combinedHtml, `Order #${order.orderNumber || order.id || ''}`)
    } catch (err) {
      console.error('Guest Token + Bill combined print error:', err)
    }
  },

  // Print directly to POS printer
  printToPOSPrinter: (kot, force = false) => {
    return PrintService.printKOTAndBill(kot, force);
  },

  // Generate Shift Handover / Cash Counter Close HTML Receipt
  generateShiftHandoverHTML: (session) => {
    const company = getCompanyInfoSync()
    const openedAtStr = session.openedAt ? new Date(session.openedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'
    const closedAtStr = session.closedAt ? new Date(session.closedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'
    const openingCash = Number(session.openingCash || 0)
    const cashSales = Number(session.cashSales || 0)
    const upiSales = Number(session.upiSales || 0)
    const cardSales = Number(session.cardSales || 0)
    const totalSales = Number(session.totalSales || 0)
    const billCount = Number(session.billCount || 0)
    const expectedCash = Number(session.expectedCash || 0)
    const closingCash = Number(session.closingCash || 0)
    const diff = Number(session.difference || 0)

    let diffText = '₹0 (MATCH)'
    if (diff > 0) {
      diffText = `+₹${diff} (EXCESS)`
    } else if (diff < 0) {
      diffText = `-₹${Math.abs(diff)} (SHORTAGE)`
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Shift Handover Summary</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            width: 76mm;
            margin: 0 auto;
            padding: 6px 8px;
            font-size: 12px;
            color: #000;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
          }
          .header { text-align: center; padding-bottom: 6px; border-bottom: 2px solid #000; margin-bottom: 6px; }
          .brand-name { font-size: 18px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
          .badge { display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; background: #000; color: #fff; padding: 3px 10px; border-radius: 3px; margin-top: 4px; }
          .meta-section { margin: 6px 0; font-size: 11px; font-weight: 800; border-bottom: 1px dashed #000; padding-bottom: 6px; }
          .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; margin: 8px 0 4px 0; }
          .row { display: flex; justify-content: space-between; padding: 3px 0; font-weight: 800; border-bottom: 1px dotted #ccc; }
          .highlight-box { border: 2px solid #000; border-radius: 6px; padding: 8px; margin: 8px 0; background: #f9f9f9; }
          .footer { text-align: center; margin-top: 12px; padding-top: 8px; border-top: 2px solid #000; font-size: 10px; font-weight: 900; text-transform: uppercase; }
          .sig-space { display: flex; justify-content: space-between; margin-top: 25px; font-size: 10px; font-weight: 900; }
          @media print { body { width: 76mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-name">${company.name || 'Tendens Gyros'}</div>
          <div><span class="badge">SHIFT CLOSE & CASH HANDOVER</span></div>
        </div>

        <div class="meta-section">
          <div class="meta-row"><span>Cashier (Open): <strong>${session.openedBy || 'Cashier'}</strong></span></div>
          <div class="meta-row"><span>Cashier (Close): <strong>${session.closedBy || session.openedBy || 'Cashier'}</strong></span></div>
          <div class="meta-row"><span>Opened At: <strong>${openedAtStr}</strong></span></div>
          <div class="meta-row"><span>Closed At: <strong>${closedAtStr}</strong></span></div>
          <div class="meta-row"><span>Total Bills Settled: <strong>${billCount}</strong></span></div>
        </div>

        <div class="section-title">Sales Summary</div>
        <div class="row"><span>Cash Sales:</span><span>₹${cashSales.toFixed(0)}</span></div>
        <div class="row"><span>UPI Sales:</span><span>₹${upiSales.toFixed(0)}</span></div>
        <div class="row"><span>Card Sales:</span><span>₹${cardSales.toFixed(0)}</span></div>
        <div class="row" style="font-size: 13px; font-weight: 900; border-top: 1px solid #000;"><span>TOTAL SALES:</span><span>₹${totalSales.toFixed(0)}</span></div>

        <div class="section-title">Cash Counter Reconciliation</div>
        <div class="row"><span>(+) Opening Cash Float:</span><span>₹${openingCash.toFixed(0)}</span></div>
        <div class="row"><span>(+) Cash Sales Collected:</span><span>₹${cashSales.toFixed(0)}</span></div>
        <div class="row" style="font-size: 13px; font-weight: 900; background: #eee; padding: 4px;"><span>(=) EXPECTED CASH IN HAND:</span><span>₹${expectedCash.toFixed(0)}</span></div>
        
        <div class="highlight-box">
          <div class="meta-row" style="font-size: 14px; font-weight: 900;">
            <span>CASH HANDED OVER:</span>
            <span>₹${closingCash.toFixed(0)}</span>
          </div>
          <div class="meta-row" style="font-size: 12px; font-weight: 900; margin-top: 4px;">
            <span>VARIANCE:</span>
            <span>${diffText}</span>
          </div>
        </div>

        ${session.notes ? `<div style="font-size:10px; font-weight:800; border:1px solid #000; padding:4px; margin-top:6px;">NOTES: ${session.notes}</div>` : ''}

        <div class="sig-space">
          <div>___________________<br/>Cashier Signature</div>
          <div>___________________<br/>Manager Signature</div>
        </div>

        <div class="footer">
          --- END OF HANDOVER RECEIPT ---
        </div>
      </body>
      </html>
    `
  },

  printShiftHandover: (session) => {
    if (!session) return
    try {
      const html = PrintService.generateShiftHandoverHTML(session)
      PrintService.executePrintHTML(html, `Shift Handover - ${session.openedBy || 'Cashier'}`)
    } catch (err) {
      console.error('Shift handover print error:', err)
    }
  }
};

export default PrintService;