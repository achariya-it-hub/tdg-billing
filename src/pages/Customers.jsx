import { useState, useEffect } from 'react'
import { Users, Search, UserPlus, Gift, Star, Crown, TrendingUp, Users2, Plus, Copy, X, Check, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import API_BASE from '../lib/apiConfig'

const tierConfig = {
  platinum: { min: 2000, color: '#8b5cf6', bg: '#f5f3ff', icon: Crown, label: 'Platinum', discount: '15%' },
  gold: { min: 1000, color: '#f59e0b', bg: '#fffbeb', icon: Crown, label: 'Gold', discount: '10%' },
  silver: { min: 500, color: '#6b7280', bg: '#f9fafb', icon: Star, label: 'Silver', discount: '5%' },
  bronze: { min: 0, color: '#92400e', bg: '#fef3c7', icon: Star, label: 'Bronze', discount: '2%' },
}

export default function Customers() {
  const [user, setUser] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('customers')
  const [searchTerm, setSearchTerm] = useState('')

  const [searchPhone, setSearchPhone] = useState('')
  const [denCustomer, setDenCustomer] = useState(null)
  const [denLoading, setDenLoading] = useState(false)
  const [denError, setDenError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formResult, setFormResult] = useState(null)
  const [formError, setFormError] = useState('')

  const [quickType, setQuickType] = useState('customer')
  const [quickForm, setQuickForm] = useState({ phone: '', name: '', partnerCode: '' })
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickResult, setQuickResult] = useState(null)
  const [quickError, setQuickError] = useState('')

  const [assetForm, setAssetForm] = useState({ name: '', phone: '' })
  const [assetLoading, setAssetLoading] = useState(false)
  const [assetOtp, setAssetOtp] = useState(null)
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyOtpCode, setVerifyOtpCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [waLink, setWaLink] = useState('')

  // Bulk Offer Validation state for contacts list (e.g. 121 contacts)
  const [bulkOfferText, setBulkOfferText] = useState('')
  const [bulkOfferPct, setBulkOfferPct] = useState(50)
  const [bulkOfferName, setBulkOfferName] = useState('VIP Offer 50% OFF')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkError, setBulkError] = useState('')


  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(u)
    } catch {}
    fetchCustomers()
  }, [])

  const getPin = () => user?.pin || ''

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers`)
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to fetch customers:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name || 'User'}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/customers/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id && c.phone !== id))
      } else {
        alert('Failed to delete customer')
      }
    } catch {
      alert('Network error')
    }
  }

  const handleClearAllCustomers = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL customers? This cannot be undone!')) return
    if (!window.confirm('FINAL CONFIRMATION: Remove all customer profiles, loyalty points, and den structures?')) return
    try {
      const res = await fetch(`${API_BASE}/api/customers/clear-all`, { method: 'POST' })
      if (res.ok) {
        setCustomers([])
        alert('All customers have been deleted.')
      } else {
        alert('Failed to clear customers')
      }
    } catch {
      alert('Network error')
    }
  }

  const getTier = (points) => {
    if (points >= 2000) return 'platinum'
    if (points >= 1000) return 'gold'
    if (points >= 500) return 'silver'
    return 'bronze'
  }

  const totalMembers = customers.length
  const totalPointsIssued = customers.reduce((s, c) => s + (c.points || 0), 0)
  const avgSpent = customers.length ? Math.round(customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length) : 0
  const platinumCount = customers.filter(c => getTier(c.points) === 'platinum').length

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.partnerCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const searchCustomer = async () => {
    if (searchPhone.length < 8) { setDenError('Enter at least 8 digits'); return }
    setDenLoading(true)
    setDenError('')
    setDenCustomer(null)
    try {
      const res = await fetch(`${API_BASE}/api/billing/customer-assets/${encodeURIComponent(searchPhone)}?pin=${getPin()}`)
      const data = await res.json()
      if (res.ok) setDenCustomer(data)
      else setDenError(data.error || 'Customer not found')
    } catch {
      setDenError('Connection error')
    }
    setDenLoading(false)
  }

  const handleCreateCustomer = async () => {
    if (!form.name || !form.email || !form.phone) { setFormError('All fields required'); return }
    setFormLoading(true)
    setFormError('')
    setFormResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/billing/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: getPin(), ...form })
      })
      const data = await res.json()
      if (res.ok) {
        setFormResult(data)
        setForm({ name: '', email: '', phone: '' })
        fetchCustomers()
      } else {
        setFormError(data.error || 'Failed to create customer')
      }
    } catch {
      setFormError('Connection error')
    }
    setFormLoading(false)
  }

  const handleQuickAdd = async () => {
    if (quickType === 'customer') {
      if (!quickForm.phone) { setQuickError('Phone number required'); return }
    } else {
      if (!quickForm.partnerCode || !quickForm.name || !quickForm.phone) { setQuickError('EMP ID, Name, and Mobile required'); return }
    }
    setQuickLoading(true)
    setQuickError('')
    setQuickResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/customers/quick-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: quickType, ...quickForm })
      })
      const data = await res.json()
      if (res.ok) {
        setQuickResult(data)
        setQuickForm({ phone: '', name: '', partnerCode: '' })
        fetchCustomers()
      } else {
        setQuickError(data.error || 'Failed to add')
      }
    } catch {
      setQuickError('Connection error')
    }
    setQuickLoading(false)
  }

  const handleAddAsset = async () => {
    if (!assetForm.name || !assetForm.phone || !denCustomer) return
    setAssetLoading(true)
    setAssetOtp(null)
    setWaLink('')
    const targetPhone = assetForm.phone
    try {
      const res = await fetch(`${API_BASE}/api/billing/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: getPin(), customerPhone: denCustomer.phone, ...assetForm })
      })
      const data = await res.json()
      if (res.ok) {
        setAssetOtp(data.otp)
        setWaLink(data.waLink || '')
        setVerifyPhone(targetPhone)
        setVerifyOtpCode('')
        setAssetForm({ name: '', phone: '' })
        searchCustomer()
      } else {
        alert(data.error || 'Failed to add asset')
      }
    } catch {
      alert('Connection error')
    }
    setAssetLoading(false)
  }

  const handleVerifyAssetOtp = async (phone, otp) => {
    if (!phone || !otp) { alert('Please enter OTP'); return }
    setVerifyLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/assets/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('OTP Verified! Asset activated successfully.')
        setAssetOtp(null)
        setVerifyOtpCode('')
        searchCustomer()
      } else {
        alert(data.message || data.error || 'Invalid OTP')
      }
    } catch {
      alert('Error verifying OTP')
    }
    setVerifyLoading(false)
  }

  const handleBulkImport = async () => {
    if (!bulkOfferText.trim()) { setBulkError('Please paste at least one phone number / contact'); return }
    setBulkLoading(true)
    setBulkError('')
    setBulkResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/admin/customers/bulk-import-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactsText: bulkOfferText,
          discountPct: bulkOfferPct,
          offerName: bulkOfferName
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setBulkResult(data)
        fetchCustomers()
      } else {
        setBulkError(data.error || 'Failed to import contacts')
      }
    } catch {
      setBulkError('Connection error')
    }
    setBulkLoading(false)
  }

  const copyOtp = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none',
    background: 'white', boxSizing: 'border-box'
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Customer Management</h2>
        <p style={{ color: '#6b7280' }}>Manage customers, reward points, and asset network</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} color="#3b82f6" /></div>
          <div><div style={{ fontSize: '24px', fontWeight: 700 }}>{totalMembers}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>Total Members</div></div>
        </div></Card>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={24} color="#f59e0b" /></div>
          <div><div style={{ fontSize: '24px', fontWeight: 700 }}>{totalPointsIssued.toLocaleString()}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>Points Issued</div></div>
        </div></Card>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} color="#10b981" /></div>
          <div><div style={{ fontSize: '24px', fontWeight: 700 }}>₹{avgSpent.toLocaleString()}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>Avg Spending</div></div>
        </div></Card>
        <Card><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={24} color="#8b5cf6" /></div>
          <div><div style={{ fontSize: '24px', fontWeight: 700 }}>{platinumCount}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>Platinum Members</div></div>
        </div></Card>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'den', label: 'Den Members', icon: Users2 },
          { id: 'add-customer', label: 'Add Customer', icon: UserPlus },
          { id: 'add-staff', label: 'Add Staff', icon: Users },
          { id: 'bulk-offer', label: 'Validate Offer Contacts (121)', icon: Gift },
          { id: 'tiers', label: 'Tier Benefits', icon: Crown },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '12px 24px', borderRadius: '12px',
            background: activeTab === tab.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'white',
            color: activeTab === tab.id ? 'white' : '#6b7280',
            fontWeight: 600, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
            boxShadow: activeTab === tab.id ? '0 4px 16px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'customers' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Search by name, phone, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontSize: '14px' }} />
            </div>
            <Button onClick={() => fetchCustomers()}><Search size={18} /> Refresh</Button>
            {customers.length > 0 && (
              <button
                onClick={handleClearAllCustomers}
                style={{
                  padding: '12px 18px', borderRadius: '12px', border: '1px solid #fecaca',
                  background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={18} /> Clear All Customers
              </button>
            )}
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div> :
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
            {filteredCustomers.map(customer => {
              const tierKey = getTier(customer.points || 0)
              const tier = tierConfig[tierKey]
              const TierIcon = tier.icon
              const initials = (customer.name || '?').split(' ').map(n => n[0]).join('').toUpperCase()
              return (
                <Card key={customer.id} hover>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: tier.color }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{customer.name || 'Unknown'}</h3>
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, background: tier.bg, color: tier.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TierIcon size={12} /> {tier.label}
                          </span>
                          {customer.type === 'staff' && (
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
                              STAFF
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id, customer.name); }}
                          title="Delete Customer"
                          style={{
                            border: 'none', background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626',
                            padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {customer.phone || 'No phone'}
                        {customer.partnerCode && <span style={{ marginLeft: '8px', color: '#1d4ed8', fontWeight: 600 }}>EMP: {customer.partnerCode}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{customer.points || 0}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Points</div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{customer.totalOrders || 0}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Orders</div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>₹{(customer.totalSpent || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Spent</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '4px' }}>Joined: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : '-'}</div>
                    <div>Last visit: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : '-'}</div>
                  </div>
                </Card>
              )
            })}
            {filteredCustomers.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>No customers found</p>}
          </div>}
        </>
      )}

      {activeTab === 'den' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="tel" placeholder="Search customer by phone number..." value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', fontSize: '14px' }} />
            </div>
            <Button onClick={searchCustomer} loading={denLoading}><Search size={18} /> Search</Button>
          </div>

          {denError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
              {denError}
            </div>
          )}

          {denCustomer && (
            <div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{denCustomer.name}</h3>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{denCustomer.phone}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', background: '#f3f4f6', padding: '6px 12px', borderRadius: '8px' }}>
                    ID: {denCustomer.id}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{denCustomer.points}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Points</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{denCustomer.assets?.length || 0}/10</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Assets</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{denCustomer.assetsDinedCount || 0}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Dined</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>₹{denCustomer.totalDistributed || 0}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Distributed</div>
                  </div>
                </div>
                {denCustomer.allAssetsActive && (
                  <div style={{ marginTop: '16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '13px', fontWeight: 600 }}>
                    <Crown size={18} /> All 10 assets completed! +500 bonus earned.
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                Assets ({denCustomer.assets?.length || 0}/10)
              </h4>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ background: '#f9fafb', borderRadius: '10px', height: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${((denCustomer.assets?.length || 0) / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '10px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{denCustomer.assetsDinedCount || 0} of {denCustomer.assets?.length || 0} assets have dined</div>
              </div>

              {(denCustomer.assets?.length || 0) < 10 && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '2px dashed #d1d5db' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#4b5563' }}>Add Asset to Den</h5>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Name</label>
                      <input type="text" placeholder="Friend's name" value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Phone</label>
                      <input type="tel" placeholder="Friend's phone" value={assetForm.phone} onChange={(e) => setAssetForm({ ...assetForm, phone: e.target.value })} style={inputStyle} />
                    </div>
                    <Button onClick={handleAddAsset} loading={assetLoading}><Plus size={18} /> Add</Button>
                  </div>

                  {verifyPhone && (
                    <div style={{ marginTop: '16px', background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: '#15803d', marginBottom: '6px', fontWeight: 700 }}>WhatsApp OTP Sent to Asset ({verifyPhone})</div>
                      <div style={{ fontSize: '13px', color: '#166534', marginBottom: '16px', lineHeight: 1.4 }}>
                        A 4-digit verification code has been sent via <strong>WhatsApp</strong> to <strong>({verifyPhone})</strong>.<br/>
                        Enter the WhatsApp OTP received by the asset to verify and activate:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', maxWidth: '380px', margin: '0 auto', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="0000"
                          value={verifyOtpCode}
                          onChange={(e) => setVerifyOtpCode(e.target.value)}
                          style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', fontWeight: 800, letterSpacing: '6px', width: '130px' }}
                        />
                        <Button size="sm" onClick={() => handleVerifyAssetOtp(verifyPhone, verifyOtpCode)} loading={verifyLoading}>
                          Verify OTP
                        </Button>
                        {waLink && (
                          <Button size="sm" variant="secondary" onClick={() => window.open(waLink, '_blank')} style={{ background: '#25D366', color: 'white', border: 'none', fontWeight: 700 }}>
                            Open WhatsApp
                          </Button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                        <Button size="sm" variant="secondary" onClick={() => { setVerifyPhone(''); setVerifyOtpCode(''); setWaLink(''); }}><X size={14} /> Close</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gap: '12px' }}>
                {(denCustomer.assets || []).map(asset => (
                  <div key={asset.id} style={{
                    background: 'white', borderRadius: '12px', padding: '16px',
                    border: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderLeft: `4px solid ${asset.status === 'active' ? '#10b981' : '#f59e0b'}`
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{asset.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>{asset.phone}</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#9ca3af' }}>
                        <span>Status: <span style={{ color: asset.status === 'active' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{asset.status}</span></span>
                        <span>Dined: {asset.hasDined ? <Check size={14} color="#10b981" style={{ display: 'inline' }} /> : 'No'}</span>
                        <span>Points: {asset.pointsDistributed || 0}</span>
                      </div>
                    </div>
                    {asset.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="OTP"
                          id={`otp-input-${asset.id}`}
                          style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', textAlign: 'center', letterSpacing: '2px' }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const val = document.getElementById(`otp-input-${asset.id}`)?.value
                            if (val) handleVerifyAssetOtp(asset.phone, val)
                          }}
                        >
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {(denCustomer.assets || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' }}>
                    No assets in this den yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-customer' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Add End Customer</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Quick-add a walk-in customer using their mobile number.
            </p>

            {quickResult && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                  <Check size={20} /> Customer Added
                </div>
                <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <div><strong>Phone:</strong> {quickResult.customer.phone}</div>
                  <div><strong>Name:</strong> {quickResult.customer.name || 'Customer'}</div>
                </div>
                <Button size="sm" onClick={() => setQuickResult(null)}><UserPlus size={14} /> Add Another</Button>
              </div>
            )}

            {quickError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
                {quickError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
              <input type="tel" placeholder="e.g. 9876543210" value={quickForm.phone} onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>Name (optional)</label>
              <input type="text" placeholder="Customer name" value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} style={inputStyle} />
            </div>
            <Button onClick={handleQuickAdd} loading={quickLoading} fullWidth>
              <UserPlus size={18} /> Add Customer
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'add-staff' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Add Staff Member</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Register a staff partner with EMP ID for tracking and discounts.
            </p>

            {quickResult && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                  <Check size={20} /> Staff Added
                </div>
                <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <div><strong>EMP ID:</strong> {quickResult.customer.partnerCode}</div>
                  <div><strong>Name:</strong> {quickResult.customer.name}</div>
                  <div><strong>Phone:</strong> {quickResult.customer.phone}</div>
                </div>
                <Button size="sm" onClick={() => setQuickResult(null)}><Users size={14} /> Add Another</Button>
              </div>
            )}

            {quickError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
                {quickError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>EMP ID (Partner Code) *</label>
              <input type="text" placeholder="e.g. EMP001" value={quickForm.partnerCode} onChange={(e) => setQuickForm({ ...quickForm, partnerCode: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input type="text" placeholder="Staff member name" value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
              <input type="tel" placeholder="e.g. 9876543210" value={quickForm.phone} onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })} style={inputStyle} />
            </div>
            <Button onClick={handleQuickAdd} loading={quickLoading} fullWidth>
              <Users size={18} /> Add Staff
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'bulk-offer' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={22} color="#be123c" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Validate & Dispatch Offer for Contacts List</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0 0' }}>
                  Paste your 121 contacts list below to register & validate them for instant POS auto-discounting!
                </p>
              </div>
            </div>

            {bulkResult && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
                  <Check size={20} /> Success! {bulkResult.totalProcessed} Contacts Validated for POS & Online Orders
                </div>
                <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.4 }}>
                  • <strong>{bulkResult.imported}</strong> new contacts added to VIP offer database.<br/>
                  • <strong>{bulkResult.updated}</strong> existing customers updated with active offer.<br/>
                  • When any of these customers visit or enter their phone number at POS, their <strong>{bulkOfferPct}% OFF</strong> offer is automatically validated & applied!
                </div>

                <div style={{ marginTop: '14px', background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #86efac' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', marginBottom: '4px', letterSpacing: '0.5px' }}>💬 READY-TO-SEND WHATSAPP MESSAGE TEMPLATE:</div>
                  <div style={{ fontSize: '12px', color: '#1f2937', background: '#f8fafc', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid #cbd5e1' }}>
{`🎉 Special Offer Alert from Ten Den Gyros! 🎉

You have unlocked a Special ${bulkOfferPct}% OFF Offer on your next order! 🌯

📍 How to Redeem:
Simply share your registered phone number at our Billing Counter, Self-Order Kiosk, or Online Website to claim your ${bulkOfferPct}% OFF instantly!

🌐 Order Online: https://tendengyros.com`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `🎉 Special Offer Alert from Ten Den Gyros! 🎉\n\nYou have unlocked a Special ${bulkOfferPct}% OFF Offer on your next order! 🌯\n\n📍 How to Redeem:\nSimply share your registered phone number at our Billing Counter, Self-Order Kiosk, or Online Website to claim your ${bulkOfferPct}% OFF instantly!\n\n🌐 Order Online: https://tendengyros.com`
                      navigator.clipboard.writeText(msg)
                      alert('WhatsApp offer message copied to clipboard!')
                    }}
                    style={{
                      marginTop: '8px', padding: '8px 14px', background: '#25D366', color: 'white', border: 'none',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Copy size={14} /> Copy WhatsApp Offer Campaign Text
                  </button>
                </div>
              </div>
            )}

            {bulkError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', color: '#dc2626', fontSize: '13px', marginBottom: '16px', marginTop: '16px' }}>
                {bulkError}
              </div>
            )}

            {/* Offer Discount Selector */}
            <div style={{ marginTop: '20px', marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>1. SELECT OFFER DISCOUNT VALUE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[20, 30, 50, 70].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => { setBulkOfferPct(pct); setBulkOfferName(`Special Offer ${pct}% OFF`) }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: bulkOfferPct === pct ? '2px solid #e63946' : '1px solid #cbd5e1',
                      background: bulkOfferPct === pct ? '#fff5f5' : '#ffffff',
                      color: bulkOfferPct === pct ? '#e63946' : '#334155',
                      fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>
            </div>

            {/* Offer Name Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>2. OFFER CAMPAIGN NAME</label>
              <input
                type="text"
                value={bulkOfferName}
                onChange={(e) => setBulkOfferName(e.target.value)}
                placeholder="e.g. VIP Family Offer 50% OFF"
                style={inputStyle}
              />
            </div>

            {/* Contacts Text Area */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>3. PASTE 121 CONTACTS LIST (PHONE NUMBERS & NAMES)</label>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>One contact per line</span>
              </div>
              <textarea
                rows={8}
                value={bulkOfferText}
                onChange={(e) => setBulkOfferText(e.target.value)}
                placeholder={`Paste your list of 121 contacts here, for example:\n\n9876543210, John Doe\n9988776655, Sarah\n9123456789\n9876500000, Ramesh`}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.4, resize: 'vertical' }}
              />
            </div>

            <Button onClick={handleBulkImport} loading={bulkLoading} fullWidth style={{ padding: '14px', fontSize: '15px', fontWeight: 800 }}>
              <Gift size={20} /> Validate & Save All Contacts to POS
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {Object.entries(tierConfig).reverse().map(([tier, config]) => {
            const TierIcon = config.icon
            const nextTier = Object.entries(tierConfig).find(([t, c]) => c.min > config.min)
            const count = customers.filter(c => getTier(c.points) === tier).length
            return (
              <Card key={tier} style={{ borderTop: `4px solid ${config.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: config.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TierIcon size={24} color={config.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: config.color }}>{config.label}</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{config.min}+ points</p>
                  </div>
                </div>
                <div style={{ background: config.bg, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 600, color: config.color }}>{config.discount} Off</span>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>On every order</p>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {nextTier ? <p>{count} members &bull; {nextTier[1].min - config.min} pts to next tier</p> : <p>{count} members &bull; Top tier</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
