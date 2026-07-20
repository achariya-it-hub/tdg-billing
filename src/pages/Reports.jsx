import { useState, useEffect } from 'react'
import { BarChart3, FileText, Package, Utensils, Receipt, XCircle, TrendingDown, TrendingUp, Download, Sun, DollarSign, ShoppingCart, TrendingUp as TrendingUpIcon, ReceiptText, BarChart, ClipboardList, ClipboardCheck, Users, Wallet, Truck } from 'lucide-react'


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
  { menuItem: 'Non-Veg - Crispy Chicken Burger', ingredients: 'Burger Bun, Veggies, Patty x2, Cheese, Burger Sauce, Packaging, Labour', cost: 77.43, price: 99, margin: '21.8%' },
  { menuItem: 'Non-Veg - Spicy Egg Burger', ingredients: 'Burger Bun, Veggies, Patty x1, Cheese, Burger Sauce, Packaging, Labour', cost: 57.03, price: 79, margin: '27.8%' },
  { menuItem: 'Veg - Spicy Paneer Burger', ingredients: 'Burger Bun, Veggies, Patty x1, Cheese, Burger Sauce, Packaging, Labour', cost: 87.31, price: 99, margin: '11.8%' },
  { menuItem: 'Veg - Sprite / Coca-Cola (Regular)', ingredients: 'Cola/Sprite 330ml, Ice Cube, Lime/Peach, Cup with Lid, Straw, Labour', cost: 33.15, price: 59, margin: '43.8%' },
  { menuItem: 'Veg - Sprite / Coca-Cola (Large)', ingredients: 'Cola/Sprite 650ml, Ice Cube, Lime/Peach, Cup with Lid, Straw, Labour', cost: 59.70, price: 99, margin: '39.7%' },
  { menuItem: 'Veg - Chocolate Brownie', ingredients: 'Butter, Dark Compound, Egg, Vanilla, White Sugar, Maida, Brown Sugar, Milk Compound, Packaging, Labour', cost: 44.80, price: 99, margin: '54.7%' },
  { menuItem: 'Veg - Blondy Cake', ingredients: 'Butter, White Compound, Egg, Vanilla, White Sugar, Maida, Packaging, Labour', cost: 43.60, price: 99, margin: '56.0%' },
  { menuItem: 'Non-Veg - 3 Pc Crispy Wings (1 Dip)', ingredients: 'Chicken Wings x3, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Wings Box, Tissues, Bags, Labour', cost: 54.71, price: 90, margin: '39.2%' },
  { menuItem: 'Non-Veg - 6 Pc Crispy Wings (2 Dip)', ingredients: 'Chicken Wings x6, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Wings Box, Tissues, Bags, Labour', cost: 73.61, price: 180, margin: '59.1%' },
  { menuItem: 'Non-Veg - 9 Pc Crispy Wings (3 Dip)', ingredients: 'Chicken Wings x9, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Wings Box, Tissues, Bags, Labour', cost: 92.51, price: 270, margin: '65.7%' },
  { menuItem: 'Non-Veg - 20 Pc Crispy Wings (6 Dip)', ingredients: 'Chicken Wings x20, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Wings Box, Tissues, Bags, Labour', cost: 186.55, price: 600, margin: '68.9%' },
  { menuItem: 'Non-Veg - 60 Pc Crispy Wings (12 Dip)', ingredients: 'Chicken Wings x60, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Wings Box, Tissues, Bags, Labour', cost: 398.55, price: 1500, margin: '73.4%' },
  { menuItem: 'Non-Veg - 3 Pc Crispy Strips (1 Dip)', ingredients: 'Chicken Strips x3, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Dinning Tray, Tissues, Bags, Labour', cost: 61.96, price: 120, margin: '48.4%' },
  { menuItem: 'Non-Veg - 6 Pc Crispy Strips (2 Dip)', ingredients: 'Chicken Strips x6, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Dinning Tray, Tissues, Bags, Labour', cost: 90.46, price: 240, margin: '62.3%' },
  { menuItem: 'Non-Veg - 9 Pc Crispy Strips (3 Dip)', ingredients: 'Chicken Strips x9, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Dinning Tray, Tissues, Bags, Labour', cost: 119.86, price: 360, margin: '66.7%' },
  { menuItem: 'Non-Veg - 20 Pc Crispy Strips (6 Dip)', ingredients: 'Chicken Strips x20, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Dinning Tray, Tissues, Bags, Labour', cost: 247.65, price: 800, margin: '69.0%' },
  { menuItem: 'Non-Veg - 60 Pc Crispy Strips (12 Dip)', ingredients: 'Chicken Strips x60, Fried Chicken Mixer, Extra Hot & Spicy, Refined Oil, Dinning Tray, Tissues, Bags, Labour', cost: 703.90, price: 2400, margin: '70.7%' },
  { menuItem: 'Veg - Fries (Peri Peri)', ingredients: 'Potato, Refined Oil, Peri Peri Masala, Cup, Paper Bags, Tissues, Bags, Labour', cost: 47.53, price: 99, margin: '52.0%' },
  { menuItem: 'Veg - Fries (Kaju)', ingredients: 'Potato, Refined Oil, Kaju, Cup, Paper Bags, Tissues, Bags, Labour', cost: 47.64, price: 99, margin: '51.9%' }
]

const reportTypes = [
  { id: 'daily-closing', name: 'Daily Closing', icon: Sun, desc: 'Day Summary & Profit' },
  { id: 'pnl', name: 'P&L Statement', icon: BarChart, desc: 'Profit & Loss Statement' },
  { id: 'po', name: 'PO Report', icon: ShoppingCart, desc: 'Purchase Orders' },
  { id: 'grn', name: 'GRN Report', icon: ClipboardCheck, desc: 'Goods Receipt Notes' },
  { id: 'customer', name: 'Customer Report', icon: Users, desc: 'Customer Activity' },
  { id: 'expense-report', name: 'Expense Report', icon: Wallet, desc: 'Expense Breakdown' },
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
  const [pnlData, setPnlData] = useState(null)
  const [poReport, setPoReport] = useState(null)
  const [grnReport, setGrnReport] = useState(null)
  const [customerReport, setCustomerReport] = useState(null)
  const [expenseReport, setExpenseReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const getDateString = () => {
    const d = new Date()
    if (dateRange === 'yesterday') d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  const getPnlPeriod = () => {
    if (dateRange === 'today' || dateRange === 'yesterday') return 'day'
    return dateRange
  }

  const getDateFrom = () => {
    if (dateRange === 'today') return getDateString()
    if (dateRange === 'yesterday') { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }
    if (dateRange === 'week') { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    if (dateRange === 'month') { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0] }
    return getDateString()
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeReport === 'daily-closing') {
          const r = await fetch(`/api/reports/daily-closing?date=${getDateString()}`)
          setClosing(await r.json())
        } else if (activeReport === 'pnl') {
          const r = await fetch(`/api/reports/pnl?date=${getDateString()}&period=${getPnlPeriod()}`)
          setPnlData(await r.json())
        } else if (activeReport === 'po') {
          const r = await fetch(`/api/reports/purchase-orders?from=${getDateFrom()}&to=${getDateString()}`)
          setPoReport(await r.json())
        } else if (activeReport === 'grn') {
          const r = await fetch(`/api/reports/grns?from=${getDateFrom()}&to=${getDateString()}`)
          setGrnReport(await r.json())
        } else if (activeReport === 'customer') {
          const r = await fetch(`/api/reports/customers?from=${getDateFrom()}&to=${getDateString()}`)
          setCustomerReport(await r.json())
        } else if (activeReport === 'expense-report') {
          const r = await fetch(`/api/reports/expenses?from=${getDateFrom()}&to=${getDateString()}`)
          setExpenseReport(await r.json())
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchData()
  }, [activeReport, dateRange])

  const getReportTitle = () => {
    switch (activeReport) {
      case 'daily-closing': return 'Daily Closing Report'
      case 'pnl': return 'Profit & Loss Statement'
      case 'po': return 'Purchase Orders Report'
      case 'grn': return 'Goods Receipt Notes Report'
      case 'customer': return 'Customer Report'
      case 'expense-report': return 'Expense Report'
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

      case 'pnl':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !pnlData ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                No data available for this period. Place some orders first.
              </div>
            ) : (
              <>
                {/* Period badge */}
                <div style={{ marginBottom: '16px', fontSize: '13px', color: '#6b7280', display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#f3f4f6', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                    {pnlData.period.label === 'day' ? 'Daily' : pnlData.period.label === 'week' ? 'Weekly' : 'Monthly'}
                  </span>
                  <span style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                    {pnlData.period.from} → {pnlData.period.to}
                  </span>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#2563eb" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb' }}>₹{pnlData.revenue.total.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#1e40af' }}>Revenue ({pnlData.revenue.orderCount} orders)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <TrendingDown size={22} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>₹{pnlData.cogs.total.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>COGS ({pnlData.cogs.purchaseCount} purchases)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <TrendingUp size={22} color={pnlData.grossProfit >= 0 ? '#10b981' : '#dc2626'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: pnlData.grossProfit >= 0 ? '#10b981' : '#dc2626' }}>₹{pnlData.grossProfit.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: pnlData.grossProfit >= 0 ? '#166534' : '#991b1b' }}>Gross Profit ({pnlData.grossMargin}% margin)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <BarChart size={22} color={pnlData.netProfit >= 0 ? '#10b981' : '#dc2626'} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: pnlData.netProfit >= 0 ? '#10b981' : '#dc2626' }}>₹{pnlData.netProfit.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: pnlData.netProfit >= 0 ? '#166534' : '#991b1b' }}>Net Profit ({pnlData.netMargin}% margin)</div>
                  </div>
                </div>

                {/* P&L Statement */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Profit & Loss Breakdown */}
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>P&L Summary</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Total Revenue</span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#10b981' }}>₹{pnlData.revenue.total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingLeft: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>Order Count</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{pnlData.revenue.orderCount}</span>
                    </div>
                    {Object.entries(pnlData.revenue.byMethod || {}).map(([method, amount]) => (
                      <div key={method} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>{method}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>₹{Math.round(amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px 0', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>Less: Cost of Goods Sold</span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#dc2626' }}>- ₹{pnlData.cogs.total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px 0', borderTop: '2px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>Gross Profit</span>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: pnlData.grossProfit >= 0 ? '#10b981' : '#dc2626' }}>
                        ₹{pnlData.grossProfit.toLocaleString()} ({pnlData.grossMargin}%)
                      </span>
                    </div>
                    {Object.entries(pnlData.expenses.byCategory || {}).map(([cat, amount]) => (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#dc2626', textTransform: 'capitalize' }}>Less: {cat}</span>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#dc2626' }}>- ₹{Math.round(amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Total Expenses ({pnlData.expenses.count} items)</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#dc2626' }}>- ₹{pnlData.expenses.total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #e63946', marginTop: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>Net Profit / Loss</span>
                      <span style={{ fontWeight: 900, fontSize: '18px', color: pnlData.netProfit >= 0 ? '#10b981' : '#dc2626' }}>
                        ₹{Math.abs(pnlData.netProfit).toLocaleString()} ({pnlData.netMargin}%)
                      </span>
                    </div>
                  </div>

                  {/* Revenue by Payment Method */}
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>Revenue by Payment</h4>
                    {Object.keys(pnlData.revenue.byMethod || {}).length === 0 ? (
                      <p style={{ color: '#9ca3af', fontSize: '13px' }}>No data</p>
                    ) : (
                      Object.entries(pnlData.revenue.byMethod).map(([method, amount]) => {
                        const pct = pnlData.revenue.total > 0 ? (amount / pnlData.revenue.total * 100) : 0
                        return (
                          <div key={method} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ textTransform: 'capitalize', fontSize: '13px', fontWeight: 600 }}>{method}</span>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>₹{Math.round(amount).toLocaleString()} ({Math.round(pct)}%)</span>
                            </div>
                            <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: '3px' }} />
                            </div>
                          </div>
                        )
                      })
                    )}

                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '12px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Expenses by Category</h5>
                      {Object.keys(pnlData.expenses.byCategory || {}).length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '13px' }}>No expenses recorded</p>
                      ) : (
                        Object.entries(pnlData.expenses.byCategory).map(([cat, amount]) => {
                          const pct = pnlData.expenses.total > 0 ? (amount / pnlData.expenses.total * 100) : 0
                          return (
                            <div key={cat} style={{ marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ textTransform: 'capitalize', fontSize: '12px', color: '#6b7280' }}>{cat}</span>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>₹{Math.round(amount).toLocaleString()}</span>
                              </div>
                              <div style={{ height: '4px', background: '#fef2f2', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: '#dc2626', borderRadius: '2px' }} />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {pnlData.cancelled?.count > 0 && (
                      <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#991b1b', fontWeight: 600 }}>Cancelled Orders</span>
                          <span style={{ color: '#991b1b', fontWeight: 700 }}>{pnlData.cancelled.count} (₹{pnlData.cancelled.revenue.toLocaleString()} lost)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 'po':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !poReport ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>No purchase orders in this period.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <ShoppingCart size={22} color="#2563eb" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>{poReport.summary.total}</div>
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>Total POs</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#10b981" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>₹{poReport.summary.totalValue.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#166534' }}>Total Value</div>
                  </div>
                  {Object.entries(poReport.summary.byStatus || {}).slice(0, 2).map(([s, c]) => (
                    <div key={s} style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#6b7280' }}>{c}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{s}</div>
                    </div>
                  ))}
                </div>
                {poReport.orders?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>PO #</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Supplier</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Items</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Expected</th>
                      </tr></thead>
                      <tbody>
                        {poReport.orders.map(po => (
                          <tr key={po.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{po.id}</td>
                            <td style={{ padding: '12px' }}>{po.supplier}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{po.items}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>₹{(po.total || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', background: po.status === 'completed' ? '#f0fdf4' : po.status === 'cancelled' ? '#fef2f2' : '#fef3c7', color: po.status === 'completed' ? '#166534' : po.status === 'cancelled' ? '#991b1b' : '#92400e' }}>{po.status}</span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>{po.expectedDate || '-'}</td>
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

      case 'grn':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !grnReport ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>No GRNs in this period.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <ClipboardCheck size={22} color="#2563eb" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>{grnReport.summary.total}</div>
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>Total GRNs</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#10b981" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>₹{grnReport.summary.totalValue.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#166534' }}>Total Value</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <Truck size={22} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{Object.keys(grnReport.summary.bySupplier || {}).length}</div>
                    <div style={{ fontSize: '13px', color: '#92400e' }}>Suppliers</div>
                  </div>
                </div>
                {grnReport.grns?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>GRN #</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>PO Ref</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Supplier</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Invoice</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Items</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Date</th>
                      </tr></thead>
                      <tbody>
                        {grnReport.grns.map(g => (
                          <tr key={g.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{g.id}</td>
                            <td style={{ padding: '12px', color: '#6b7280' }}>{g.poId || '-'}</td>
                            <td style={{ padding: '12px' }}>{g.supplier}</td>
                            <td style={{ padding: '12px', color: '#6b7280' }}>{g.invoiceNo || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{g.items || 0}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>₹{(g.totalValue || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>{g.date}</td>
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

      case 'customer':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !customerReport ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>No customer data available.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <Users size={22} color="#2563eb" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb' }}>{customerReport.summary.total}</div>
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>Total Customers</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <Users size={22} color="#10b981" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{customerReport.summary.active}</div>
                    <div style={{ fontSize: '13px', color: '#166534' }}>Active (placed orders)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>₹{customerReport.summary.totalSpent.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#92400e' }}>Total Revenue</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <DollarSign size={22} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>₹{customerReport.summary.avgPerCustomer.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#5b21b6' }}>Avg per Customer</div>
                  </div>
                </div>
                {customerReport.customers?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Orders</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total Spent</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Points</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Last Visit</th>
                      </tr></thead>
                      <tbody>
                        {customerReport.customers.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{c.name}</td>
                            <td style={{ padding: '12px', color: '#6b7280' }}>{c.phone}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{c.totalOrders}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>₹{c.totalSpent.toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>{c.points}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>{c.lastVisit ? c.lastVisit.slice(0, 10) : '-'}</td>
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

      case 'expense-report':
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading...</div>
            ) : !expenseReport ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>No expenses in this period.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <Wallet size={22} color="#dc2626" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>₹{expenseReport.summary.totalAmount.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#991b1b' }}>Total Expenses</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <Receipt size={22} color="#6b7280" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#6b7280' }}>{expenseReport.summary.total}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Items</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', textAlign: 'center' }}>
                    <BarChart3 size={22} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>{Object.keys(expenseReport.summary.byCategory || {}).length}</div>
                    <div style={{ fontSize: '13px', color: '#5b21b6' }}>Categories</div>
                  </div>
                </div>

                {/* Category breakdown */}
                {Object.keys(expenseReport.summary.byCategory || {}).length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>By Category</h4>
                    {Object.entries(expenseReport.summary.byCategory).map(([cat, amt]) => {
                      const pct = expenseReport.summary.totalAmount > 0 ? (amt / expenseReport.summary.totalAmount * 100) : 0
                      return (
                        <div key={cat} style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '13px' }}>{cat}</span>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>₹{Math.round(amt).toLocaleString()} ({Math.round(pct)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: '#fef2f2', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#dc2626', borderRadius: '4px' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {expenseReport.expenses?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Category</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Date</th>
                      </tr></thead>
                      <tbody>
                        {expenseReport.expenses.map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{e.category}</td>
                            <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{e.description || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{(e.amount || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>{e.createdAt?.slice(0, 10)}</td>
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

      default:
        return null
    }
  }

  const getReportData = () => {
    switch (activeReport) {
      case 'daily-closing': return closing ? {
        title: 'Daily Closing Report',
        headers: ['Parameter', 'Value'],
        rows: [
          ['Date', closing.date],
          ['Total Invoices', closing.totalInvoices],
          ['Total Sales', `₹${closing.totalSales.toLocaleString()}`],
          ['Total Purchases', `₹${closing.totalPurchases.toLocaleString()}`],
          ['Total Expenses', `₹${closing.totalExpenses.toLocaleString()}`],
          ['Gross Profit', `₹${closing.grossProfit.toLocaleString()}`],
          ['Avg Basket Value', `₹${closing.avgBasketValue.toLocaleString()}`],
        ]
      } : null
      case 'pnl': return pnlData ? {
        title: 'Profit & Loss Statement',
        headers: ['Parameter', 'Value'],
        rows: [
          ['Period', `${pnlData.period.label} (${pnlData.period.from} → ${pnlData.period.to})`],
          [''],
          ['REVENUE'],
          ['Total Revenue', `₹${pnlData.revenue.total.toLocaleString()}`],
          ['Order Count', pnlData.revenue.orderCount],
          ...Object.entries(pnlData.revenue.byMethod || {}).map(([m, a]) => [`  via ${m}`, `₹${Math.round(a).toLocaleString()}`]),
          [''],
          ['COST OF GOODS SOLD'],
          ['Total Purchases (COGS)', `₹${pnlData.cogs.total.toLocaleString()}`],
          ['Purchase Count', pnlData.cogs.purchaseCount],
          [''],
          ['GROSS PROFIT', `₹${pnlData.grossProfit.toLocaleString()}`],
          ['Gross Margin', `${pnlData.grossMargin}%`],
          [''],
          ['EXPENSES'],
          ...Object.entries(pnlData.expenses.byCategory || {}).map(([c, a]) => [c.charAt(0).toUpperCase() + c.slice(1), `₹${Math.round(a).toLocaleString()}`]),
          ['Total Expenses', `₹${pnlData.expenses.total.toLocaleString()}`],
          [''],
          ['NET PROFIT / LOSS', `₹${Math.abs(pnlData.netProfit).toLocaleString()}`],
          ['Net Margin', `${pnlData.netMargin}%`],
          [''],
          ['Cancelled Orders', pnlData.cancelled.count],
          ['Revenue Lost (Cancelled)', `₹${pnlData.cancelled.revenue.toLocaleString()}`],
        ]
      } : null
      case 'kot': return {
        title: 'KOT Report',
        headers: ['KOT #', 'Table', 'Items', 'Time', 'Amount', 'Status'],
        rows: sampleKOTData.map(k => [k.id, k.table, k.items.join(', '), k.time, `₹${k.total}`, k.status])
      }
      case 'bill': return {
        title: 'Bill Report',
        headers: ['Bill #', 'KOT Ref', 'Amount', 'Payment', 'Status'],
        rows: sampleBillData.map(b => [b.billNo, b.kotId, `₹${b.amount}`, b.payment, b.status])
      }
      case 'food-cost': return {
        title: 'Food Costing Report',
        headers: ['Menu Item', 'Cost', 'Price', 'Profit', 'Margin'],
        rows: sampleRecipeData.map(r => [r.menuItem, `₹${r.cost}`, `₹${r.price}`, `₹${r.price - r.cost}`, r.margin])
      }
      case 'consumption': return {
        title: 'Food Consumption Report',
        headers: ['Item', 'Opening', 'Received', 'Consumed', 'Cost Consumed'],
        rows: sampleInventoryData.map(i => [i.item, `${i.opening} ${i.unit}`, `+${i.received} ${i.unit}`, `-${i.consumed} ${i.unit}`, `₹${i.consumed * i.cost}`])
      }
      case 'stock-opening': return {
        title: 'Opening Stock Report',
        headers: ['Item', 'Quantity', 'Unit Cost', 'Total Value'],
        rows: sampleInventoryData.map(i => [i.item, `${i.opening} ${i.unit}`, `₹${i.cost}`, `₹${i.opening * i.cost}`])
      }
      case 'stock-closing': return {
        title: 'Closing Stock Report',
        headers: ['Item', 'Quantity', 'Unit Cost', 'Total Value'],
        rows: sampleInventoryData.map(i => [i.item, `${i.closing} ${i.unit}`, `₹${i.cost}`, `₹${i.closing * i.cost}`])
      }
      case 'recipe': return {
        title: 'Recipe Mapping Report',
        headers: ['Menu Item', 'Ingredients', 'Status'],
        rows: sampleRecipeData.map(r => [r.menuItem, r.ingredients, 'Mapped'])
      }
      case 'po': return poReport ? {
        title: 'Purchase Orders Report',
        headers: ['PO #', 'Supplier', 'Items', 'Total', 'Status', 'Date', 'Expected'],
        rows: poReport.orders?.map(o => [o.id, o.supplier, o.items, `₹${(o.total || 0).toLocaleString()}`, o.status, o.date, o.expectedDate || '-']) || []
      } : null
      case 'grn': return grnReport ? {
        title: 'Goods Receipt Notes Report',
        headers: ['GRN #', 'PO Ref', 'Supplier', 'Invoice', 'Items', 'Total', 'Date'],
        rows: grnReport.grns?.map(g => [g.id, g.poId || '-', g.supplier, g.invoiceNo || '-', g.items || 0, `₹${(g.totalValue || 0).toLocaleString()}`, g.date]) || []
      } : null
      case 'customer': return customerReport ? {
        title: 'Customer Report',
        headers: ['Name', 'Phone', 'Orders', 'Total Spent', 'Points', 'Last Visit'],
        rows: customerReport.customers?.map(c => [c.name, c.phone, c.totalOrders, `₹${c.totalSpent.toLocaleString()}`, c.points, c.lastVisit ? c.lastVisit.slice(0, 10) : '-']) || []
      } : null
      case 'expense-report': return expenseReport ? {
        title: 'Expense Report',
        headers: ['Category', 'Description', 'Amount', 'Date'],
        rows: expenseReport.expenses?.map(e => [e.category, e.description || '-', `₹${(e.amount || 0).toLocaleString()}`, e.createdAt?.slice(0, 10)]) || []
      } : null
      default: return null
    }
  }

  const handleExportExcel = () => {
    const data = getReportData()
    if (!data) return
    const csvContent = [data.headers.join(','), ...data.rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${data.title.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const handleExportPDF = () => {
    const data = getReportData()
    if (!data) return
    const win = window.open('', '_blank')
    if (!win) { alert('Please allow pop-ups for PDF export'); return }
    const rows = data.rows.map((r, i) =>
      `<tr${i % 2 === 1 ? ' style="background:#f9fafb"' : ''}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
    ).join('')
    win.document.write(`
      <!DOCTYPE html><html><head><title>${data.title}</title>
      <style>
        @page { margin: 10mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; color: #1a1a2e; padding: 40px; }
        h1 { font-size: 24px; font-weight: 800; color: #e63946; margin-bottom: 4px; }
        .sub { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #1a1a2e; color: white; padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e63946; font-size: 11px; color: #6b7280; text-align: center; }
        .signature { margin-top: 48px; display: flex; justify-content: space-between; }
        .signature div { text-align: center; width: 200px; }
        .signature .line { border-top: 1px solid #1a1a2e; margin-bottom: 4px; padding-top: 8px; font-size: 12px; color: #6b7280; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style></head>
      <body>
        <h1>${data.title}</h1>
        <div class="sub">TDG Billing System &bull; ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        <table><thead><tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
        <div class="signature">
          <div><div class="line">Prepared By</div></div>
          <div><div class="line">Reviewed By</div></div>
          <div><div class="line">Authorized By</div></div>
        </div>
        <div class="footer">This is a computer-generated report &bull; TDG Billing System</div>
        <div class="no-print" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:12px 32px;background:#e63946;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Print / Save as PDF</button></div>
      </body></html>
    `)
    win.document.close()
    setShowExportMenu(false)
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
          
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
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
            {showExportMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowExportMenu(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '4px', zIndex: 100,
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '160px'
                }}>
                  <button onClick={handleExportExcel} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Export Excel
                  </button>
                  <button onClick={handleExportPDF} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M12 12v6"/></svg>
                    Export PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}