import { useState, useEffect } from 'react'
import { BarChart3, FileText, Package, Utensils, Receipt, XCircle, TrendingDown, TrendingUp, Download, Sun, DollarSign, ShoppingCart, TrendingUp as TrendingUpIcon, ReceiptText } from 'lucide-react'


const sampleKOTData = [
  { id: 'K001', table: 'T1', items: ['Zinger Burger x2', 'Pepsi x2'], total: 656, time: '12:30 PM', status: 'completed' },
  { id: 'K002', table: 'T3', items: ['Hot Wings x1', 'Fries x1'], total: 398, time: '12:45 PM', status: 'completed' },
  { id: 'K003', table: 'T2', items: ['Classic Burger x1', 'Masala Chai x1'], total: 248, time: '1:00 PM', status: 'preparing' },
  { id: 'K004', table: 'T5', items: ['Family Bucket x1'], total: 999, time: '1:15 PM', status: 'ready' },
  { id: 'K005', table: 'T4', items: ['Double Decker x1', 'Coleslaw x1'], total: 408, time: '1:30 PM', status: 'cancelled' },
]

const sampleBillData = [
  { billNo: 'B001', kotId: 'K001', amount: 656, payment: 'cash', time: '1:00 PM', status: 'paid' },
  { billNo: 'B002', kotId: 'K002', amount: 398, payment: 'upi', time: '1:15 PM', status: 'paid' },
  { billNo: 'B003', kotId: 'K003', amount: 0, payment: '-', time: '1:30 PM', status: 'pending' },
  { billNo: 'B004', kotId: 'K004', amount: 0, payment: '-', time: '1:45 PM', status: 'pending' },
]

const sampleInventoryData = [
  { item: 'Chicken Breast', opening: 50, received: 20, consumed: 45, closing: 25, unit: 'kg', cost: 180 },
  { item: 'Burger Buns', opening: 200, received: 100, consumed: 180, closing: 120, unit: 'pcs', cost: 8 },
  { item: 'Fries (Frozen)', opening: 30, received: 15, consumed: 35, closing: 10, unit: 'kg', cost: 45 },
  { item: 'Cooking Oil', opening: 40, received: 10, consumed: 30, closing: 20, unit: 'liters', cost: 120 },
  { item: 'Pepsi Syrup', opening: 20, received: 5, consumed: 18, closing: 7, unit: 'liters', cost: 350 },
]

const sampleRecipeData = [
  { menuItem: 'Zinger Burger', ingredients: 'Chicken, Bun, Lettuce, Tomato, Cheese, Oil', cost: 85, price: 249, margin: '66%' },
  { menuItem: 'Hot Wings (6pc)', ingredients: 'Chicken Wings, Oil', cost: 82, price: 299, margin: '73%' },
  { menuItem: 'Classic Burger', ingredients: 'Chicken, Bun, Lettuce, Tomato', cost: 62, price: 199, margin: '69%' },
  { menuItem: 'Pepsi (500ml)', ingredients: 'Pepsy Syrup, Water', cost: 12, price: 79, margin: '85%' },
  { menuItem: 'Masala Chai', ingredients: 'Tea Leaves, Milk, Spices', cost: 8, price: 49, margin: '84%' },
]

const reportTypes = [
  { id: 'daily-closing', name: 'Daily Closing', icon: Sun, desc: 'Day Summary & Profit' },
  { id: 'kot', name: 'KOT Report', icon: FileText, desc: 'Kitchen Order Tickets' },
  { id: 'bill', name: 'Bill Report', icon: Receipt, desc: 'Bills & Payments' },
  { id: 'kot-cancelled', name: 'Cancelled KOT', icon: XCircle, desc: 'Cancelled Orders' },
  { id: 'food-cost', name: 'Food Costing', icon: TrendingDown, desc: 'Item Cost Analysis' },
  { id: 'consumption', name: 'Food Consumption', icon: Utensils, desc: 'Daily Consumption' },
  { id: 'stock-opening', name: 'Opening Stock', icon: Package, desc: 'Opening Inventory' },
  { id: 'stock-closing', name: 'Closing Stock', icon: Package, desc: 'Closing Inventory' },
  { id: 'recipe', name: 'Recipe Mapping', icon: BarChart3, desc: 'Recipe & Ingredients' },
]

export default function Reports() {
  const [activeReport, setActiveReport] = useState('daily-closing')
  const [dateRange, setDateRange] = useState('today')
  const [closing, setClosing] = useState(null)
  const [loading, setLoading] = useState(false)

  const getDateString = () => {
    const d = new Date()
    if (dateRange === 'yesterday') d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (activeReport === 'daily-closing') {
      setLoading(true)
      fetch(`/api/reports/daily-closing?date=${getDateString()}`)
        .then(r => r.json())
        .then(data => setClosing(data))
        .catch(() => setClosing(null))
        .finally(() => setLoading(false))
    }
  }, [activeReport, dateRange])

  const getReportTitle = () => {
    switch (activeReport) {
      case 'daily-closing': return 'Daily Closing Report'
      case 'kot': return 'KOT Report'
      case 'bill': return 'Bill Report'
      case 'kot-cancelled': return 'Cancelled KOT Report'
      case 'food-cost': return 'Food Costing Report'
      case 'consumption': return 'Food Consumption Report'
      case 'stock-opening': return 'Opening Stock Report'
      case 'stock-closing': return 'Closing Stock Report'
      case 'recipe': return 'Recipe Mapping Report'
      default: return 'Reports'
    }
  }

  const renderReport = () => {
    switch (activeReport) {
      case 'daily-closing':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !closing ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                No data available for this date. Place some orders first.
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px', textAlign: 'center' }}>
                    <ReceiptText size={22} color="#10b981" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{closing.totalInvoices}</div>
                    <div style={{ fontSize: '13px', color: '#166534' }}>Total Invoices</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#2563eb" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>₹{closing.totalSales.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>Total Sales</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px', textAlign: 'center' }}>
                    <ShoppingCart size={22} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>₹{closing.avgBasketValue.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#92400e' }}>Avg Basket Value</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px', textAlign: 'center' }}>
                    <TrendingUpIcon size={22} color={closing.grossProfit >= 0 ? '#10b981' : '#dc2626'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: closing.grossProfit >= 0 ? '#10b981' : '#dc2626' }}>₹{closing.grossProfit.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: closing.grossProfit >= 0 ? '#166534' : '#991b1b' }}>Gross Profit</div>
                  </div>
                </div>

                {/* Revenue vs Cost */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Cost Breakdown</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#6b7280' }}>Total Sales</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>₹{closing.totalSales.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#6b7280' }}>Purchases</span>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>- ₹{closing.totalPurchases.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#6b7280' }}>Expenses</span>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>- ₹{closing.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>Gross Profit</span>
                      <span style={{ fontWeight: 800, color: closing.grossProfit >= 0 ? '#10b981' : '#dc2626' }}>₹{closing.grossProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Payment Methods</h4>
                    {Object.keys(closing.byPaymentMethod).length === 0 ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px' }}>No data</p>
                    ) : Object.entries(closing.byPaymentMethod).map(([method, amount]) => (
                      <div key={method} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ textTransform: 'capitalize', color: '#6b7280' }}>{method}</span>
                        <span style={{ fontWeight: 700 }}>₹{Math.round(amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Order Sources</h4>
                    {Object.keys(closing.bySource).length === 0 ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px' }}>No data</p>
                    ) : Object.entries(closing.bySource).map(([source, count]) => (
                      <div key={source} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ textTransform: 'capitalize', color: '#6b7280' }}>{source}</span>
                        <span style={{ fontWeight: 700 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Order Status Breakdown</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {Object.entries(closing.statusBreakdown).map(([status, count]) => (
                      <div key={status} style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: status === 'completed' || status === 'served' || status === 'delivered' ? '#f0fdf4' :
                                    status === 'cancelled' ? '#fef2f2' : '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '14px', color: '#374151' }}>{status}</span>
                        <span style={{ fontWeight: 800, fontSize: '18px', color: 
                          status === 'completed' || status === 'served' || status === 'delivered' ? '#10b981' :
                          status === 'cancelled' ? '#dc2626' : '#f59e0b'
                        }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Expenses */}
                {closing.expenses?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '14px' }}>Today's Expenses</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Category</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closing.expenses.map(exp => (
                          <tr key={exp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'capitalize' }}>{exp.category}</td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>{exp.description}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{exp.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Recent Purchases */}
                {closing.purchases?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '14px' }}>Today's Purchases</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Supplier</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Items</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closing.purchases.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.supplier}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>{p.items?.length || 0}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{p.total?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )

      case 'kot':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>24</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>Total KOTs</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>20</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>Completed</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>3</div>
                <div style={{ fontSize: '13px', color: '#92400e' }}>Preparing</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>1</div>
                <div style={{ fontSize: '13px', color: '#991b1b' }}>Cancelled</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>KOT #</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Table</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Items</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Time</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleKOTData.map(kot => (
                    <tr key={kot.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{kot.id}</td>
                      <td style={{ padding: '16px' }}>{kot.table}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{kot.items.join(', ')}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>{kot.time}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{kot.total}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: kot.status === 'completed' ? '#f0fdf4' : kot.status === 'cancelled' ? '#fef2f2' : '#fef3c7',
                          color: kot.status === 'completed' ? '#166534' : kot.status === 'cancelled' ? '#991b1b' : '#92400e'
                        }}>
                          {kot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'bill':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>₹1,054</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>Total Collected</div>
              </div>
              <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>₹0</div>
                <div style={{ fontSize: '13px', color: '#1e40af' }}>Pending</div>
              </div>
              <div style={{ background: '#f5f3ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>2</div>
                <div style={{ fontSize: '13px', color: '#6b21a8' }}>Transactions</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Bill #</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>KOT Ref</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Payment</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBillData.map(bill => (
                    <tr key={bill.billNo} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{bill.billNo}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{bill.kotId}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{bill.amount}</td>
                      <td style={{ padding: '16px', textAlign: 'center', textTransform: 'capitalize' }}>{bill.payment}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: bill.status === 'paid' ? '#f0fdf4' : '#fef3c7',
                          color: bill.status === 'paid' ? '#166534' : '#92400e'
                        }}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'kot-cancelled':
        return (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <XCircle size={64} color="#dc2626" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Cancelled KOT Report</h3>
              <p style={{ color: '#6b7280' }}>1 KOT cancelled today</p>
              <div style={{ marginTop: '24px', background: '#fef2f2', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>KOT #K005</span>
                  <span style={{ fontWeight: 600 }}>₹408</span>
                </div>
                <div style={{ fontSize: '13px', color: '#991b1b' }}>Reason: Customer left suddenly</div>
              </div>
            </div>
          </div>
        )

      case 'food-cost':
        return (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Menu Item</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Cost</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Price</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Profit</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRecipeData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{item.menuItem}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626' }}>₹{item.cost}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{item.price}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#10b981' }}>₹{item.price - item.cost}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 600,
                          background: '#f0fdf4',
                          color: '#166534'
                        }}>
                          {item.margin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'consumption':
        return (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Opening</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Received</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Consumed</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Cost Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInventoryData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{item.item}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>{item.opening} {item.unit}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>+{item.received} {item.unit}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626' }}>-{item.consumed} {item.unit}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{item.consumed * item.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'stock-opening':
        return (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Quantity</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Unit Cost</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInventoryData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{item.item}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>{item.opening} {item.unit}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>₹{item.cost}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{item.opening * item.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'stock-closing':
        return (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Quantity</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Unit Cost</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInventoryData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{item.item}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>{item.closing} {item.unit}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>₹{item.cost}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>₹{item.closing * item.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'recipe':
        return (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Menu Item</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Ingredients</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRecipeData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{item.menuItem}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>{item.ingredients}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#f0fdf4',
                          color: '#166534'
                        }}>
                          Mapped
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Reports Dashboard
        </h2>
        <p style={{ color: '#6b7280' }}>All business reports and analytics</p>
      </div>

      {/* Report Type Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {reportTypes.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            style={{
              padding: '16px',
              background: activeReport === report.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.75)',
              backdropFilter: activeReport === report.id ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: activeReport === report.id ? 'none' : 'blur(20px)',
              color: activeReport === report.id ? 'white' : '#4b5563',
              border: activeReport === report.id ? 'none' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: activeReport === report.id ? '0 4px 16px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <report.icon size={24} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{report.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>{report.desc}</div>
          </button>
        ))}
      </div>

      {/* Report Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{getReportTitle()}</h3>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <button style={{
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.03)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#4b5563'
          }}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}