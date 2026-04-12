import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from '../components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#4895ef', '#9b5de5']

export default function Dashboard() {
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

  const StatCard = ({ icon: Icon, label, value, change, prefix = '', suffix = '' }) => (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Bebas Neue' }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
          {change !== undefined && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              marginTop: '8px',
              color: change >= 0 ? 'var(--accent-success)' : 'var(--accent-primary)'
            }}>
              {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {Math.abs(change)}% vs yesterday
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--accent-primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8
          }}
        >
          <Icon size={24} color="white" />
        </div>
      </div>
    </Card>
  )

  return (
    <div>
      {/* Date Range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '36px' }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['today', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: dateRange === range ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: dateRange === range ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <StatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={summary?.today?.revenue?.toFixed(0) || 0}
          prefix="₹"
          change={summary?.revenueChange}
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={summary?.today?.orders || 0}
          change={summary?.today?.orders - summary?.yesterday?.orders > 0 ? 5 : -3}
        />
        <StatCard
          icon={BarChart3}
          label="Avg Order Value"
          value={summary?.today?.avgOrder?.toFixed(0) || 0}
          prefix="₹"
        />
        <StatCard
          icon={Users}
          label="Online Orders"
          value={summary?.online?.orders || 0}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Hourly Sales */}
        <Card>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '24px' }}>Hourly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData.filter(h => h.orderCount > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hourLabel" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--accent-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--accent-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales by Source */}
        <Card>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '24px' }}>By Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="revenue"
                nameKey="source"
                label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={entry.source} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Items */}
        <Card>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '24px' }}>Top Selling Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topItems.map((item, index) => (
              <div
                key={item.menuItemName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: index < 3 ? COLORS[index] : 'var(--bg-elevated)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.menuItemName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.totalQty} sold
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  ₹{item.revenue?.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '24px' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`₹${value.toFixed(0)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.category} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
