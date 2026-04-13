import { useState } from 'react'
import { Receipt, Search, CreditCard, Banknote, Smartphone, Check, Clock, X, Printer, Wallet, RefreshCw } from 'lucide-react'

const pendingKOTs = [
  { id: 'K001', table: 'T1', items: [{ name: 'Zinger Burger', qty: 2, price: 249 }, { name: 'Pepsi', qty: 2, price: 79 }], time: '12:30 PM', status: 'ready' },
  { id: 'K002', table: 'T3', items: [{ name: 'Hot Wings', qty: 1, price: 299 }, { name: 'Fries', qty: 1, price: 99 }], time: '12:45 PM', status: 'ready' },
  { id: 'K003', table: 'T2', items: [{ name: 'Classic Burger', qty: 1, price: 199 }, { name: 'Masala Chai', qty: 1, price: 49 }], time: '1:00 PM', status: 'preparing' },
  { id: 'K004', table: 'T5', items: [{ name: 'Family Bucket', qty: 1, price: 999 }], time: '1:15 PM', status: 'ready' },
]

const sampleBills = [
  { billNo: 'B001', kotId: 'K000', table: 'T4', amount: 656, payment: 'cash', time: '12:00 PM', status: 'paid' },
  { billNo: 'B002', kotId: 'K000', table: 'T6', amount: 398, payment: 'upi', time: '12:30 PM', status: 'paid' },
]

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'card', name: 'Card', icon: CreditCard },
  { id: 'upi', name: 'UPI', icon: Smartphone },
  { id: 'wallet', name: 'Wallet', icon: Wallet },
]

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKOT, setSelectedKOT] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [processing, setProcessing] = useState(false)
  const [bills, setBills] = useState(sampleBills)

  const calculateTotal = (kot) => {
    return kot.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
  }

  const calculateTax = (total) => total * 0.18

  const handleGenerateBill = (kot) => {
    setSelectedKOT(kot)
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (!selectedKOT) return
    setProcessing(true)
    
    setTimeout(() => {
      const newBill = {
        billNo: `B${String(bills.length + 1).padStart(3, '0')}`,
        kotId: selectedKOT.id,
        table: selectedKOT.table,
        items: selectedKOT.items,
        amount: calculateTotal(selectedKOT) + calculateTax(calculateTotal(selectedKOT)),
        payment: selectedPayment,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'paid'
      }
      setBills([newBill, ...bills])
      setShowPayment(false)
      setSelectedKOT(null)
      setProcessing(false)
    }, 1000)
  }

  const pendingReady = pendingKOTs.filter(k => k.status === 'ready')

  const printInvoice = (bill) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups for printing')
      return
    }
    
    const items = bill.items || []
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${bill.billNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { width: 80px; height: auto; margin-bottom: 10px; }
          .logo-text { font-size: 20px; font-weight: bold; color: #e63946; }
          .divider { border-bottom: 1px dashed #333; margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://tdg-billing.vercel.app/TDG%20LOGO.png" class="logo" alt="TDG" />
          <div class="logo-text">TDG BILLING</div>
          <div>Restaurant Management System</div>
        </div>
        <div class="divider"></div>
        <div><strong>Invoice No:</strong> ${bill.billNo}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Time:</strong> ${bill.time}</div>
        <div><strong>Table:</strong> ${bill.table || 'N/A'}</div>
        <div class="divider"></div>
        ${items.map(item => `
          <div class="item">
            <span>${item.name} x${item.qty || item.quantity}</span>
            <span>₹${(item.price * (item.qty || item.quantity)).toFixed(0)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="item"><span>Subtotal</span><span>₹${(bill.amount / 1.18).toFixed(0)}</span></div>
        <div class="item"><span>Tax (18%)</span><span>₹${(bill.amount - bill.amount / 1.18).toFixed(0)}</span></div>
        <div class="total">Total: ₹${bill.amount}</div>
        <div class="item"><span>Payment:</span><span>${bill.payment}</span></div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#e63946' }}>{pendingReady.length}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Ready for Billing</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{bills.length}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Bills Today</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>₹{bills.reduce((s, b) => s + b.amount, 0)}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Collected</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Pending KOTs */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Pending KOTs (Ready)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingReady.map(kot => (
              <div key={kot.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                border: '2px solid #10b981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>{kot.id}</span>
                    <span style={{ marginLeft: '12px', fontSize: '14px', color: '#6b7280' }}>{kot.table}</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                    <Clock size={14} /> {kot.time}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                  {kot.items.map(i => `${i.name} x${i.qty}`).join(', ')}
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
            {pendingReady.length === 0 && (
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
            {bills.map(bill => (
              <div key={bill.billNo} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{bill.billNo}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Table {bill.table} • {bill.payment}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>₹{bill.amount}</div>
                    <div style={{ fontSize: '12px', color: '#10b981' }}>{bill.time}</div>
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
                <span>KOT #{selectedKOT.id}</span>
                <span>Table {selectedKOT.table}</span>
              </div>
              {selectedKOT.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                  <span>{item.name} x{item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
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