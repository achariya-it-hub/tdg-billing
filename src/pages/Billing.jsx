import { useState, useEffect } from 'react'
import { Receipt, CreditCard, Banknote, Smartphone, Check, Clock, X, Printer, Wallet, RefreshCw, QrCode, Calendar, Download, FileSpreadsheet, Search, Split } from 'lucide-react'
import { getSocket } from '../lib/socket'
import { useSettings } from '../lib/settingsContext'
import PrintService from '../lib/printService'

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'card', name: 'Card', icon: CreditCard },
  { id: 'upi', name: 'UPI', icon: Smartphone },
  { id: 'split', name: 'Split Pay', icon: Split },
  { id: 'wallet', name: 'Wallet', icon: Wallet },
]

export default function Billing() {
  const { settings } = useSettings()
  const company = settings?.company || { name: 'Tendens Gyros', address: 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram', phone: '000000000' }
  const [newKOTs, setNewKOTs] = useState([])
  const [pendingKOTs, setPendingKOTs] = useState([])
  const [paidBills, setPaidBills] = useState([])
  const [complimentaryOrders, setComplimentaryOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKOT, setSelectedKOT] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [processing, setProcessing] = useState(false)
  const [dateFilter, setDateFilter] = useState('today') // 'today' (Today's Shift) | 'yesterday' | 'all' | 'custom'
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })

  // Bill Resettlement State
  const [resettleBill, setResettleBill] = useState(null)
  const [resettlePaymentMethod, setResettlePaymentMethod] = useState('cash')
  const [resettleNotes, setResettleNotes] = useState('')
  const [resettling, setResettling] = useState(false)

  // Split Payment State
  const [splitCash, setSplitCash] = useState('')
  const [splitUpi, setSplitUpi] = useState('')
  const [splitCard, setSplitCard] = useState('')
  const [resettleSplitCash, setResettleSplitCash] = useState('')
  const [resettleSplitUpi, setResettleSplitUpi] = useState('')
  const [resettleSplitCard, setResettleSplitCard] = useState('')

  // Bill Cancellation State
  const [cancelBillOrder, setCancelBillOrder] = useState(null)
  const [cancelReasonPreset, setCancelReasonPreset] = useState('Customer Changed Mind')
  const [cancelReasonCustom, setCancelReasonCustom] = useState('')
  const [cancelPin, setCancelPin] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelProcessing, setCancelProcessing] = useState(false)

  const getLocalDateString = (val) => {
    if (!val) return ''
    try {
      const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })
      }
    } catch (e) {}
    if (typeof val === 'string' && val.length >= 10) {
      return val.slice(0, 10)
    }
    return String(val).slice(0, 10)
  }

  const isToday = (dateStr) => {
    if (!dateStr) return false
    return getLocalDateString(dateStr) === getLocalDateString(new Date())
  }

  const isYesterday = (dateStr) => {
    if (!dateStr) return false
    const y = new Date()
    y.setDate(y.getDate() - 1)
    return getLocalDateString(dateStr) === getLocalDateString(y)
  }

  const matchesSearch = (o) => {
    if (!searchTerm || !searchTerm.trim()) return true
    const term = searchTerm.toLowerCase().trim()

    const orderNo = String(o.orderNumber || o.id || '').toLowerCase()
    if (orderNo.includes(term)) return true

    const tableNo = String(o.tableNumber || '').toLowerCase()
    if (tableNo.includes(term) || `table ${tableNo}`.includes(term)) return true

    const custName = String(o.customerName || o.customer || '').toLowerCase()
    const custPhone = String(o.customerPhone || o.phone || '').toLowerCase()
    if (custName.includes(term) || custPhone.includes(term)) return true

    const payMethod = String(o.paymentMethod || '').toLowerCase()
    if (payMethod.includes(term)) return true

    const items = o.items || []
    const itemMatch = items.some(item => {
      const name = String(item.menuItemName || item.name || '').toLowerCase()
      return name.includes(term)
    })
    if (itemMatch) return true

    return false
  }

  const filterByDate = (list) => {
    return list.filter(o => matchesSearch(o))
  }

  const visibleNewKOTs = filterByDate(newKOTs)
  const visiblePendingKOTs = filterByDate(pendingKOTs)
  const visibleComplimentary = filterByDate(complimentaryOrders)
  const visiblePaidBills = filterByDate(paidBills)
  // All chargeable (non-cancelled, non-complimentary) bills in the current period — same
  // definition the Daily Closing / reports use, so the counters always reconcile.
  const visibleAllBills = [...visibleNewKOTs, ...visiblePendingKOTs, ...visiblePaidBills]
  const visibleAllBillsTotal = visibleAllBills.reduce((s, b) => s + (b.total !== undefined && b.total !== null ? Number(b.total) : calculateTotal(b) + calculateTax(calculateTotal(b))), 0)

  const getApiUrl = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin
  }

  const fetchOrders = async () => {
    try {
      const queryDate = dateFilter === 'custom' ? customDate : dateFilter
      let [allRes, paidRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/pos/orders?date=${queryDate}`),
        fetch(`${getApiUrl()}/api/pos/orders?status=completed&date=${queryDate}`)
      ])
      let all = allRes.ok ? await allRes.json() : []
      let paid = paidRes.ok ? await paidRes.json() : []

      const orderMap = new Map()
      if (Array.isArray(all)) all.forEach(o => orderMap.set(o.id, o))
      if (Array.isArray(paid)) paid.forEach(o => orderMap.set(o.id, o))
      const combined = Array.from(orderMap.values())

      // Include ALL order types so no bills are missed!
      const filtered = combined.filter(o => (o.status || '').toLowerCase() !== 'cancelled' && (o.status || '').toLowerCase() !== 'void')
      
      const comp = filtered.filter(o => o.complimentary || o.isComplimentary || (o.paymentMethod || '').toLowerCase() === 'complimentary' || o.type === 'complimentary')
      setComplimentaryOrders(comp)

      const nonComp = filtered.filter(o => !o.complimentary && !o.isComplimentary && (o.paymentMethod || '').toLowerCase() !== 'complimentary' && o.type !== 'complimentary')
      setNewKOTs(nonComp.filter(o => o.status === 'pending'))
      setPendingKOTs(nonComp.filter(o => (o.status === 'ready' || o.status === 'in-progress' || o.status === 'preparing' || o.status === 'served') && o.status !== 'completed' && o.paymentStatus !== 'paid'))
      setPaidBills(nonComp.filter(o => o.status === 'completed' || o.paymentStatus === 'paid' || o.paidAt))
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [dateFilter, customDate])

  useEffect(() => {
    fetchOrders()
    const socket = getSocket()
    socket.connect()
    socket.on('order:updated', (order) => {
      if (order.complimentary) {
        if (order.status === 'ready' || order.status === 'pending') {
          setComplimentaryOrders(prev => {
            if (prev.find(o => o.id === order.id)) return prev
            return [order, ...prev]
          })
          setNewKOTs(prev => prev.filter(o => o.id !== order.id))
          setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
          setPaidBills(prev => prev.filter(o => o.id !== order.id))
        } else {
          setComplimentaryOrders(prev => prev.filter(o => o.id !== order.id))
          setNewKOTs(prev => prev.filter(o => o.id !== order.id))
          setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
          setPaidBills(prev => prev.filter(o => o.id !== order.id))
        }
        return
      }
      if (order.status === 'ready' || order.status === 'in-progress' || order.status === 'preparing' || order.status === 'served') {
        setNewKOTs(prev => prev.filter(o => o.id !== order.id))
        setPendingKOTs(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [...prev, order]
        })
        setPaidBills(prev => prev.filter(o => o.id !== order.id))
      } else if (order.status === 'completed' || order.paymentStatus === 'paid') {
        setNewKOTs(prev => prev.filter(o => o.id !== order.id))
        setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
        setPaidBills(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [order, ...prev]
        })
      } else {
        setNewKOTs(prev => prev.filter(o => o.id !== order.id))
        setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
      }
    })
    socket.on('order:created', (order) => {
      if (order.type === 'delivery' || order.source === 'online') return
      if (order.complimentary) {
        setComplimentaryOrders(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [order, ...prev]
        })
        return
      }
      if (order.status === 'pending') {
        setNewKOTs(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [...prev, order]
        })
      } else if (order.status === 'ready') {
        setPendingKOTs(prev => [...prev, order])
      }
    })
    return () => {
      socket.off('order:updated')
      socket.off('order:created')
    }
  }, [])

  const calculateRawSubtotal = (kot) => {
    if (!kot) return 0
    if (kot.rawSubtotal !== undefined && kot.rawSubtotal !== null) return Number(kot.rawSubtotal)
    return (kot.items || []).reduce((sum, item) => sum + (item.totalPrice !== undefined ? Number(item.totalPrice) : Number(item.unitPrice || item.price || 0) * Number(item.quantity || item.qty || 1)), 0)
  }

  const getDiscountAmount = (kot) => {
    if (!kot) return 0
    const raw = calculateRawSubtotal(kot)
    if (kot.discount !== undefined && kot.discount !== null && Number(kot.discount) > 0) return Number(kot.discount)
    if (kot.discountGiven !== undefined && kot.discountGiven !== null && Number(kot.discountGiven) > 0) return Number(kot.discountGiven)
    if (kot.inaugurationOffer) return Math.round(raw * 0.5)
    if (kot.specialOffer20) return Math.round(raw * 0.2)
    if (kot.vip50) return Math.round(raw * 0.5)
    if (kot.discountPct > 0) return Math.round(raw * (kot.discountPct / 100))
    return 0
  }

  const calculateNetSubtotal = (kot) => {
    if (!kot) return 0
    return Math.max(0, calculateRawSubtotal(kot) - getDiscountAmount(kot))
  }

  const calculateTax = (kot) => {
    if (!kot) return 0
    // Tax MUST ALWAYS be calculated on Net Subtotal AFTER discount
    return Math.round(calculateNetSubtotal(kot) * 0.05)
  }

  const calculateTotal = (kot) => {
    if (!kot) return 0
    if (kot.total !== undefined && kot.total !== null && Number(kot.total) > 0) return Number(kot.total)
    return Math.round(calculateNetSubtotal(kot) + calculateTax(kot))
  }

  const acceptKOT = async (kot) => {
    try {
      await fetch(`${getApiUrl()}/api/pos/orders/${kot.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' })
      })
    } catch (err) {
      console.error('Failed to accept KOT:', err)
    }
    setSelectedKOT(kot)
    setShowPayment(true)
  }

  const handleGenerateBill = (kot) => {
    setSelectedKOT(kot)
    setSelectedPayment('cash')
    setCashTendered('')
    setSplitCash('')
    setSplitUpi('')
    setSplitCard('')
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (!selectedKOT) return
    setProcessing(true)

    const totalBillAmt = Math.round(selectedKOT.total || (calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))))
    let splitData = undefined
    let tenderVal
    let changeVal

    if (selectedPayment === 'cash') {
      if (cashTendered && Number(cashTendered) > 0) {
        tenderVal = Number(cashTendered)
        changeVal = tenderVal >= totalBillAmt ? tenderVal - totalBillAmt : 0
      } else {
        tenderVal = totalBillAmt
        changeVal = 0
      }
    }

    if (selectedPayment === 'split') {
      const c = Number(splitCash) || 0
      const u = Number(splitUpi) || 0
      const cd = Number(splitCard) || 0
      const sum = c + u + cd
      if (sum !== totalBillAmt) {
        alert(`Split amounts total (₹${sum}) does not match bill total (₹${totalBillAmt}). Please adjust!`)
        setProcessing(false)
        return
      }
      splitData = { cash: c, upi: u, card: cd }
    }

    if (selectedPayment === 'wallet') {
      const phone = selectedKOT.customerPhone
      if (!phone) {
        alert('Customer phone required for wallet payment')
        setProcessing(false)
        return
      }
      try {
        const res = await fetch(`${getApiUrl()}/api/loyalty/user/${encodeURIComponent(phone)}`)
        if (res.ok) {
          const data = await res.json()
          const balance = data.rubyPoints || 0
          const total = totalBillAmt
          if (balance < total) {
            alert(`Insufficient wallet: ₹${balance} available, need ₹${total}`)
            setProcessing(false)
            return
          }
        } else {
          alert('Customer not found in loyalty system')
          setProcessing(false)
          return
        }
      } catch {
        alert('Could not verify wallet balance')
        setProcessing(false)
        return
      }
    }

    try {
      const res = await fetch(`${getApiUrl()}/api/pos/orders/${selectedKOT.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: selectedPayment,
          splitPayments: splitData,
          cashTendered: tenderVal,
          changeReturned: changeVal
        })
      })
      if (res.ok) {
        setPaidBills(prev => [{ ...selectedKOT, status: 'completed', paymentStatus: 'paid', paymentMethod: selectedPayment, splitPayments: splitData, cashTendered: tenderVal, changeReturned: changeVal }, ...prev])
        setPendingKOTs(prev => prev.filter(o => o.id !== selectedKOT.id))
      }
      setShowPayment(false)
      setSelectedKOT(null)
      setCashTendered('')
      setSplitCash('')
      setSplitUpi('')
      setSplitCard('')
    } catch (err) {
      console.error('Payment failed:', err)
    }
    setProcessing(false)
  }

  const printInvoice = (bill) => {
    PrintService.printBill(bill, true)
  }

  const handleOpenResettle = (bill) => {
    setResettleBill(bill)
    setResettlePaymentMethod((bill.paymentMethod || 'cash').toLowerCase())
    if (bill.splitPayments) {
      setResettleSplitCash(bill.splitPayments.cash || '')
      setResettleSplitUpi(bill.splitPayments.upi || '')
      setResettleSplitCard(bill.splitPayments.card || '')
    } else {
      setResettleSplitCash('')
      setResettleSplitUpi('')
      setResettleSplitCard('')
    }
    setResettleNotes('')
  }

  const handleConfirmResettle = async () => {
    if (!resettleBill) return
    setResettling(true)
    
    const totalBillAmt = Math.round(resettleBill.total || calculateTotal(resettleBill))
    let splitData = undefined

    if (resettlePaymentMethod === 'split') {
      const c = Number(resettleSplitCash) || 0
      const u = Number(resettleSplitUpi) || 0
      const cd = Number(resettleSplitCard) || 0
      const sum = c + u + cd
      if (sum !== totalBillAmt) {
        alert(`Split amounts total (₹${sum}) does not match bill total (₹${totalBillAmt}). Please adjust!`)
        setResettling(false)
        return
      }
      splitData = { cash: c, upi: u, card: cd }
    }

    try {
      const billId = resettleBill.id || resettleBill.orderNumber
      const res = await fetch(`${getApiUrl()}/api/pos/orders/${billId}/resettle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: resettlePaymentMethod,
          splitPayments: splitData,
          paymentStatus: 'paid',
          notes: resettleNotes || 'Resettled payment method'
        })
      })
      if (res.ok) {
        setPaidBills(prev => prev.map(b => (String(b.id) === String(billId) || String(b.orderNumber) === String(billId)) ? { ...b, paymentMethod: resettlePaymentMethod, splitPayments: splitData } : b))
        alert(`Bill #${resettleBill.orderNumber || resettleBill.id} resettled to ${resettlePaymentMethod.toUpperCase()} successfully!`)
      } else {
        alert('Failed to resettle bill')
      }
    } catch (e) {
      console.error('Resettle error:', e)
      alert('Error resettling bill: ' + e.message)
    }
    setResettling(false)
    setResettleBill(null)
  }

  const exportBillsSummary = async () => {
    if (!visiblePaidBills || visiblePaidBills.length === 0) {
      alert('No bill records found for the selected filter.')
      return
    }

    try {
      const XLSX = await import('xlsx')
      const rows = visiblePaidBills.map((bill, index) => {
        const total = calculateTotal(bill)
        const tax = calculateTax(total)
        const netTotal = bill.total || (total + tax)
        const dateObj = bill.createdAt ? new Date(bill.createdAt) : new Date()
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

        const billNo = bill.orderNumber ? `#${String(bill.orderNumber).padStart(6, '0')}` : `#${bill.id}`
        const kotNo = bill.kotNumber || (bill.orderNumber ? `KOT-${bill.orderNumber}` : `KOT-${bill.id}`)

        return {
          'S.No': index + 1,
          'Bill No': billNo,
          'Related KOT No': kotNo,
          'Date': dateStr,
          'Time': timeStr,
          'Order Type': (bill.type || 'DINE-IN').toUpperCase(),
          'Payment Mode': (bill.paymentMethod || 'CASH').toUpperCase(),
          'Subtotal (₹)': Math.round(total),
          'GST Tax (5% ₹)': Math.round(tax),
          'Total Amount (₹)': Math.round(netTotal)
        }
      })

      const grandTotal = rows.reduce((s, r) => s + r['Total Amount (₹)'], 0)
      rows.push({
        'S.No': '',
        'Bill No': 'TOTAL',
        'Related KOT No': `${rows.length} Bills`,
        'Date': '',
        'Time': '',
        'Order Type': '',
        'Payment Mode': '',
        'Subtotal (₹)': '',
        'GST Tax (5% ₹)': '',
        'Total Amount (₹)': grandTotal
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)

      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Bills Summary')
      const todayStr = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `TDG_Bills_Summary_${dateFilter}_${todayStr}.xlsx`)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export Excel file. Please try again.')
    }
  }

  const buildInvoiceHTML = (bill, items, total, tax, grandTotal, dateStr, timeStr, company, calcTotal, calcTax) => {
    const paymentMethod = (bill.paymentMethod || 'cash').toLowerCase()
    const upiId = company?.upiId || ''
    const rawSub = bill.rawSubtotal || total || 0
    const discountAmt = bill.discount || bill.discountGiven || 0
    const netTotal = bill.total || grandTotal
    const kotNum = bill.kotNumber || bill.orderNumber || bill.id
    const discountLabel = bill.discountName || (bill.inaugurationOffer ? 'Inauguration Offer 50%' : (bill.specialOffer20 ? 'Special Offer 20%' : 'Discount Saved'))
    const billTotal = calcTotal ? calcTotal(bill) + (calcTax ? calcTax(calcTotal(bill)) : 0) : netTotal
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${bill.orderNumber || bill.id}</title>
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
          .header { padding-bottom: 10px; border-bottom: 3px solid #000; margin-bottom: 10px; }
          .brand-name { font-family: 'Georgia', serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000; }
          .brand-tagline { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #000; margin-top: 2px; }
          .brand-details { font-size: 10px; font-weight: 900; color: #000; margin-top: 4px; line-height: 1.3; }
          .divider { border-top: 2px dashed #000; margin: 8px 0; }
          .divider-thick { border-top: 3px solid #000; margin: 8px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; margin: 3px 0; }
          .info-label { color: #000; }
          .info-value { font-weight: 900; }
          .bill-number { font-size: 16px; font-weight: 900; margin: 6px 0; }
          .bill-number .info-value { font-size: 20px; font-weight: 900; letter-spacing: 1px; }
          .col-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .item-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; padding: 3px 0; }
          .item-name { flex: 1; font-weight: 900; }
          .item-qty { width: 30px; text-align: center; font-weight: 900; }
          .item-price { width: 55px; text-align: right; font-weight: 900; }
          .subtotal-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; padding: 4px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; padding: 8px 0; border-top: 3px solid #000; border-bottom: 3px solid #000; margin: 8px 0; }
          .total-amount { color: #000; font-weight: 900; }
          .payment-info { font-size: 11px; font-weight: 900; margin: 4px 0; }
          .footer { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #000; }
          .footer-thanks { font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #000; margin-bottom: 2px; }
          .footer-message { font-size: 10px; font-weight: 900; color: #000; }
          .gst-info { font-size: 9px; font-weight: 900; color: #000; text-align: center; margin-top: 6px; }
          @media print { body { width: 80mm; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="brand-name">${company.name || 'Tendens Gyros'}</div>
          <div class="brand-tagline">Restaurant Management System</div>
          <div class="brand-details">
            ${company.address ? company.address.replace(/,\s*/g, ',<br/>') + '<br/>' : 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram<br/>'}
            Ph: <strong>${company.phone || '7548808877'}</strong><br/>
            GSTIN: <strong>${company.gstNo || company.gst || company.gstin || '33FJSPA2544H1Z9'}</strong><br/>
            Email: <strong>${company.email || company.mailId || 'info@tendengyros.com'}</strong>
          </div>
        </div>
        <div class="info-row bill-number"><span class="info-label">Bill No:</span><span class="info-value">#${String(bill.orderNumber || bill.id).padStart(6, '0')}</span></div>
        <div class="info-row"><span class="info-label">KOT No:</span><span class="info-value">${kotNum ? `KOT-${kotNum}` : `KOT-${bill.orderNumber}`}</span></div>
        <div class="info-row"><span class="info-label">Date:</span><span class="info-value">${dateStr}</span></div>
        <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${timeStr}</span></div>
        <div class="info-row"><span class="info-label">Payment:</span><span class="info-value" style="text-transform:capitalize">${bill.paymentMethod || 'cash'}</span></div>
        ${bill.customerName ? `<div class="info-row"><span class="info-label">Customer Name:</span><span class="info-value"><strong>${bill.customerName}</strong></span></div>` : ''}
        ${bill.customerPhone ? `<div class="info-row"><span class="info-label">Customer Phone:</span><span class="info-value"><strong>${bill.customerPhone}</strong></span></div>` : ''}
        <div class="divider"></div>
        <div class="col-header"><span class="item-name">Item</span><span class="item-qty">Qty</span><span class="item-price">Amount</span></div>
        ${items.map((item, i) => {
          const name = item.menuItemName || item.name || ''
          const qty = item.quantity || item.qty || 1
          const amt = (item.totalPrice || item.price * qty || 0)
          return '<div class="item-row"><span class="item-name">' + (name.length > 22 ? name.slice(0, 20) + '..' : name) + '</span><span class="item-qty">' + qty + '</span><span class="item-price">₹' + amt.toFixed(0) + '</span></div>'
        }).join('')}
        <div class="divider"></div>
        <div class="subtotal-row"><span>Subtotal</span><span>₹${rawSub.toFixed(0)}</span></div>
        ${discountAmt > 0 ? `
          <div class="subtotal-row" style="font-weight:900;">
            <span>Discount (${discountLabel})</span>
            <span>-₹${discountAmt.toFixed(0)}</span>
          </div>
        ` : ''}
        <div class="subtotal-row"><span>CGST (2.5%)</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        <div class="subtotal-row"><span>SGST (2.5%)</span><span>₹${(tax / 2).toFixed(0)}</span></div>
        <div class="divider-thick"></div>
        <div class="total-row"><span>TOTAL COLLECTED</span><span class="total-amount">₹${Math.round(netTotal).toFixed(0)}</span></div>
        <div class="payment-info" style="text-align:right;color:#888;font-size:9px">Round Off: ₹0.00</div>
        <div class="payment-info center" style="margin-top:8px;font-size:11px">Payment: ${(bill.paymentMethod || 'CASH').toUpperCase()}</div>
        ${paymentMethod === 'upi' && upiId ? `
        <div class="center" style="margin:10px 0">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('upi://pay?pa=' + upiId + '&pn=' + company.name + '&am=' + billTotal.toFixed(2) + '&cu=INR')}" alt="QR" style="width:160px;height:160px;border:1px solid #000;border-radius:4px" />
          <div style="font-size:10px;margin-top:4px">Scan to Pay</div>
          <div style="font-size:9px;font-weight:700">${upiId}</div>
        </div>` : ''}
        <div class="footer">
          <div class="footer-thanks">Thank You!</div>
          <div class="footer-message">We look forward to serving you again</div>
          <div class="footer-message" style="margin-top:4px">Happy Dining!</div>
        </div>
        <div class="gst-info">This is a computer-generated invoice</div>
      </body>
      </html>
    `
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
  }

  const gradientBtn = (color1, color2) => ({
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: `0 2px 8px ${color1}40`
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Billing Counter
        </h2>
        <p style={{ color: '#6b7280' }}>Generate bills from completed KOTs</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { value: visibleNewKOTs.length, label: 'Pending KOTs', color: '#f59e0b', bg: '#fffbeb' },
          { value: visiblePendingKOTs.length, label: 'Ready for Billing', color: '#e63946', bg: '#fef2f2' },
          { value: visibleComplimentary.length, label: 'Complimentary', color: '#8b5cf6', bg: '#f5f3ff' },
          { 
            value: visibleAllBills.length, 
            label: dateFilter === 'today' ? 'Total Bills Today' : (dateFilter === 'yesterday' ? 'Total Bills Yesterday' : 'Total Bills (All Time)'), 
            color: '#10b981', 
            bg: '#ecfdf5' 
          },
          { 
            value: `₹${Math.round(visibleAllBillsTotal)}`, 
            label: 'Total Sales (Bills)', 
            color: '#2563eb', 
            bg: '#eff6ff' 
          }
        ].map((stat, i) => (
          <div key={i} style={{
            background: stat.bg,
            borderRadius: '16px',
            padding: '20px', textAlign: 'center',
            border: `1.5px solid ${stat.color}20`,
            boxShadow: `0 4px 16px ${stat.color}15`
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: stat.color, marginTop: '4px', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Date Filter, Search Bar & Refresh Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={fetchOrders} style={{
          padding: '10px 20px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)', color: '#4b5563',
          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <RefreshCw size={16} />
          Refresh
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          padding: '8px 16px', borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <Calendar size={16} color="#e63946" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Date View:</span>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '13px', fontWeight: 700, color: '#1a1a2e', background: 'white',
              cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="today">⭐ Today's Shift</option>
            <option value="yesterday">🕒 Yesterday's Shift</option>
            <option value="all">🌐 All Time</option>
            <option value="custom">📅 Select Specific Date...</option>
          </select>
          {dateFilter === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              style={{
                padding: '5px 10px', borderRadius: '8px', border: '1px solid #e63946',
                fontSize: '13px', fontWeight: 700, outline: 'none', color: '#1a1a2e', background: 'white'
              }}
            />
          )}
        </div>

        {/* Live Instant Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          flex: 1, minWidth: '280px',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          padding: '8px 16px', borderRadius: '12px',
          border: '1.5px solid rgba(230,57,70,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Search size={18} color="#e63946" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type & search by Order #, KOT #, Table, Customer Name/Phone, Item, or Payment..."
            style={{
              width: '100%', border: 'none', background: 'transparent',
              fontSize: '13.5px', fontWeight: 600, color: '#1f2937', outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button onClick={exportBillsSummary} style={{
          padding: '10px 20px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white', fontWeight: 700, fontSize: '13.5px',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'all 0.2s'
        }}>
          <FileSpreadsheet size={18} />
          📊 Export Bills Summary (Excel)
        </button>
      </div>

      {/* New KOTs (Pending) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>New KOTs (Pending)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {visibleNewKOTs.map(kot => (
            <div key={kot.id} style={{
              ...glassCard,
              padding: '16px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>K{kot.kotNumber || kot.orderNumber}</span>
                  <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>{kot.tableNumber ? `Table ${kot.tableNumber}` : kot.type}</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                  <Clock size={14} /> {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                {kot.items.map(i => `${i.menuItemName || i.name} x${i.quantity}`).join(', ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
                  ₹{calculateTotal(kot)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setCancelBillOrder(kot)
                      setCancelReasonPreset('Customer Changed Mind')
                      setCancelReasonCustom('')
                      setCancelPin('')
                      setCancelError('')
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      color: '#dc2626',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Cancel KOT"
                  >
                    <X size={14} color="#dc2626" />
                    Cancel
                  </button>
                  <button
                    onClick={() => acceptKOT(kot)}
                    style={{
                      padding: '10px 18px',
                      ...gradientBtn('#f59e0b', '#d97706'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <Receipt size={16} />
                    Accept & Bill
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visibleNewKOTs.length === 0 && (
            <div style={{ ...glassCard, padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
              No pending KOTs
            </div>
          )}
        </div>
      </div>

      {/* Complimentary Orders */}
      {visibleComplimentary.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Complimentary Orders</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {visibleComplimentary.map(order => (
              <div key={order.id} style={{
                ...glassCard,
                padding: '16px',
                borderLeft: '4px solid #8b5cf6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>K{order.kotNumber || order.orderNumber}</span>
                    <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>{order.tableNumber ? `Table ${order.tableNumber}` : order.type}</span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    background: '#f3e8ff',
                    color: '#8b5cf6',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {order.complimentaryType || 'Complimentary'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                  {order.items.map(i => `${i.menuItemName || i.name} x${i.quantity}`).join(', ')}
                </div>
                {order.specialRemarks && (
                  <div style={{ fontSize: '12px', color: '#8b5cf6', fontStyle: 'italic', marginBottom: '8px' }}>
                    "{order.specialRemarks}"
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#8b5cf6' }}>
                    ₹0
                  </div>
                  <button
                    onClick={() => {
                      setCancelBillOrder(order)
                      setCancelReasonPreset('Customer Changed Mind')
                      setCancelReasonCustom('')
                      setCancelPin('')
                      setCancelError('')
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={14} color="#dc2626" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Ready KOTs */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Ready for Billing</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visiblePendingKOTs.map(kot => (
              <div key={kot.id} style={{
                ...glassCard,
                padding: '16px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>K{kot.kotNumber || kot.orderNumber}</span>
                    <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>{kot.tableNumber ? `Table ${kot.tableNumber}` : kot.type}</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                    <Clock size={14} /> {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                  {kot.items.map(i => `${i.menuItemName || i.name} x${i.quantity}`).join(', ')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                    ₹{calculateTotal(kot)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setCancelBillOrder(kot)
                        setCancelReasonPreset('Customer Changed Mind')
                        setCancelReasonCustom('')
                        setCancelPin('')
                        setCancelError('')
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        color: '#dc2626',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Cancel Order / KOT"
                    >
                      <X size={14} color="#dc2626" />
                      Cancel KOT
                    </button>
                    <button
                      onClick={() => handleGenerateBill(kot)}
                      style={{
                        padding: '10px 18px',
                        ...gradientBtn('#e63946', '#c1121f'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <Receipt size={16} />
                      Generate Bill
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {visiblePendingKOTs.length === 0 && (
              <div style={{ ...glassCard, padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                No KOTs ready for billing
              </div>
            )}
          </div>
        </div>

        {/* Today's / Yesterday's / All Bills */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            {dateFilter === 'today' ? "Today's Bills" : (dateFilter === 'yesterday' ? "Yesterday's Bills" : "All Past Bills")}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visiblePaidBills.map(bill => {
              const pm = (bill.paymentMethod || 'cash').toLowerCase()
              let pmBadge = { bg: '#f0fdf4', color: '#15803d', label: 'CASH' }
              if (pm.includes('upi') || pm.includes('online') || pm.includes('gpay')) pmBadge = { bg: '#eff6ff', color: '#1d4ed8', label: 'UPI' }
              else if (pm.includes('card')) pmBadge = { bg: '#fef3c7', color: '#b45309', label: 'CARD' }
              else if (pm.includes('wallet')) pmBadge = { bg: '#f5f3ff', color: '#7e22ce', label: 'WALLET' }

              return (
                <div key={bill.id || bill.orderNumber} style={{
                  ...glassCard,
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>#Bill {bill.orderNumber || bill.id} (K{bill.kotNumber || bill.orderNumber})</div>
                    <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{bill.tableNumber ? `Table ${bill.tableNumber}` : bill.type || 'POS'}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, background: pmBadge.bg, color: pmBadge.color }}>
                        {pmBadge.label}
                      </span>
                      <span style={{ fontWeight: 800, color: '#10b981' }}>₹{Math.round(bill.total || calculateTotal(bill))}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenResettle(bill)}
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #ffedd5',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#c2410c'
                      }}
                      title="Resettle Payment Method"
                    >
                      <RefreshCw size={14} color="#c2410c" />
                      Resettle
                    </button>
                    <button 
                      onClick={() => {
                        setCancelBillOrder(bill)
                        setCancelReasonPreset('Customer Changed Mind')
                        setCancelReasonCustom('')
                        setCancelPin('')
                        setCancelError('')
                      }}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#dc2626'
                      }}
                      title="Cancel Bill with Reason"
                    >
                      <X size={14} color="#dc2626" />
                      Cancel Bill
                    </button>
                    <button 
                      onClick={() => printInvoice(bill)}
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer'
                      }}
                      title="Print Invoice"
                    >
                      <Printer size={18} color="#6b7280" />
                    </button>
                  </div>
                </div>
              )
            })}
            {visiblePaidBills.length === 0 && (
              <div style={{ ...glassCard, padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                {dateFilter === 'today' ? "No bills generated today yet" : (dateFilter === 'yesterday' ? "No bills generated yesterday" : "No past bills found")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedKOT && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            width: '90%',
            maxWidth: '450px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Generate Bill</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    const orderToCancel = selectedKOT
                    setShowPayment(false)
                    setSelectedKOT(null)
                    setCancelBillOrder(orderToCancel)
                    setCancelReasonPreset('Customer Changed Mind')
                    setCancelReasonCustom('')
                    setCancelPin('')
                    setCancelError('')
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Cancel Order / KOT"
                >
                  <X size={14} color="#dc2626" />
                  Cancel Order
                </button>
                <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>KOT #{selectedKOT.kotNumber || selectedKOT.orderNumber} (Bill #{selectedKOT.orderNumber || selectedKOT.id})</span>
                <span>{selectedKOT.tableNumber ? `Table ${selectedKOT.tableNumber}` : selectedKOT.type}</span>
              </div>
              {selectedKOT.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                  <span>{item.menuItemName || item.name} x{item.quantity || item.qty}</span>
                  <span>₹{(item.totalPrice || item.price * item.quantity) || 0}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal</span>
                  <span>₹{calculateRawSubtotal(selectedKOT).toFixed(0)}</span>
                </div>
                {getDiscountAmount(selectedKOT) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <span>Discount ({selectedKOT.discountName || 'Promo'})</span>
                    <span>-₹{getDiscountAmount(selectedKOT).toFixed(0)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>CGST (2.5%)</span>
                  <span>₹{(calculateTax(selectedKOT) / 2).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>SGST (2.5%)</span>
                  <span>₹{(calculateTax(selectedKOT) / 2).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700 }}>
                  <span>Total Collected</span>
                  <span style={{ color: '#e63946' }}>₹{calculateTotal(selectedKOT).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Select Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {paymentMethods.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    style={{
                      padding: '16px',
                      background: selectedPayment === pm.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(0,0,0,0.03)',
                      color: selectedPayment === pm.id ? 'white' : '#4b5563',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: selectedPayment === pm.id ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
                    }}
                  >
                    <pm.icon size={24} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{pm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedPayment === 'cash' && (() => {
              const totalAmt = Math.round(selectedKOT.total || (calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))))
              const tendered = Number(cashTendered) || 0
              const changeAmt = tendered > 0 ? (tendered - totalAmt) : 0

              return (
                <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '16px', border: '1.5px solid #86efac' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#166534', display: 'block', marginBottom: '6px' }}>
                    💵 Cash Received / Tendered (₹)
                  </label>
                  <input
                    type="number"
                    placeholder={`Enter cash given by customer (e.g. 500)`}
                    value={cashTendered}
                    onChange={e => setCashTendered(e.target.value)}
                    min="0"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid #10b981',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#065f46',
                      textAlign: 'center',
                      outline: 'none',
                      background: '#ffffff',
                      marginBottom: '10px'
                    }}
                  />

                  {/* Quick Denomination Chips */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>Quick Cash Notes:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[
                      { label: `Exact (₹${totalAmt})`, val: String(totalAmt) },
                      { label: '₹100', val: '100' },
                      { label: '₹200', val: '200' },
                      { label: '₹500', val: '500' },
                      { label: '₹1000', val: '1000' },
                      { label: '₹2000', val: '2000' }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setCashTendered(chip.val)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: cashTendered === chip.val ? '2px solid #059669' : '1px solid #a7f3d0',
                          background: cashTendered === chip.val ? '#059669' : '#ffffff',
                          color: cashTendered === chip.val ? '#ffffff' : '#047857',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Live Change Return Calculation Display */}
                  {tendered > 0 && (
                    changeAmt >= 0 ? (
                      <div style={{ background: '#ffffff', border: '2px solid #10b981', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(16,185,129,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          💵 RETURN CHANGE TO CUSTOMER
                        </div>
                        <div style={{ fontSize: '30px', fontWeight: 900, color: '#059669', margin: '2px 0' }}>
                          ₹{changeAmt.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                          Customer paid ₹{tendered.toLocaleString('en-IN')} • Give ₹{changeAmt.toLocaleString('en-IN')} back
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                          ⚠️ CASH SHORTAGE
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>
                          ₹{Math.abs(changeAmt).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b' }}>
                          Customer owes ₹{Math.abs(changeAmt).toLocaleString('en-IN')} more
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            })()}

            {selectedPayment === 'split' && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Split Payment Breakdown</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: (Number(splitCash) + Number(splitUpi) + Number(splitCard) === Math.round(selectedKOT.total || (calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))))) ? '#10b981' : '#ef4444' }}>
                    Total: ₹{Number(splitCash) + Number(splitUpi) + Number(splitCard)} / ₹{Math.round(selectedKOT.total || (calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))))}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>💵 Cash (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={splitCash}
                      onChange={e => setSplitCash(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>📱 UPI (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={splitUpi}
                      onChange={e => setSplitUpi(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>💳 Card (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={splitCard}
                      onChange={e => setSplitCard(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedPayment === 'upi' && company.upiId && (
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', background: 'white', borderRadius: '16px', border: '2px dashed #d1d5db' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#4b5563' }}>
                  <QrCode size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                  Scan to Pay via UPI
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${company.upiId}&pn=${company.name}&am=${(calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))).toFixed(2)}&cu=INR&tn=Order%20${selectedKOT.orderNumber}`)}`}
                  alt="UPI QR Code"
                  style={{ width: '220px', height: '220px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                  Pay via GPay, PhonePe, Paytm, or any UPI app
                </div>
                <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>
                  {company.upiId}
                </div>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing}
              style={{
                width: '100%',
                padding: '16px',
                background: processing ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: processing ? 'none' : '0 4px 16px rgba(16,185,129,0.3)'
              }}
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <Check size={24} />
                  Complete Payment & Generate Bill
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resettle Payment Modal */}
      {resettleBill && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            ...glassCard,
            width: '440px',
            maxWidth: '90%',
            padding: '24px',
            background: 'white',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#e63946', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={20} /> Resettle Bill #{resettleBill.orderNumber || resettleBill.id}
              </h3>
              <button onClick={() => setResettleBill(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Current Settlement:</span>
                <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#dc2626' }}>{resettleBill.paymentMethod || 'CASH'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill Total Amount:</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>₹{Math.round(resettleBill.total || calculateTotal(resettleBill))}</span>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
              Select Correct Payment Method:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {paymentMethods.map(method => {
                const Icon = method.icon
                const isSelected = resettlePaymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setResettlePaymentMethod(method.id)}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #e63946' : '1px solid #e5e7eb',
                      background: isSelected ? '#fff5f5' : '#f9fafb',
                      color: isSelected ? '#e63946' : '#374151',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Icon size={20} />
                    {method.name}
                  </button>
                )
              })}
            </div>

            {resettlePaymentMethod === 'split' && (
              <div style={{ marginBottom: '16px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Split Amounts</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: (Number(resettleSplitCash) + Number(resettleSplitUpi) + Number(resettleSplitCard) === Math.round(resettleBill.total || calculateTotal(resettleBill))) ? '#10b981' : '#ef4444' }}>
                    ₹{Number(resettleSplitCash) + Number(resettleSplitUpi) + Number(resettleSplitCard)} / ₹{Math.round(resettleBill.total || calculateTotal(resettleBill))}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Cash (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={resettleSplitCash}
                      onChange={e => setResettleSplitCash(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>UPI (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={resettleSplitUpi}
                      onChange={e => setResettleSplitUpi(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Card (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={resettleSplitCard}
                      onChange={e => setResettleSplitCard(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                Reason / Notes (Optional):
              </div>
              <input
                type="text"
                placeholder="e.g. Cashier selected wrong payment mode..."
                value={resettleNotes}
                onChange={e => setResettleNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setResettleBill(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResettle}
                disabled={resettling}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
                  fontWeight: 800, cursor: resettling ? 'not-allowed' : 'pointer', fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(230,57,70,0.3)'
                }}
              >
                {resettling ? 'Resettling...' : 'Confirm Resettlement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Cancellation Modal */}
      {cancelBillOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '28px',
            width: '90%', maxWidth: '440px', border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', margin: 0 }}>
                  🚫 Cancel Bill #{cancelBillOrder.orderNumber || cancelBillOrder.id}
                </h3>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  Amount: <strong>₹{Math.round(cancelBillOrder.total || calculateTotal(cancelBillOrder))}</strong> • {cancelBillOrder.customerName || 'Dine-In/Takeaway'}
                </div>
              </div>
              <button onClick={() => setCancelBillOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#9ca3af" />
              </button>
            </div>

            {/* Select Cancellation Reason */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                1. Select Cancellation Reason *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {[
                  'Customer Changed Mind',
                  'Kitchen Delay',
                  'Wrong Items Entered',
                  'Payment Failed',
                  'Quality / Taste Issue',
                  'Other Reason'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReasonPreset(reason)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: cancelReasonPreset === reason ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: cancelReasonPreset === reason ? '#fef2f2' : '#ffffff',
                      color: cancelReasonPreset === reason ? '#dc2626' : '#334155',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {cancelReasonPreset === reason ? '✓ ' : ''}{reason}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Additional notes / details (Optional)"
                value={cancelReasonCustom}
                onChange={e => setCancelReasonCustom(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none'
                }}
              />
            </div>

            {/* Authorize Manager PIN */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                2. Enter Staff / Manager PIN *
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={cancelPin}
                onChange={e => setCancelPin(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px',
                  border: '1.5px solid #cbd5e1', fontSize: '18px', textAlign: 'center',
                  letterSpacing: '4px', boxSizing: 'border-box', outline: 'none', fontWeight: 800
                }}
              />
              {cancelError && (
                <div style={{ color: '#dc2626', fontSize: '12.5px', marginTop: '6px', fontWeight: 700 }}>
                  ⚠️ {cancelError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCancelBillOrder(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
              >
                Keep Bill
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!cancelBillOrder) return
                  const finalReason = (cancelReasonPreset + (cancelReasonCustom ? ` - ${cancelReasonCustom}` : '')).trim()
                  if (!cancelPin || cancelPin.length < 4) { setCancelError('Please enter a 4-digit Manager PIN'); return }

                  setCancelProcessing(true)
                  setCancelError('')
                  try {
                    const resPin = await fetch(`${getApiUrl()}/api/billing/login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pin: cancelPin })
                    })
                    const pinData = await resPin.json()
                    if (!resPin.ok || !pinData.user) {
                      setCancelError('Invalid Manager PIN')
                      setCancelProcessing(false)
                      return
                    }

                    const res = await fetch(`${getApiUrl()}/api/pos/orders/${cancelBillOrder.id || cancelBillOrder.orderNumber}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        status: 'cancelled',
                        cancelReason: finalReason,
                        cancelledBy: pinData.user.name || 'Staff'
                      })
                    })

                    if (res.ok) {
                      setCancelBillOrder(null)
                      setCancelPin('')
                      setCancelReasonCustom('')
                      fetchOrders()
                    } else {
                      const errData = await res.json()
                      setCancelError(errData.error || 'Failed to cancel bill')
                    }
                  } catch (e) {
                    setCancelError('Network error while cancelling bill')
                  }
                  setCancelProcessing(false)
                }}
                disabled={cancelProcessing}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white',
                  fontWeight: 800, cursor: cancelProcessing ? 'not-allowed' : 'pointer', fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.3)'
                }}
              >
                {cancelProcessing ? 'Cancelling...' : 'Confirm Cancel Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Button({ children, variant, onClick, fullWidth, style }) {
  const bg = variant === 'secondary' ? '#f3f4f6' : '#e63946'
  const color = variant === 'secondary' ? '#4b5563' : 'white'
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        background: bg,
        color: color,
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        fontSize: '14px',
        ...style
      }}
    >
      {children}
    </button>
  )
}