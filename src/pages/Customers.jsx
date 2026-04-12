import { useState, useEffect } from 'react'
import { Users, Plus, Search, UserPlus, Gift, Star, Crown, TrendingUp, CreditCard, Phone, Mail, Calendar, MapPin, Award, Edit, Trash2, ChevronRight, History, Percent } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const sampleCustomers = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@email.com', address: '42 MG Road, Mumbai', totalOrders: 45, totalSpent: 12500, points: 1250, tier: 'gold', joinDate: '2023-03-15', lastVisit: '2024-01-14' },
  { id: '2', name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya.patel@email.com', address: '15 Link Road, Mumbai', totalOrders: 28, totalSpent: 7800, points: 780, tier: 'silver', joinDate: '2023-06-20', lastVisit: '2024-01-13' },
  { id: '3', name: 'Amit Kumar', phone: '+91 98765 43212', email: 'amit.kumar@email.com', address: '78 Station Road, Mumbai', totalOrders: 62, totalSpent: 18500, points: 2475, tier: 'platinum', joinDate: '2022-11-05', lastVisit: '2024-01-15' },
  { id: '4', name: 'Sneha Gupta', phone: '+91 98765 43213', email: 'sneha.gupta@email.com', address: '23 JVPD Scheme, Mumbai', totalOrders: 15, totalSpent: 4200, points: 420, tier: 'bronze', joinDate: '2024-01-01', lastVisit: '2024-01-10' },
  { id: '5', name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram.singh@email.com', address: '56 Andheri East, Mumbai', totalOrders: 35, totalSpent: 9800, points: 980, tier: 'silver', joinDate: '2023-08-12', lastVisit: '2024-01-12' },
]

const sampleTransactions = [
  { id: '1', customer: 'Rahul Sharma', points: 50, type: 'earned', order: 'ORD-1001', date: '2024-01-14', note: 'Order purchase' },
  { id: '2', customer: 'Rahul Sharma', points: 200, type: 'redeemed', order: 'GIFT-001', date: '2024-01-13', note: 'Free meal redemption' },
  { id: '3', customer: 'Amit Kumar', points: 150, type: 'earned', order: 'ORD-1045', date: '2024-01-15', note: 'Order purchase' },
  { id: '4', customer: 'Priya Patel', points: 30, type: 'earned', order: 'ORD-1032', date: '2024-01-13', note: 'Order purchase' },
  { id: '5', customer: 'Vikram Singh', points: 100, type: 'bonus', order: '-', date: '2024-01-10', note: 'Birthday bonus' },
]

const tierConfig = {
  platinum: { min: 2000, color: '#8b5cf6', bg: '#f5f3ff', icon: Crown, label: 'Platinum', discount: '15%' },
  gold: { min: 1000, color: '#f59e0b', bg: '#fffbeb', icon: Award, label: 'Gold', discount: '10%' },
  silver: { min: 500, color: '#6b7280', bg: '#f9fafb', icon: Star, label: 'Silver', discount: '5%' },
  bronze: { min: 0, color: '#92400e', bg: '#fef3c7', icon: Star, label: 'Bronze', discount: '2%' },
}

export default function Customers() {
  const toast = useToast()
  const [customers, setCustomers] = useState(sampleCustomers)
  const [transactions, setTransactions] = useState(sampleTransactions)
  const [activeTab, setActiveTab] = useState('customers')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const totalMembers = customers.length
  const totalPointsIssued = customers.reduce((sum, c) => sum + c.points, 0)
  const avgSpent = Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
  const platinumCount = customers.filter(c => c.tier === 'platinum').length

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTier = (points) => {
    if (points >= 2000) return 'platinum'
    if (points >= 1000) return 'gold'
    if (points >= 500) return 'silver'
    return 'bronze'
  }

  const handleAddCustomer = () => {
    toast.success('Customer added successfully!')
    setShowAddModal(false)
  }

  const handleAddPoints = (type) => {
    toast.success(`${type === 'earned' ? 'Points credited' : 'Points redeemed'} successfully!`)
    setShowPointsModal(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Customer Management
        </h2>
        <p style={{ color: '#6b7280' }}>Manage customers and reward points</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalMembers}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Members</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalPointsIssued.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Points Issued</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{avgSpent.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Avg Spending</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={24} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{platinumCount}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Platinum Members</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'points', label: 'Points History', icon: Gift },
          { id: 'tiers', label: 'Tier Benefits', icon: Crown },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: activeTab === tab.id ? '#e63946' : 'white',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Add Customer
        </Button>
      </div>

      {/* Customers Grid */}
      {activeTab === 'customers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {filteredCustomers.map(customer => {
            const tier = tierConfig[customer.tier]
            const TierIcon = tier.icon
            
            return (
              <Card key={customer.id} hover>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: tier.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: tier.color
                  }}>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{customer.name}</h3>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: tier.bg,
                        color: tier.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <TierIcon size={12} />
                        {tier.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{customer.phone}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{customer.points}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Points</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{customer.totalOrders}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Orders</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>₹{customer.totalSpent.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Spent</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Calendar size={14} />
                    Joined: {customer.joinDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} />
                    Last visit: {customer.lastVisit}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    style={{ flex: 1 }}
                    onClick={() => { setSelectedCustomer(customer); setShowPointsModal(true) }}
                  >
                    <Gift size={14} />
                    Manage Points
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={14} color="#ef4444" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Points History */}
      {activeTab === 'points' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Points</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Order Ref</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{tx.customer}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: tx.type === 'earned' ? '#10b981' : tx.type === 'redeemed' ? '#ef4444' : '#f59e0b'
                      }}>
                        {tx.type === 'earned' ? '+' : tx.type === 'redeemed' ? '-' : '+'}{tx.points}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: tx.type === 'earned' ? '#f0fdf4' : tx.type === 'redeemed' ? '#fef2f2' : '#fffbeb',
                        color: tx.type === 'earned' ? '#10b981' : tx.type === 'redeemed' ? '#ef4444' : '#f59e0b',
                        textTransform: 'capitalize'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{tx.order}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{tx.date}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{tx.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tier Benefits */}
      {activeTab === 'tiers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {Object.entries(tierConfig).reverse().map(([tier, config]) => {
            const TierIcon = config.icon
            const nextTier = Object.entries(tierConfig).find(([t, c]) => c.min > config.min)
            
            return (
              <Card key={tier} style={{ borderTop: `4px solid ${config.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: config.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TierIcon size={24} color={config.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: config.color }}>{config.label}</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{config.min}+ points</p>
                  </div>
                </div>
                
                <div style={{ background: config.bg, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Percent size={18} color={config.color} />
                    <span style={{ fontWeight: 600, color: config.color }}>{config.discount} Off</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>On every order</p>
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {nextTier ? (
                    <p>{customers.filter(c => c.tier === tier).length} members • {nextTier[1].min - config.min} pts to next tier</p>
                  ) : (
                    <p>{customers.filter(c => c.tier === tier).length} members • Top tier</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Full Name *</label>
            <input type="text" placeholder="Enter customer name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Phone *</label>
              <input type="text" placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Email</label>
              <input type="email" placeholder="customer@email.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Address</label>
            <textarea placeholder="Full address" rows={2} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Date of Birth</label>
            <input type="date" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ background: '#fef9c3', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Gift size={18} color="#ca8a04" />
              <span style={{ fontWeight: 600, color: '#854d0e' }}>Welcome Bonus</span>
            </div>
            <p style={{ fontSize: '13px', color: '#854d0e' }}>New customers get 100 bonus points on signup!</p>
          </div>
          <Button fullWidth onClick={handleAddCustomer}>
            <UserPlus size={18} />
            Add Customer
          </Button>
        </div>
      </Modal>

      {/* Points Management Modal */}
      <Modal isOpen={showPointsModal} onClose={() => setShowPointsModal(false)} title={`${selectedCustomer?.name || ''} - Points Management`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Customer Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{selectedCustomer?.points || 0}</div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>Current Points</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{selectedCustomer?.totalOrders || 0}</div>
              <div style={{ fontSize: '12px', color: '#166534' }}>Total Orders</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{tierConfig[selectedCustomer?.tier]?.label}</div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>Current Tier</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Button 
              variant="success" 
              fullWidth 
              onClick={() => handleAddPoints('earned')}
              style={{ padding: '20px' }}
            >
              <TrendingUp size={20} />
              Credit Points
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={() => handleAddPoints('redeemed')}
              style={{ padding: '20px' }}
            >
              <CreditCard size={20} />
              Redeem Points
            </Button>
          </div>

          {/* Custom Amount */}
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Quick Credit</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[10, 25, 50, 100, 200, 500].map(amount => (
                <button
                  key={amount}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => toast.info(`+${amount} points credited!`)}
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Redeem Options */}
          <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#991b1b' }}>Redeem Rewards</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { points: 100, reward: 'Free Coffee' },
                { points: 200, reward: 'Free Side Dish' },
                { points: 500, reward: 'Free Meal' },
                { points: 1000, reward: '₹100 Off' },
              ].map(item => (
                <button
                  key={item.points}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    background: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if ((selectedCustomer?.points || 0) >= item.points) {
                      toast.success(`Redeemed: ${item.reward}`)
                    } else {
                      toast.error('Not enough points')
                    }
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.reward}</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>{item.points} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Recent Transactions</h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {transactions.filter(t => t.customer === selectedCustomer?.name).map(tx => (
                <div key={tx.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{tx.note}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tx.date}</div>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    color: tx.type === 'earned' ? '#10b981' : '#ef4444'
                  }}>
                    {tx.type === 'earned' ? '+' : '-'}{tx.points}
                  </span>
                </div>
              ))}
              {transactions.filter(t => t.customer === selectedCustomer?.name).length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
