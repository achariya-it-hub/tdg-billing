import { useState } from 'react'
import { BarChart3, FileText, Package, Utensils, Receipt, XCircle, TrendingDown, TrendingUp, Clock, Calendar, Filter, Download } from 'lucide-react'

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
  const [activeReport, setActiveReport] = useState('kot')
  const [dateRange, setDateRange] = useState('today')

  const getReportTitle = () => {
    switch (activeReport) {
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
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
              background: activeReport === report.id ? '#e63946' : 'white',
              color: activeReport === report.id ? 'white' : '#4b5563',
              border: `2px solid ${activeReport === report.id ? '#e63946' : '#e5e7eb'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
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
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px'
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
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
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