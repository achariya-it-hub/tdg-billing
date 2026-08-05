import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RotateCcw, X } from 'lucide-react'
import { BarChart, Bar, LabelList, ComposedChart, Line, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#4895ef', '#9b5de5']

const gradientMap = {
  DollarSign: 'linear-gradient(135deg, #e63946, #c1121f)',
  ShoppingBag: 'linear-gradient(135deg, #f4a261, #e76f51)',
  BarChart3: 'linear-gradient(135deg, #2a9d8f, #21867a)',
  Users: 'linear-gradient(135deg, #4895ef, #3b82f6)',
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetPin, setResetPin] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetProcessing, setResetProcessing] = useState(false)
  const [summary, setSummary] = useState({ revenue: 45600, orders: 89, avgOrder: 512, customers: 67 })
  const [topItems, setTopItems] = useState([
    { name: 'Zinger Burger', quantity: 45, revenue: 11205 },
    { name: 'Classic Burger', quantity: 38, revenue: 7562 },
    { name: 'Fried Chicken', quantity: 32, revenue: 8000 },
    { name: 'French Fries', quantity: 56, revenue: 5544 },
    { name: 'Pepsi', quantity: 78, revenue: 3822 }
  ])
  const [slotInterval, setSlotInterval] = useState('3h')
  const [hourlyData, setHourlyData] = useState([])
  const [threeHourData, setThreeHourData] = useState([])
  const [categoryData, setCategoryData] = useState([
    { name: 'Burgers', value: 35 },
    { name: 'Chicken', value: 28 },
    { name: 'Sides', value: 18 },
    { name: 'Beverages', value: 12 },
    { name: 'Desserts', value: 7 }
  ])
  const [sourceData, setSourceData] = useState([
    { name: 'POS', value: 45 },
    { name: 'Kiosk', value: 25 },
    { name: 'Captain', value: 15 },
    { name: 'Swiggy', value: 8 },
    { name: 'Zomato', value: 7 }
  ])
  const [dateRange, setDateRange] = useState('today')
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [stats, setStats] = useState({ revenue: 0, orders: 0, avgOrder: 0, onlineOrders: 0 })
  const [loading, setLoading] = useState(false)

  const getApiUrl = () => {
    return window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
  }

  const getQueryParams = () => {
    if (dateRange === 'custom') {
      return `from=${customDate}&to=${customDate}&date=${customDate}&strict=true`
    }
    if (dateRange === 'latest' || dateRange === 'all') {
      return `date=${dateRange}`
    }
    const today = new Date()
    const formatISTDate = (d) => {
      const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const year = ist.getFullYear()
      const month = String(ist.getMonth() + 1).padStart(2, '0')
      const day = String(ist.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    if (dateRange === 'today') {
      const tStr = formatISTDate(today)
      return `date=today&from=${tStr}&to=${tStr}`
    }
    if (dateRange === 'yesterday') {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      const yStr = formatISTDate(y)
      return `date=yesterday&from=${yStr}&to=${yStr}`
    }
    if (dateRange === 'week') {
      const w = new Date(today)
      w.setDate(w.getDate() - 7)
      return `from=${formatISTDate(w)}&to=${formatISTDate(today)}&strict=true`
    }
    if (dateRange === 'month') {
      const m = new Date(today)
      m.setDate(m.getDate() - 30)
      return `from=${formatISTDate(m)}&to=${formatISTDate(today)}&strict=true`
    }
    return `date=${dateRange}`
  }

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setCurrentUser(user)
    } catch {}
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const API = getApiUrl()
        const q = getQueryParams()
        const resClosing = await fetch(`${API}/api/reports/daily-closing?${q}`)
        if (resClosing.ok) {
          const closing = await resClosing.json()
          const rev = closing.totalSales || 0
          const ords = closing.totalInvoices || 0
          const avg = closing.avgBasketValue || (ords > 0 ? Math.round(rev / ords) : 0)
          
          let onlineCount = 0
          if (closing.bySource) {
            Object.entries(closing.bySource).forEach(([src, count]) => {
              if (src !== 'pos' && src !== 'dine-in') onlineCount += count
            })
          }
          
          setStats({
            revenue: rev,
            orders: ords,
            avgOrder: avg,
            onlineOrders: onlineCount
          })

          if (closing.hourlySales && closing.hourlySales.length > 0) {
            setHourlyData(closing.hourlySales)
          }

          if (closing.threeHourSales && closing.threeHourSales.length > 0) {
            setThreeHourData(closing.threeHourSales)
          }

          if (closing.bySource && Object.keys(closing.bySource).length > 0) {
            const formattedSource = Object.entries(closing.bySource).map(([src, val]) => ({
              source: src.toUpperCase(),
              revenue: val
            }))
            setSourceData(formattedSource)
          }
        }

        const resItems = await fetch(`${API}/api/reports/itemwise-sales?${q}`)
        if (resItems.ok) {
          const itemRes = await resItems.json()
          if (itemRes.items && itemRes.items.length > 0) {
            setTopItems(itemRes.items.slice(0, 5))
          } else {
            setTopItems([])
          }
        }

        const resCat = await fetch(`${API}/api/reports/categorywise-sales?${q}`)
        if (resCat.ok) {
          const catRes = await resCat.json()
          if (catRes.categories && catRes.categories.length > 0) {
            setCategoryData(catRes.categories)
          } else {
            setCategoryData([])
          }
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e)
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [dateRange, customDate])

  const handleReset = async () => {
    if (resetPin.length !== 4) { setResetError('Enter 4-digit PIN'); return }
    setResetProcessing(true)
    setResetError('')
    try {
      const API = getApiUrl()
      const res = await fetch(`${API}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: resetPin })
      })
      const data = await res.json()
      if (data.success) {
        alert('Data reset successful! Backup saved.\n\nAdmin: ' + data.admin)
        localStorage.removeItem('tdg-orders-storage')
        setShowResetModal(false)
        setResetPin('')
        window.location.reload()
      } else {
        setResetError(data.error || 'Reset failed')
      }
    } catch (e) {
      setResetError('Network error: ' + e.message)
    }
    setResetProcessing(false)
  }

  const StatCard = ({ icon: Icon, label, value, change, prefix = '', suffix = '' }) => {
    const gradient = gradientMap[Icon.name] || 'linear-gradient(135deg, #e63946, #c1121f)'
    return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: 'none',
      padding: '24px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      boxShadow: `0 4px 16px rgba(0,0,0,0.06)`
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)' }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 500, letterSpacing: '0.3px' }}>{label}</div>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
          {change !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '10px',
              color: change >= 0 ? '#10b981' : '#ef4444',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(change)}% vs yesterday
            </div>
          )}
        </div>
        <div style={{
          width: '52px',
          height: '52px',
          background: gradient,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}>
          <Icon size={24} color="white" />
        </div>
      </div>
    </div>
    )
  }

  return (
    <div>
      {/* Date Range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>Dashboard</h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Overview of your restaurant performance</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '14px' }}>
          {[
            { id: 'latest', label: "⚡ Latest Active Shift" },
            { id: 'today', label: "⭐ Today's Shift" },
            { id: 'yesterday', label: "🕒 Yesterday's Shift" },
            { id: 'week', label: '🗓️ This Week' },
            { id: 'month', label: '📅 This Month' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: dateRange === item.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'transparent',
                color: dateRange === item.id ? 'white' : '#6b7280',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
                boxShadow: dateRange === item.id ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={DollarSign} label="Revenue" value={stats.revenue} prefix="₹" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} />
        <StatCard icon={BarChart3} label="Avg Order Value" value={stats.avgOrder} prefix="₹" />
        <StatCard icon={Users} label="Online Orders" value={stats.onlineOrders} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
      {/* Charts Row */}
      {(() => {
        const currentDisplayData = slotInterval === '3h' ? (threeHourData.length > 0 ? threeHourData : hourlyData) : hourlyData
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* BILLS ISSUED BY TIME SLOT - Dark Executive Tech Theme */}
              <div style={{
                background: 'linear-gradient(180deg, #070e22 0%, #0c1836 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                padding: '24px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                minHeight: '340px',
                color: '#ffffff'
              }}>
                {/* Header with Circular Icon & Underline Accent */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 12px rgba(59, 130, 246, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                    }}>
                      <BarChart3 size={20} color="#ffffff" />
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: '1px',
                      color: '#ffffff',
                      textTransform: 'uppercase'
                    }}>
                      BILLS ISSUED BY TIME SLOT
                    </h3>
                  </div>
                  <div style={{
                    height: '2px',
                    width: '100%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, rgba(59, 130, 246, 0.1) 80%, transparent 100%)',
                    marginTop: '12px',
                    borderRadius: '2px'
                  }} />
                </div>

                <div style={{ width: '100%', height: '270px', minHeight: '270px', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '8px',
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontWeight: 600,
                    zIndex: 2
                  }}>
                    Bills
                  </span>

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        (currentDisplayData.length > 0 ? currentDisplayData : [
                          { hourLabel: '09:00 AM - 12:00 PM', revenue: 750, orderCount: 3 },
                          { hourLabel: '12:00 PM - 03:00 PM', revenue: 1336, orderCount: 5 },
                          { hourLabel: '03:00 PM - 06:00 PM', revenue: 4503, orderCount: 16 },
                          { hourLabel: '06:00 PM - 09:00 PM', revenue: 9832, orderCount: 30 },
                          { hourLabel: '09:00 PM - 11:59 PM', revenue: 5080, orderCount: 12 }
                        ]).map(d => ({
                          ...d,
                          orderCount: d.orderCount || d.orders || 0,
                          // format label for multi-line display
                          shortLabel: (d.hourLabel || d.timeSlot || '').replace(' - ', '\n- ')
                        }))
                      }
                      margin={{ top: 28, right: 16, left: -10, bottom: 25 }}
                    >
                      <defs>
                        <linearGradient id="electricBlueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis
                        dataKey="shortLabel"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        interval={0}
                        tick={({ x, y, payload }) => {
                          const lines = payload.value.split('\n')
                          return (
                            <g transform={`translate(${x},${y + 8})`}>
                              <text x={0} y={0} dy={0} textAnchor="middle" fill="#cbd5e1" fontSize={11} fontWeight={600}>
                                {lines[0]}
                              </text>
                              {lines[1] && (
                                <text x={0} y={0} dy={14} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={500}>
                                  {lines[1]}
                                </text>
                              )}
                            </g>
                          )
                        }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        domain={[0, 40]}
                        ticks={[0, 10, 20, 30, 40]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                        }}
                        formatter={(value, name) => [
                          name === 'revenue' ? `₹${Number(value).toLocaleString()}` : `${value} bills`,
                          name === 'revenue' ? 'Revenue' : 'Bills Issued'
                        ]}
                        labelFormatter={(label) => `Slot: ${label.replace('\n', ' ')}`}
                      />
                      <Bar
                        dataKey="orderCount"
                        fill="url(#electricBlueGrad)"
                        radius={[6, 6, 0, 0]}
                        barSize={48}
                        stroke="#60a5fa"
                        strokeWidth={1}
                      >
                        <LabelList
                          dataKey="orderCount"
                          position="top"
                          fill="#ffffff"
                          fontSize={15}
                          fontWeight={700}
                          offset={8}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales by Source */}
              <div style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px' }}>By Source</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="revenue" nameKey="source" label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {sourceData.map((entry, index) => (
                        <Cell key={entry.source} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slot Detailed Billing Breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} color="#e63946" /> {slotInterval === '3h' ? '3-Hour Slot Billing Breakdown (09:00 - 23:00 Hrs)' : 'Hour-by-Hour Billing Breakdown'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Sales distribution and bill volume grouped by {slotInterval === '3h' ? '3-hour time blocks' : 'hour'}
                  </p>
                </div>

                {/* Interval Selector Toggle */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '12px' }}>
                  <button
                    onClick={() => setSlotInterval('3h')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      background: slotInterval === '3h' ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'transparent',
                      color: slotInterval === '3h' ? 'white' : '#6b7280',
                      boxShadow: slotInterval === '3h' ? '0 2px 8px rgba(230,57,70,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    ⏱️ 3-Hour Slots (9 - 23 Hrs)
                  </button>
                  <button
                    onClick={() => setSlotInterval('1h')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      background: slotInterval === '1h' ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'transparent',
                      color: slotInterval === '1h' ? 'white' : '#6b7280',
                      boxShadow: slotInterval === '1h' ? '0 2px 8px rgba(230,57,70,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    🕐 1-Hour Slots
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px' }}>Time Slot</th>
                      <th style={{ textAlign: 'center', padding: '12px 16px' }}>Bills Issued</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px' }}>Revenue (₹)</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px' }}>Avg Bill Value (₹)</th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', width: '220px' }}>Sales Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDisplayData.filter(h => (h.totalBills || h.orderCount || h.orders || 0) > 0 || (h.revenue || 0) > 0).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '14px' }}>
                          No billing activity recorded for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      currentDisplayData
                        .filter(h => (h.totalBills || h.orderCount || h.orders || 0) > 0 || (h.revenue || 0) > 0)
                        .map((item, idx) => {
                          const settledCnt = item.settledBills !== undefined ? item.settledBills : (item.orderCount || item.orders || 0)
                          const pendingVoidCnt = item.pendingVoid || 0
                          const rev = item.revenue || 0
                          const avg = item.avgOrder || (settledCnt > 0 ? Math.round(rev / settledCnt) : 0)
                          const pct = item.pct || 0

                          return (
                            <tr
                              key={item.timeSlot || item.hourLabel || idx}
                              style={{
                                background: idx % 2 === 0 ? 'white' : 'rgba(249, 250, 251, 0.8)',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s'
                              }}
                            >
                              <td style={{ padding: '14px 16px', borderRadius: '12px 0 0 12px', fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: rev > 10000 ? '#10b981' : rev > 3000 ? '#f59e0b' : '#3b82f6'
                                  }}></span>
                                  {item.timeSlot || item.hourLabel}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <span style={{
                                  background: 'rgba(230,57,70,0.08)',
                                  color: '#e63946',
                                  padding: '4px 12px',
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}>
                                  {settledCnt} {settledCnt === 1 ? 'bill' : 'bills'}
                                  {pendingVoidCnt > 0 && (
                                    <span style={{ marginLeft: '6px', color: '#6b7280', fontSize: '11px', fontWeight: 600 }}>
                                      (+{pendingVoidCnt} void)
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                                ₹{rev.toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, fontSize: '14px', color: '#4b5563' }}>
                                ₹{avg.toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 24px', borderRadius: '0 12px 12px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: `${Math.min(100, Math.max(0, pct))}%`,
                                      height: '100%',
                                      background: 'linear-gradient(90deg, #e63946, #c1121f)',
                                      borderRadius: '4px',
                                      transition: 'width 0.4s ease'
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', minWidth: '40px' }}>
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      })()}
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Top Items */}
        <div style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.3px' }}>Top Selling Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topItems.map((item, index) => (
              <div
                key={item.menuItemName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  background: index === 0 ? 'linear-gradient(135deg, rgba(230,57,70,0.06), rgba(230,57,70,0.02))' : 'rgba(0,0,0,0.02)',
                  borderRadius: '14px',
                  transition: 'all 0.2s',
                  border: index === 0 ? '1px solid rgba(230,57,70,0.1)' : '1px solid transparent'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: index < 3 ? `linear-gradient(135deg, ${COLORS[index]}, ${COLORS[index]}dd)` : '#f3f4f6',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '13px',
                  boxShadow: index < 3 ? `0 2px 8px ${COLORS[index]}40` : 'none'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.menuItemName || item.name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{item.quantity || item.totalQty} sold</div>
                </div>
                <div style={{ fontWeight: 700, color: '#e63946', fontSize: '15px' }}>
                  ₹{(item.revenue || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="#9ca3af" fontSize={12} width={80} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px' }} formatter={(value) => [`₹${value.toFixed(0)}`, 'Revenue']} />
              <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={24}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.category} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reset Data Section — Admin Only */}
      {currentUser?.role === 'super-admin' && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(239,68,68,0.15)',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} /> Reset Operational Data
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Clears all orders, billing, KOTs, POs, GRNs, and expenses. Menu, inventory, suppliers, loyalty, and users are preserved. A backup is created automatically.
            </p>
            <button
              onClick={() => { setResetPin(''); setResetError(''); setShowResetModal(true) }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(220,38,38,0.3)'
              }}
            >
              <RotateCcw size={16} />
              Reset All Operational Data
            </button>
          </div>

          {/* PIN Verification Modal */}
          {showResetModal && (
            <>
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000 }} onClick={() => setShowResetModal(false)} />
              <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '380px',
                border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', zIndex: 1001
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626', margin: 0 }}>Admin Verification</h3>
                  <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <X size={20} color="#6b7280" />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Enter admin PIN to confirm data reset</p>

                {/* PIN Dots */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: resetPin.length > i ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'rgba(0,0,0,0.04)',
                      border: `2px solid ${resetPin.length > i ? '#dc2626' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: resetPin.length > i ? '0 2px 8px rgba(220,38,38,0.3)' : 'none'
                    }}>
                      {resetPin.length > i && <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  ))}
                </div>

                {/* PIN Keypad */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((key, i) => (
                    key === '' ? <div key={i} /> : (
                      <button key={i} onClick={() => {
                        if (key === '⌫') setResetPin(p => p.slice(0, -1))
                        else if (resetPin.length < 4) setResetPin(p => p + key)
                      }} style={{
                        height: '52px', borderRadius: '12px', border: 'none',
                        background: key === '⌫' ? 'rgba(0,0,0,0.04)' : 'white',
                        color: '#1a1a2e', fontSize: '20px', fontWeight: 600,
                        cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s'
                      }}>{key === '⌫' ? '⌫' : key}</button>
                    )
                  ))}
                </div>

                {resetError && (
                  <div style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', marginBottom: '12px', padding: '8px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
                    {resetError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowResetModal(false)} style={{
                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.04)', color: '#4b5563', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button onClick={handleReset} disabled={resetProcessing || resetPin.length !== 4} style={{
                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                    background: resetProcessing || resetPin.length !== 4 ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white', fontWeight: 600, fontSize: '14px', cursor: resetProcessing || resetPin.length !== 4 ? 'not-allowed' : 'pointer',
                    boxShadow: resetProcessing || resetPin.length !== 4 ? 'none' : '0 2px 8px rgba(220,38,38,0.3)'
                  }}>{resetProcessing ? 'Resetting...' : 'Confirm Reset'}</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
