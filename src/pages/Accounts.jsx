import { useState, useEffect } from 'react'
import { Wallet, Receipt, Building2, Plus, Search, Trash2, Download, FileText, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, Landmark, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const API = () => window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin

const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank Transfer', icon: Landmark },
  { id: 'cheque', label: 'Cheque', icon: FileText },
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: CreditCard },
]

const TABS = [
  { id: 'due-bills', label: 'Due Bills', icon: AlertTriangle },
  { id: 'payments', label: 'Vendor Payments', icon: Wallet },
  { id: 'gst', label: 'GST Filing', icon: Receipt },
  { id: 'balances', label: 'Vendor Balances', icon: Building2 },
]

export default function Accounts() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('payments')
  const [payments, setPayments] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [grns, setGrns] = useState([])
  const [balances, setBalances] = useState([])
  const [dueBills, setDueBills] = useState([])
  const [gstData, setGstData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [gstPeriod, setGstPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [paymentForm, setPaymentForm] = useState({
    supplier: '', poId: '', grnId: '', amount: '',
    paymentMethod: 'bank', reference: '', paymentDate: new Date().toISOString().split('T')[0], notes: ''
  })

  const fetchData = () => {
    Promise.all([
      fetch(`${API()}/api/admin/vendor-payments`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/admin/suppliers`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/admin/purchase-orders`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/admin/grns`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/accounts/vendor-balances`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/accounts/due-bills`).then(r => r.json()).catch(() => []),
    ]).then(([p, s, po, g, b, db]) => {
      if (p?.length) setPayments(p)
      if (s?.length) setSuppliers(s)
      if (po?.length) setPurchaseOrders(po)
      if (g?.length) setGrns(g)
      if (b?.length) setBalances(b)
      if (db?.length) setDueBills(db)
    })
  }

  const fetchGst = () => {
    fetch(`${API()}/api/accounts/gst-summary?period=${gstPeriod}`)
      .then(r => r.json())
      .then(d => setGstData(d))
      .catch(() => setGstData(null))
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (activeTab === 'gst') fetchGst() }, [activeTab, gstPeriod])

  const handleSavePayment = async () => {
    if (!paymentForm.supplier || !paymentForm.amount || !paymentForm.paymentMethod) {
      toast.error('Supplier, amount, and payment method required'); return
    }
    try {
      const r = await fetch(`${API()}/api/admin/vendor-payments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      })
      if (!r.ok) throw Error()
      const saved = await r.json()
      setPayments(prev => [saved, ...prev])
      toast.success(`Payment of ₹${Number(paymentForm.amount).toLocaleString()} recorded`)
      setShowPaymentModal(false)
      setPaymentForm({ supplier: '', poId: '', grnId: '', amount: '', paymentMethod: 'bank', reference: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    } catch { toast.error('Failed to record payment') }
  }

  const handleDeletePayment = async (id) => {
    if (!confirm('Delete this payment record?')) return
    try {
      await fetch(`${API()}/api/admin/vendor-payments/${id}`, { method: 'DELETE' })
      setPayments(prev => prev.filter(p => p.id !== id))
      toast.success('Payment deleted')
      fetchData()
    } catch { toast.error('Delete failed') }
  }

  const handleExportGst = () => {
    if (!gstData) return
    const rows = [
      ['Parameter', 'Value'],
      ['Period', gstData.period],
      ['Sales Tax Rate', `${gstData.salesTaxRate}%`],
      ['Purchase Tax Rate', `${gstData.purchaseTaxRate}%`],
      [''],
      ['OUTPUT GST'],
      ['Total Sales (incl. tax)', `₹${gstData.totalSales.toLocaleString()}`],
      ['Taxable Sales', `₹${gstData.taxableSales.toLocaleString()}`],
      ['Output GST (5%)', `₹${gstData.outputGst.toLocaleString()}`],
      ['Invoice Count', gstData.invoiceCount],
      [''],
      ['INPUT GST (ITC)'],
      ['Total Purchases (incl. tax)', `₹${gstData.totalPurchases.toLocaleString()}`],
      ['Taxable Purchases', `₹${gstData.taxablePurchases.toLocaleString()}`],
      ['Input GST on Purchases', `₹${gstData.inputGst.toLocaleString()}`],
      ['Input GST on GRNs', `₹${gstData.inputGstGrn.toLocaleString()}`],
      [''],
      ['NET GST'],
      ['Net GST Payable', `₹${gstData.netGstPayable.toLocaleString()}`],
    ]
    if (gstData.netGstRefund > 0) {
      rows.push(['Net GST Refund', `₹${gstData.netGstRefund.toLocaleString()}`])
    }
    // Sales invoice detail
    if (gstData.salesInvoices?.length > 0) {
      rows.push([''], ['TAXABLE SALES INVOICES'], ['Invoice ID', 'Date', 'Customer', 'Total', 'Taxable Value', 'GST Amount', 'Payment Method'])
      gstData.salesInvoices.forEach(inv => {
        rows.push([inv.id, inv.date, inv.customer, `₹${inv.total}`, `₹${inv.taxable}`, `₹${inv.gst}`, inv.paymentMethod])
      })
    }
    // Purchase invoice detail
    if (gstData.purchaseInvoices?.length > 0) {
      rows.push([''], ['TAXABLE PURCHASE INVOICES'], ['ID', 'Date', 'Supplier', 'Items', 'Total', 'Taxable Value', 'ITC Amount'])
      gstData.purchaseInvoices.forEach(inv => {
        rows.push([inv.id, inv.date, inv.supplier, String(inv.items), `₹${inv.total}`, `₹${inv.taxable}`, `₹${inv.gst}`])
      })
    }
    // GRN invoice detail
    if (gstData.grnInvoices?.length > 0) {
      rows.push([''], ['GOODS RECEIPT NOTES (GRN)'], ['GRN ID', 'Date', 'Supplier', 'Invoice No', 'Total', 'Taxable Value', 'ITC Amount'])
      gstData.grnInvoices.forEach(inv => {
        rows.push([inv.id, inv.date, inv.supplier, inv.invoiceNo, `₹${inv.total}`, `₹${inv.taxable}`, `₹${inv.gst}`])
      })
    }
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `gst-summary-${gstData.period}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success('GST summary exported')
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.3)', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }

  const filteredPayments = payments.filter(p =>
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paymentMethodIcon = (method) => {
    const m = PAYMENT_METHODS.find(pm => pm.id === method)
    return m ? m.icon : DollarSign
  }

  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Accounts
        </h2>
        <p style={{ color: '#6b7280' }}>Vendor payments and GST filing</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.75)',
              color: activeTab === tab.id ? 'white' : '#4b5563',
              backdropFilter: 'blur(10px)',
              boxShadow: activeTab === tab.id ? '0 4px 16px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s'
            }}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== DUE BILLS TAB ==================== */}
      {activeTab === 'due-bills' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} color="#dc2626" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{dueBills.length}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Due Bills</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={24} color="#dc2626" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>₹{dueBills.reduce((s, b) => s + b.balance, 0).toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Outstanding</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{new Set(dueBills.map(b => b.supplier)).size}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Vendors Owed</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={24} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{dueBills.filter(b => b.type === 'PO').length} PO / {dueBills.filter(b => b.type === 'GRN').length} GRN</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Pending Invoices</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Due Bills Table */}
          <Card padding="none">
            {dueBills.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <CheckCircle size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p>No due bills! All vendor invoices are paid.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Vendor</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Invoice / Ref</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Paid</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Balance</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueBills.map(bill => (
                      <tr key={bill.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                            background: bill.type === 'PO' ? '#eff6ff' : bill.type === 'GRN' ? '#f0fdf4' : '#fef3c7',
                            color: bill.type === 'PO' ? '#2563eb' : bill.type === 'GRN' ? '#16a34a' : '#d97706'
                          }}>
                            {bill.type}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{bill.date || '-'}</td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{bill.supplier}</td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <strong>{bill.id}</strong>
                          {bill.invoiceNo && <span style={{ color: '#6b7280', marginLeft: '8px' }}>Inv: {bill.invoiceNo}</span>}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{bill.total.toLocaleString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{bill.paid.toLocaleString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{bill.balance.toLocaleString()}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                            background: bill.status === 'unpaid' ? '#fef2f2' : '#fefce8',
                            color: bill.status === 'unpaid' ? '#dc2626' : '#d97706'
                          }}>
                            {bill.status === 'unpaid' ? 'Unpaid' : 'Partial'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button onClick={() => {
                            setPaymentForm({
                              supplier: bill.supplier,
                              poId: bill.type === 'PO' ? bill.id : '',
                              grnId: bill.type === 'GRN' ? bill.id : '',
                              amount: bill.balance,
                              paymentMethod: 'bank',
                              reference: '',
                              paymentDate: new Date().toISOString().split('T')[0],
                              notes: `Payment for ${bill.type} ${bill.id}`
                            })
                            setShowPaymentModal(true)
                          }}
                            style={{
                              padding: '8px 14px', border: 'none', borderRadius: '8px',
                              background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
                              fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                            <Plus size={14} /> Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== VENDOR PAYMENTS TAB ==================== */}
      {activeTab === 'payments' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={24} color="#e63946" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{totalPaid.toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Paid</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={24} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{payments.length}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Transactions</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{new Set(payments.map(p => p.supplier)).size}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Vendors Paid</div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={24} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{payments.filter(p => p.paymentMethod === 'upi' || p.paymentMethod === 'bank').length}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Digital Payments</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Search by vendor or reference..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontSize: '14px' }} />
            </div>
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus size={18} /> Record Payment
            </Button>
          </div>

          {/* Payments Table */}
          <Card padding="none">
            {filteredPayments.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Wallet size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Vendor</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Method</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reference</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>PO / GRN</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => {
                      const PMethod = PAYMENT_METHODS.find(m => m.id === payment.paymentMethod)
                      const PMIcon = PMethod?.icon || DollarSign
                      return (
                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>{payment.paymentDate}</td>
                          <td style={{ padding: '16px', fontWeight: 600 }}>{payment.supplier}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, width: 'fit-content' }}>
                              <PMIcon size={14} color="#6b7280" /> {PMethod?.label || payment.paymentMethod}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{payment.reference || '-'}</td>
                          <td style={{ padding: '16px', fontSize: '13px' }}>
                            {payment.poId && <span style={{ color: '#3b82f6', fontWeight: 600 }}>{payment.poId}</span>}
                            {payment.poId && payment.grnId && <span style={{ color: '#9ca3af' }}> / </span>}
                            {payment.grnId && <span style={{ color: '#10b981', fontWeight: 600 }}>{payment.grnId}</span>}
                            {!payment.poId && !payment.grnId && <span style={{ color: '#9ca3af' }}>-</span>}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                            ₹{payment.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button onClick={() => handleDeletePayment(payment.id)}
                              style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={16} color="#dc2626" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
                      <td colSpan={5} style={{ padding: '16px', textAlign: 'right' }}>Total:</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626' }}>
                        ₹{filteredPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== GST FILING TAB ==================== */}
      {activeTab === 'gst' && (
        <div>
          {/* Period Selector */}
          <div style={{ ...glassCard, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontWeight: 600, color: '#4b5563', fontSize: '14px' }}>Filing Period:</label>
            <input type="month" value={gstPeriod} onChange={e => setGstPeriod(e.target.value)}
              style={{ ...inputStyle, width: '200px' }} />
            <Button variant="secondary" size="sm" onClick={handleExportGst} disabled={!gstData}>
              <Download size={16} /> Export CSV
            </Button>
          </div>

          {!gstData ? (
            <div style={{ ...glassCard, textAlign: 'center', padding: '48px' }}>
              <Receipt size={48} color="#9ca3af" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#6b7280' }}>No data for this period. Select a period with sales and purchases.</p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ ...glassCard, textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
                  <ArrowUpRight size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>₹{gstData.outputGst.toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Output GST (Sales)</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{gstData.invoiceCount} invoices</div>
                </div>
                <div style={{ ...glassCard, textAlign: 'center', borderTop: '4px solid #10b981' }}>
                  <ArrowDownLeft size={24} color="#10b981" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>₹{(gstData.inputGst + gstData.inputGstGrn).toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Input GST (ITC)</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Purchases + GRNs</div>
                </div>
                <div style={{ ...glassCard, textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                  <Receipt size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>₹{gstData.totalSales.toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Sales (incl. tax)</div>
                </div>
                <div style={{ ...glassCard, textAlign: 'center', borderTop: gstData.netGstPayable > 0 ? '4px solid #dc2626' : '4px solid #10b981' }}>
                  <DollarSign size={24} color={gstData.netGstPayable > 0 ? '#dc2626' : '#10b981'} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '28px', fontWeight: 700, color: gstData.netGstPayable > 0 ? '#dc2626' : '#10b981' }}>
                    ₹{Math.abs(gstData.netGstPayable).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{gstData.netGstPayable > 0 ? 'Net GST Payable' : 'Net GST Refund'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Output GST Details */}
                <div style={glassCard}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                    <ArrowUpRight size={20} /> Output GST Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>Total Sales (incl. GST)</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.totalSales.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>Taxable Value</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.taxableSales.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>GST Rate</span>
                      <span style={{ fontWeight: 700 }}>{gstData.salesTaxRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>Output CGST (2.5%)</span>
                      <span style={{ fontWeight: 700 }}>₹{Math.round(gstData.outputGst / 2).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ color: '#6b7280' }}>Output SGST (2.5%)</span>
                      <span style={{ fontWeight: 700 }}>₹{Math.round(gstData.outputGst / 2).toLocaleString()}</span>
                    </div>
                  </div>
                  {gstData.byPaymentMethod && Object.keys(gstData.byPaymentMethod).length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>By Payment Method</div>
                      {Object.entries(gstData.byPaymentMethod).map(([method, amount]) => (
                        <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                          <span style={{ textTransform: 'capitalize', color: '#6b7280' }}>{method}</span>
                          <span style={{ fontWeight: 600 }}>₹{Math.round(amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input GST Details */}
                <div style={glassCard}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                    <ArrowDownLeft size={20} /> Input GST (ITC) Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>Total Purchases (incl. GST)</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.totalPurchases.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>Taxable Purchases</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.taxablePurchases.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>GST Rate</span>
                      <span style={{ fontWeight: 700 }}>{gstData.purchaseTaxRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>ITC on Purchases</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.inputGst.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ color: '#6b7280' }}>ITC on GRNs (Goods Receipt)</span>
                      <span style={{ fontWeight: 700 }}>₹{gstData.inputGstGrn.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net GST Summary */}
              <div style={{ ...glassCard, border: `2px solid ${gstData.netGstPayable > 0 ? '#dc2626' : '#10b981'}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt size={20} /> Net GST Summary for {gstData.period}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600, marginBottom: '4px' }}>Output GST</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>₹{gstData.outputGst.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>Input ITC</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>₹{(gstData.inputGst + gstData.inputGstGrn).toLocaleString()}</div>
                  </div>
                  <div style={{ background: gstData.netGstPayable > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: gstData.netGstPayable > 0 ? '#991b1b' : '#166534', fontWeight: 600, marginBottom: '4px' }}>
                      {gstData.netGstPayable > 0 ? 'Net GST Payable' : 'Net GST Refund'}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: gstData.netGstPayable > 0 ? '#dc2626' : '#10b981' }}>
                      ₹{Math.abs(gstData.netGstPayable).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                  GST calculation based on {gstData.salesTaxRate}% rate. Taxable value = Total / (100 + rate) × 100
                </div>
              </div>

              {/* Taxable Sales Invoices */}
              {gstData.salesInvoices?.length > 0 && (
                <div style={{ ...glassCard, marginTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                    <ArrowUpRight size={20} /> Taxable Sales Invoices ({gstData.salesInvoices.length})
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Invoice</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Taxable</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>GST</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gstData.salesInvoices.map((inv, i) => (
                          <tr key={inv.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '13px' }}>{inv.id || 'N/A'}</td>
                            <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '13px' }}>{inv.date}</td>
                            <td style={{ padding: '10px 12px', fontSize: '13px' }}>{inv.customer}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>₹{inv.total.toLocaleString()}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>₹{inv.taxable.toLocaleString()}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#3b82f6' }}>₹{inv.gst.toLocaleString()}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{ textTransform: 'capitalize', fontSize: '12px', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                                {inv.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                          <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right' }}>Total:</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{gstData.totalSales.toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{gstData.taxableSales.toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3b82f6' }}>₹{gstData.outputGst.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Purchase Invoices (Input GST) */}
              {(gstData.purchaseInvoices?.length > 0 || gstData.grnInvoices?.length > 0) && (
                <div style={{ ...glassCard, marginTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                    <ArrowDownLeft size={20} /> Taxable Purchase Invoices (Input GST)
                  </h3>

                  {gstData.purchaseInvoices?.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>Direct Purchases ({gstData.purchaseInvoices.length})</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Items</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Taxable</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ITC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gstData.purchaseInvoices.map((inv, i) => (
                              <tr key={inv.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '13px' }}>{inv.id.slice(0, 10)}</td>
                                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '13px' }}>{inv.date}</td>
                                <td style={{ padding: '10px 12px', fontSize: '13px' }}>{inv.supplier}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px' }}>{inv.items}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>₹{inv.total.toLocaleString()}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>₹{inv.taxable.toLocaleString()}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#10b981' }}>₹{inv.gst.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                              <td colSpan={4} style={{ padding: '10px 12px', textAlign: 'right' }}>Total:</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{gstData.totalPurchases.toLocaleString()}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{gstData.taxablePurchases.toLocaleString()}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#10b981' }}>₹{gstData.inputGst.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {gstData.grnInvoices?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>Goods Receipt Notes ({gstData.grnInvoices.length})</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>GRN</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Invoice</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Taxable</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ITC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gstData.grnInvoices.map((inv, i) => (
                              <tr key={inv.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '13px' }}>{inv.id}</td>
                                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '13px' }}>{inv.date}</td>
                                <td style={{ padding: '10px 12px', fontSize: '13px' }}>{inv.supplier}</td>
                                <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280' }}>{inv.invoiceNo || '-'}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>₹{inv.total.toLocaleString()}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>₹{inv.taxable.toLocaleString()}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#10b981' }}>₹{inv.gst.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                              <td colSpan={4} style={{ padding: '10px 12px', textAlign: 'right' }}>Total:</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{gstData.totalGrnValue.toLocaleString()}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{Math.round(gstData.totalGrnValue * 100 / (100 + gstData.purchaseTaxRate)).toLocaleString()}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#10b981' }}>₹{gstData.inputGstGrn.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== VENDOR BALANCES TAB ==================== */}
      {activeTab === 'balances' && (
        <div>
          <Card padding="none">
            {balances.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Building2 size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p>No vendor data available</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Vendor</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Ordered</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Paid</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Balance</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.filter(b => b.totalOrdered > 0 || b.totalPaid > 0).map(b => (
                      <tr key={b.supplierId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{b.supplierName}</td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{b.category}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{b.totalOrdered.toLocaleString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{b.totalPaid.toLocaleString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: b.balance > 0 ? '#dc2626' : '#10b981' }}>
                          ₹{Math.abs(b.balance).toLocaleString()}
                          <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', fontWeight: 400 }}>
                            {b.balance > 0 ? 'Outstanding' : 'Cleared'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                            {b.paymentCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
                      <td colSpan={2} style={{ padding: '16px' }}>Total</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        ₹{balances.reduce((s, b) => s + b.totalOrdered, 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#10b981' }}>
                        ₹{balances.reduce((s, b) => s + b.totalPaid, 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626' }}>
                        ₹{balances.reduce((s, b) => s + b.balance, 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================== RECORD PAYMENT MODAL ==================== */}
      <Modal isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); setPaymentForm({ supplier: '', poId: '', grnId: '', amount: '', paymentMethod: 'bank', reference: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' }) }} title="Record Vendor Payment" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Vendor *</label>
              <select value={paymentForm.supplier} onChange={e => setPaymentForm({ ...paymentForm, supplier: e.target.value })}
                style={inputStyle}>
                <option value="">Select Vendor</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Amount *</label>
              <input type="number" step="0.01" value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Payment Method *</label>
              <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                style={inputStyle}>
                {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Payment Date</label>
              <input type="date" value={paymentForm.paymentDate}
                onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Reference (Cheque/UTR/Receipt No.)</label>
              <input type="text" value={paymentForm.reference}
                onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                placeholder="e.g. CHQ-001, UTR123456" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Link to PO</label>
              <select value={paymentForm.poId} onChange={e => setPaymentForm({ ...paymentForm, poId: e.target.value })}
                style={inputStyle}>
                <option value="">None (Direct Payment)</option>
                {purchaseOrders.filter(po => po.supplier === paymentForm.supplier).map(po =>
                  <option key={po.id} value={po.id}>{po.id} - ₹{po.total.toLocaleString()}</option>
                )}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Link to GRN</label>
              <select value={paymentForm.grnId} onChange={e => setPaymentForm({ ...paymentForm, grnId: e.target.value })}
                style={inputStyle}>
                <option value="">None</option>
                {grns.filter(g => g.supplier === paymentForm.supplier).map(grn =>
                  <option key={grn.id} value={grn.id}>{grn.id} - ₹{grn.totalValue.toLocaleString()}</option>
                )}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Notes</label>
              <input type="text" value={paymentForm.notes}
                onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Optional notes" style={inputStyle} />
            </div>
          </div>
          <Button fullWidth onClick={handleSavePayment}>
            <Plus size={18} /> Record Payment
          </Button>
        </div>
      </Modal>
    </div>
  )
}