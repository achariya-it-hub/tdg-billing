import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RotateCcw, X } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  const [hourlyData, setHourlyData] = useState([
    { hour: '11AM', orders: 8, revenue: 2400 },
    { hour: '12PM', orders: 15, revenue: 4800 },
    { hour: '1PM', orders: 22, revenue: 7200 },
    { hour: '2PM', orders: 18, revenue: 5600 },
    { hour: '3PM', orders: 12, revenue: 3600 },
    { hour: '4PM', orders: 8, revenue: 2400 },
    { hour: '5PM', orders: 6, revenue: 1800 }
  ])
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

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setCurrentUser(user)
    } catch {}
  }, [])

  const handleReset = async () => {
    if (resetPin.length !== 4) { setResetError('Enter 4-digit PIN'); return }
    setResetProcessing(true)
    setResetError('')
    try {
      const API = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
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
          {['today', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: dateRange === range ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'transparent',
                color: dateRange === range ? 'white' : '#6b7280',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '13px',
                transition: 'all 0.2s',
                boxShadow: dateRange === range ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={DollarSign} label="Today's Revenue" value={summary?.today?.revenue?.toFixed(0) || 0} prefix="₹" change={summary?.revenueChange} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={summary?.today?.orders || 0} change={summary?.today?.orders - summary?.yesterday?.orders > 0 ? 5 : -3} />
        <StatCard icon={BarChart3} label="Avg Order Value" value={summary?.today?.avgOrder?.toFixed(0) || 0} prefix="₹" />
        <StatCard icon={Users} label="Online Orders" value={summary?.online?.orders || 0} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Hourly Sales */}
        <div style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px' }}>Hourly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData.filter(h => h.orderCount > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="hourLabel" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#e63946" strokeWidth={3} dot={{ fill: '#e63946', r: 5, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7, strokeWidth: 2, stroke: 'white' }} />
            </LineChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={300}>
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
