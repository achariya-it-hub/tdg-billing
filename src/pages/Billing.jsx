import { useState, useEffect } from 'react'
import { Receipt, CreditCard, Banknote, Smartphone, Check, Clock, X, Printer, Wallet, RefreshCw } from 'lucide-react'
import { getSocket } from '../lib/socket'

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'card', name: 'Card', icon: CreditCard },
  { id: 'upi', name: 'UPI', icon: Smartphone },
  { id: 'wallet', name: 'Wallet', icon: Wallet },
]

export default function Billing() {
  const [pendingKOTs, setPendingKOTs] = useState([])
  const [paidBills, setPaidBills] = useState([])
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
      const [readyRes, paidRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/pos/orders?status=ready`),
        fetch(`${getApiUrl()}/api/pos/orders?status=completed`)
      ])
      if (readyRes.ok) {
        let ready = await readyRes.json()
        ready = ready.filter(o => o.type !== 'delivery' && o.source !== 'online')
        setPendingKOTs(ready)
      }
      if (paidRes.ok) {
        const paid = await paidRes.json()
        setPaidBills(paid)
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
      if (order.status === 'ready') {
        setPendingKOTs(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [...prev, order]
        })
        setPaidBills(prev => prev.filter(o => o.id !== order.id))
      } else if (order.status === 'completed') {
        setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
        setPaidBills(prev => {
          if (prev.find(o => o.id === order.id)) return prev
          return [order, ...prev]
        })
      } else {
        setPendingKOTs(prev => prev.filter(o => o.id !== order.id))
      }
    })
    socket.on('order:created', (order) => {
      if (order.type === 'delivery' || order.source === 'online') return
      if (order.status === 'ready') {
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
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${bill.orderNumber || bill.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo-text { font-size: 20px; font-weight: bold; color: #e63946; }
          .divider { border-bottom: 1px dashed #333; margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">TDG BILLING</div>
          <div>Restaurant Management System</div>
        </div>
        <div class="divider"></div>
        <div><strong>Invoice No:</strong> ${bill.orderNumber || bill.id}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Time:</strong> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div><strong>Table:</strong> ${bill.tableNumber || 'N/A'}</div>
        <div class="divider"></div>
        ${items.map(item => `
          <div class="item">
            <span>${item.menuItemName || item.name} x${item.quantity || item.qty}</span>
            <span>₹${((item.totalPrice || item.price * item.quantity) || 0).toFixed(0)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="item"><span>Subtotal</span><span>₹${total.toFixed(0)}</span></div>
        <div class="item"><span>Tax (18%)</span><span>₹${tax.toFixed(0)}</span></div>
        <div class="total">Total: ₹${grandTotal.toFixed(0)}</div>
        <div class="item"><span>Payment:</span><span>${bill.paymentMethod || 'cash'}</span></div>
        <div class="divider"></div>
        <div class="footer">
          Thank you for dining with us!<br/>
          Please visit again
        </div>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => printWindow.print()
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Billing Counter
        </h2>
        <p style={{ color: '#6b7280' }}>Generate bills from completed KOTs</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#e63946' }}>{pendingKOTs.length}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Ready for Billing</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{paidBills.length}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Bills Today</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>₹{paidBills.reduce((s, b) => s + calculateTotal(b), 0)}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Collected</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <Button variant="secondary" onClick={fetchOrders}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Pending KOTs */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Pending KOTs (Ready)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingKOTs.map(kot => (
              <div key={kot.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                border: '2px solid #10b981'
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
                      background: '#e63946',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Receipt size={16} />
                    Generate Bill
                  </button>
                </div>
              </div>
            ))}
            {pendingKOTs.length === 0 && (
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#9ca3af' }}>
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
                background: 'white',
                borderRadius: '12px',
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
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '90%',
            maxWidth: '450px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>Generate Bill</h3>
              <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
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
                      background: selectedPayment === pm.id ? '#e63946' : '#f3f4f6',
                      color: selectedPayment === pm.id ? 'white' : '#4b5563',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
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
                background: processing ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
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