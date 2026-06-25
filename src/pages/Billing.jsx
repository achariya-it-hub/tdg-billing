import { useState, useEffect } from 'react'
import { Receipt, CreditCard, Banknote, Smartphone, Check, Clock, X, Printer, Wallet, RefreshCw } from 'lucide-react'
import { getSocket } from '../lib/socket'
import { useSettings } from '../lib/settingsContext'

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'card', name: 'Card', icon: CreditCard },
  { id: 'upi', name: 'UPI', icon: Smartphone },
  { id: 'wallet', name: 'Wallet', icon: Wallet },
]

export default function Billing() {
  const { settings } = useSettings()
  const company = settings?.company || { name: 'Ten Den Gyros', address: 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram', phone: '000000000' }
  const [newKOTs, setNewKOTs] = useState([])
  const [pendingKOTs, setPendingKOTs] = useState([])
  const [paidBills, setPaidBills] = useState([])
  const [complimentaryOrders, setComplimentaryOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKOT, setSelectedKOT] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [processing, setProcessing] = useState(false)

  const getApiUrl = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin
  }

  const fetchOrders = async () => {
    try {
      const [allRes, paidRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/pos/orders`),
        fetch(`${getApiUrl()}/api/pos/orders?status=completed`)
      ])
      if (allRes.ok) {
        const all = await allRes.json()
        const filtered = all.filter(o => o.type !== 'delivery' && o.source !== 'online')
        const comp = filtered.filter(o => o.complimentary)
        setComplimentaryOrders(comp)
        const nonComp = filtered.filter(o => !o.complimentary)
        setNewKOTs(nonComp.filter(o => o.status === 'pending'))
        setPendingKOTs(nonComp.filter(o => o.status === 'ready'))
      }
      if (paidRes.ok) {
        const paid = await paidRes.json()
        const paidComp = paid.filter(o => o.complimentary)
        const paidRegular = paid.filter(o => !o.complimentary)
        setPaidBills(paidRegular)
        if (paidComp.length) setComplimentaryOrders(prev => [...prev, ...paidComp])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  useEffect(() => {
    fetchOrders()
    const socket = getSocket()
    socket.connect()
    socket.on('order:updated', (order) => {
      if (order.type === 'delivery' || order.source === 'online') return
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
      if (order.status === 'ready') {
        setNewKOTs(prev => prev.filter(o => o.id !== order.id))
        setPendingKOTs(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [...prev, order]
        })
        setPaidBills(prev => prev.filter(o => o.id !== order.id))
      } else if (order.status === 'completed') {
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

  const calculateTotal = (kot) => {
    return kot.items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0)
  }

  const calculateTax = (total) => total * 0.18

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
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (!selectedKOT) return
    setProcessing(true)

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
          const total = calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))
          if (balance < total) {
            alert(`Insufficient wallet: ₹${balance} available, need ₹${total.toFixed(0)}`)
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
        body: JSON.stringify({ status: 'completed', paymentStatus: 'paid', paymentMethod: selectedPayment })
      })
      if (res.ok) {
        setPaidBills(prev => [{ ...selectedKOT, status: 'completed', paymentStatus: 'paid' }, ...prev])
        setPendingKOTs(prev => prev.filter(o => o.id !== selectedKOT.id))
      }
      setShowPayment(false)
      setSelectedKOT(null)
    } catch (err) {
      console.error('Payment failed:', err)
    }
    setProcessing(false)
  }

  const printInvoice = (bill) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups for printing')
      return
    }
    const items = bill.items || []
    const total = calculateTotal(bill)
    const tax = calculateTax(total)
    const grandTotal = total + tax
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const html = `
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
            width: 80mm;
            padding: 8px 12px;
            color: #1a1a1a;
            line-height: 1.4;
          }
          .center { text-align: center; }
          .header { padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; margin-bottom: 10px; }
          .brand-name { font-family: 'Georgia', serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c1121f; }
          .brand-tagline { font-size: 9px; letter-spacing: 1px; color: #666; margin-top: 2px; }
          .brand-details { font-size: 9px; color: #888; margin-top: 4px; line-height: 1.3; }
          .divider { border-top: 1px dashed #999; margin: 8px 0; }
          .divider-thick { border-top: 2px solid #1a1a1a; margin: 8px 0; }
          .info-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; }
          .info-label { color: #666; }
          .info-value { font-weight: 600; }
          .col-header { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #999; padding-bottom: 4px; margin-bottom: 4px; }
          .item-row { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; }
          .item-name { flex: 1; }
          .item-qty { width: 30px; text-align: center; }
          .item-price { width: 55px; text-align: right; }
          .subtotal-row { display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 6px 0; border-top: 2px solid #1a1a1a; border-bottom: 2px solid #1a1a1a; margin: 6px 0; }
          .total-amount { color: #c1121f; }
          .payment-info { font-size: 10px; margin: 4px 0; }
          .footer { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #999; }
          .footer-thanks { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #c1121f; margin-bottom: 2px; }
          .footer-message { font-size: 9px; color: #888; }
          .gst-info { font-size: 8px; color: #aaa; text-align: center; margin-top: 6px; }
          @media print {
            body { width: 80mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header center">
          <div class="brand-name">${company.name}</div>
          <div class="brand-tagline">Restaurant Management System</div>
          <div class="brand-details">
            ${company.address ? company.address.replace(/,\s*/g, ',<br/>') + '<br/>' : ''}
            Ph: ${company.phone || '000000000'}
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="info-row">
          <span class="info-label">Bill No:</span>
          <span class="info-value">${String(bill.orderNumber || bill.id).padStart(6, '0')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${dateStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${timeStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Table:</span>
          <span class="info-value">${bill.tableNumber || 'Takeaway'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment:</span>
          <span class="info-value" style="text-transform:capitalize">${bill.paymentMethod || 'cash'}</span>
        </div>
        ${bill.customerName ? `<div class="info-row"><span class="info-label">Customer:</span><span class="info-value">${bill.customerName}</span></div>` : ''}

        <div class="divider"></div>

        <!-- Column Headers -->
        <div class="col-header">
          <span class="item-name">Item</span>
          <span class="item-qty">Qty</span>
          <span class="item-price">Amount</span>
        </div>

        <!-- Items -->
        ${items.map((item, i) => {
          const name = item.menuItemName || item.name || ''
          const qty = item.quantity || item.qty || 1
          const amt = (item.totalPrice || item.price * qty || 0)
          return `
            <div class="item-row">
              <span class="item-name">${name.length > 22 ? name.slice(0, 20) + '..' : name}</span>
              <span class="item-qty">${qty}</span>
              <span class="item-price">₹${amt.toFixed(0)}</span>
            </div>
          `
        }).join('')}

        <div class="divider"></div>

        <!-- Totals -->
        <div class="subtotal-row">
          <span>Subtotal</span>
          <span>₹${total.toFixed(0)}</span>
        </div>
        <div class="subtotal-row">
          <span>GST @ 18%</span>
          <span>₹${tax.toFixed(0)}</span>
        </div>
        <div class="divider-thick"></div>
        <div class="total-row">
          <span>Total</span>
          <span class="total-amount">₹${grandTotal.toFixed(0)}</span>
        </div>

        <!-- Round Off -->
        <div class="payment-info" style="text-align:right;color:#888;font-size:9px">
          Round Off: ₹0.00
        </div>

        <!-- Payment Method -->
        <div class="payment-info center" style="margin-top:8px;font-size:11px">
          Payment: ${bill.paymentMethod ? bill.paymentMethod.toUpperCase() : 'CASH'}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-thanks">Thank You!</div>
          <div class="footer-message">We look forward to serving you again</div>
          <div class="footer-message" style="margin-top:4px">Happy Dining!</div>
        </div>

        <div class="gst-info">
          This is a computer-generated invoice
        </div>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.focus()
      setTimeout(() => printWindow.print(), 300)
    }
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
          { value: newKOTs.length, label: 'Pending KOTs', color: '#f59e0b', bg: '#fffbeb' },
          { value: pendingKOTs.length, label: 'Ready for Billing', color: '#e63946', bg: '#fef2f2' },
          { value: complimentaryOrders.length, label: 'Complimentary', color: '#8b5cf6', bg: '#f5f3ff' },
          { value: paidBills.length, label: 'Bills Today', color: '#10b981', bg: '#ecfdf5' },
          { value: `₹${paidBills.reduce((s, b) => s + calculateTotal(b), 0)}`, label: 'Total Collected', color: '#2563eb', bg: '#eff6ff' }
        ].map((stat, i) => (
          <div key={i} style={{ ...glassCard, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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
      </div>

      {/* New KOTs (Pending) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>New KOTs (Pending)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {newKOTs.map(kot => (
            <div key={kot.id} style={{
              ...glassCard,
              padding: '16px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>K{kot.orderNumber}</span>
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
                <button
                  onClick={() => acceptKOT(kot)}
                  style={{
                    padding: '10px 20px',
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
          ))}
          {newKOTs.length === 0 && (
            <div style={{ ...glassCard, padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
              No pending KOTs
            </div>
          )}
        </div>
      </div>

      {/* Complimentary Orders */}
      {complimentaryOrders.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Complimentary Orders</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {complimentaryOrders.map(order => (
              <div key={order.id} style={{
                ...glassCard,
                padding: '16px',
                borderLeft: '4px solid #8b5cf6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>K{order.orderNumber}</span>
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
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
            {pendingKOTs.map(kot => (
              <div key={kot.id} style={{
                ...glassCard,
                padding: '16px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>K{kot.orderNumber}</span>
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
                  <button
                    onClick={() => handleGenerateBill(kot)}
                    style={{
                      padding: '10px 20px',
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
            ))}
            {pendingKOTs.length === 0 && (
              <div style={{ ...glassCard, padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                No KOTs ready for billing
              </div>
            )}
          </div>
        </div>

        {/* Today's Bills */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Today's Bills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paidBills.map(bill => (
              <div key={bill.id} style={{
                ...glassCard,
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>K{bill.orderNumber}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{bill.tableNumber ? `Table ${bill.tableNumber}` : bill.type} • {bill.paymentMethod || 'cash'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>₹{calculateTotal(bill)}</div>
                    <div style={{ fontSize: '12px', color: '#10b981' }}>{new Date(bill.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
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
            ))}
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
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>Generate Bill</h3>
              <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>KOT #{selectedKOT.orderNumber}</span>
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
                  <span>₹{calculateTotal(selectedKOT)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Tax (18%)</span>
                  <span>₹{calculateTax(calculateTotal(selectedKOT)).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: '#e63946' }}>₹{(calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT))).toFixed(0)}</span>
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