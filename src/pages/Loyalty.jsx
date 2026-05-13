import { useState } from 'react'
import { Smartphone, Gift, Users, Gem, ArrowUpDown, Wallet, Award, ChevronRight, Copy, Check, Crown, Share2, UserPlus, Swords } from 'lucide-react'

const getApiUrl = () => {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://tdg-billing-production.up.railway.app'
}

const TIER_COLORS = {
  Bronze: { color: '#cd7f32', bg: '#fef3e9' },
  Silver: { color: '#9ca3af', bg: '#f3f4f6' },
  Gold: { color: '#f59e0b', bg: '#fffbeb' },
  Platinum: { color: '#b0bec5', bg: '#f0f4f8' },
  Diamond: { color: '#38bdf8', bg: '#f0f9ff' },
  Emerald: { color: '#10b981', bg: '#ecfdf5' }
}

function TabButton({ label, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 8px',
        border: 'none',
        background: active ? '#e63946' : '#f3f4f6',
        color: active ? 'white' : '#6b7280',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function StepBox({ num, title, desc }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '14px',
      background: '#f8fafc',
      borderRadius: '12px',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#e63946',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 700,
        flexShrink: 0
      }}>{num}</div>
      <div>
        <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  )
}

export default function Loyalty() {
  const [tab, setTab] = useState('wallet')
  const [phone, setPhone] = useState(localStorage.getItem('loyaltyPhone') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', referralCode: '' })
  const [copied, setCopied] = useState(false)
  const [transferForm, setTransferForm] = useState({ toPhone: '', amount: '' })
  const [redeemAmount, setRedeemAmount] = useState('')
  const [denForm, setDenForm] = useState({ name: '', joinCode: '' })
  const [userDen, setUserDen] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [message, setMessage] = useState(null)

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchUser = async (phoneNum) => {
    if (!phoneNum) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/profile/${phoneNum}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        localStorage.setItem('loyaltyPhone', phoneNum)
        // Fetch den
        const denRes = await fetch(`${getApiUrl()}/api/loyalty/den/${phoneNum}`)
        if (denRes.ok) {
          const denData = await denRes.json()
          setUserDen(denData.den)
        }
        // Fetch transactions
        const txRes = await fetch(`${getApiUrl()}/api/loyalty/points/history/${phoneNum}`)
        if (txRes.ok) {
          setTransactions(await txRes.json())
        }
      } else {
        setUser(null)
        setShowRegister(true)
        setRegForm(prev => ({ ...prev, phone: phoneNum }))
      }
    } catch (e) {
      console.error(e)
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  const handleLogin = () => {
    if (!phone) return
    fetchUser(phone)
  }

  const handleRegister = async () => {
    if (!regForm.name || !regForm.phone || !regForm.email) {
      showMessage('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      })
      if (res.ok) {
        showMessage('Account created! Welcome bonus added!')
        setShowRegister(false)
        fetchUser(regForm.phone)
      } else {
        const err = await res.json()
        showMessage(err.error || 'Registration failed', 'error')
      }
    } catch (e) {
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTransfer = async () => {
    if (!transferForm.toPhone || !transferForm.amount) {
      showMessage('Fill recipient phone and amount', 'error')
      return
    }
    const amount = parseInt(transferForm.amount)
    if (amount > 200) {
      showMessage('Max transfer is 200 points', 'error')
      return
    }
    if (amount <= 0) {
      showMessage('Amount must be positive', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/points/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPhone: user.phone, toPhone: transferForm.toPhone, amount })
      })
      if (res.ok) {
        showMessage(`Transferred ${amount} Ruby points!`)
        setTransferForm({ toPhone: '', amount: '' })
        fetchUser(user.phone)
      } else {
        const err = await res.json()
        showMessage(err.error || 'Transfer failed', 'error')
      }
    } catch (e) {
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  const handleRedeem = async () => {
    const amount = parseInt(redeemAmount)
    if (amount < 3000) {
      showMessage('Minimum redemption is 3000 points', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/points/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, amount })
      })
      if (res.ok) {
        const data = await res.json()
        showMessage(`Redeemed ₹${data.redeemedRupees}!`)
        setRedeemAmount('')
        fetchUser(user.phone)
      } else {
        const err = await res.json()
        showMessage(err.error || 'Redemption failed', 'error')
      }
    } catch (e) {
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  const handleCreateDen = async () => {
    if (!denForm.name) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/den/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, name: denForm.name })
      })
      if (res.ok) {
        showMessage('Den created!')
        setDenForm({ name: '', joinCode: '' })
        fetchUser(user.phone)
      } else {
        const err = await res.json()
        showMessage(err.error || 'Failed to create den', 'error')
      }
    } catch (e) {
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  const handleJoinDen = async () => {
    if (!denForm.joinCode) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/loyalty/den/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, denCode: denForm.joinCode })
      })
      if (res.ok) {
        showMessage('Joined den!')
        setDenForm({ name: '', joinCode: '' })
        fetchUser(user.phone)
      } else {
        const err = await res.json()
        showMessage(err.error || 'Failed to join den', 'error')
      }
    } catch (e) {
      showMessage('Error connecting to server', 'error')
    }
    setLoading(false)
  }

  // Login/Register Screen
  if (!user) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        <div style={{
          textAlign: 'center',
          padding: '40px 0 24px'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(230,57,70,0.3)'
          }}>
            <Gem size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Ruby Rewards</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Earn points. Build your pride. Unlock rewards.</p>
        </div>

        {!showRegister ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Phone Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleLogin}
                  disabled={loading || !phone}
                  style={{
                    padding: '14px 24px',
                    background: '#e63946',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: loading || !phone ? 0.6 : 1
                  }}
                >
                  {loading ? '...' : 'Go'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>New here? </span>
              <button
                onClick={() => setShowRegister(true)}
                style={{
                  color: '#e63946',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Create Account
              </button>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: '#fef2f2', borderRadius: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b', marginBottom: '8px' }}>How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <StepBox num={1} title="Sign Up" desc="Create your account with referral code for bonus points" />
                <StepBox num={2} title="Earn Ruby Points" desc="Get 400 bonus points on signup + 50 for each friend you refer" />
                <StepBox num={3} title="Build Your Den" desc="Create a den with up to 10 members and earn Pride Lion status" />
                <StepBox num={4} title="Redeem Rewards" desc="Redeem 3000+ points for real rewards" />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowRegister(false)}
              style={{
                padding: '8px 0',
                color: '#6b7280',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              &larr; Back
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>Create Account</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Full Name</label>
                <input
                  value={regForm.name}
                  onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                <input
                  value={regForm.phone}
                  onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Email ID</label>
                <input
                  value={regForm.email}
                  onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  type="email"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Referral Code (optional)</label>
                <input
                  value={regForm.referralCode}
                  onChange={e => setRegForm(prev => ({ ...prev, referralCode: e.target.value }))}
                  placeholder="Enter referrer's code"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#e63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}
        {message && <Toast msg={message.text} type={message.type} />}
      </div>
    )
  }

  // Dashboard - Logged In
  const getTierColor = () => TIER_COLORS[user.tier] || { color: '#cd7f32', bg: '#fef3e9' }
  const tierColor = getTierColor()

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0 80px' }}>
      {/* Message Toast */}
      {message && <Toast msg={message.text} type={message.type} />}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '0 0 24px 24px',
        padding: '24px 20px',
        color: 'white',
        margin: '0 -16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '2px' }}>Welcome back</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{user.name}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Referral</div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '2px', fontFamily: 'monospace' }}>
              {user.referralCode}
            </div>
          </div>
        </div>

        {/* Points - Wallet */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>RUBY POINTS</div>
            <div style={{ fontSize: '32px', fontWeight: 800 }}>{user.rubyPoints.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>≈ ₹{user.rubyPoints}</div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(230,57,70,0.4)'
          }}>
            <Gem size={28} color="white" />
          </div>
        </div>

        {/* Tier Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
          padding: '10px 14px'
        }}>
          <Crown size={16} color={tierColor.color} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.tier} Tier</span>
          {user.isRubyCrown && (
            <span style={{
              background: 'linear-gradient(135deg, #e63946, #f59e0b)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              RUBY CROWN
            </span>
          )}
          <span style={{ flex: 1 }} />
          {user.nextTier && (
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              Next: {user.nextTier.name} ({user.progress.current}/{user.progress.max})
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {user.nextTier && (
          <div style={{
            marginTop: '8px',
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (user.progress.current / user.progress.max) * 100)}%`,
              background: 'linear-gradient(90deg, #e63946, #f59e0b)',
              borderRadius: '2px',
              transition: 'width 0.5s'
            }} />
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button onClick={handleCopyReferral} style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Referral Code'}
          </button>
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Join TDG Ruby Rewards',
                text: `Use my referral code ${user.referralCode} to get 400 bonus Ruby points!`
              })
            }
          }} style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        marginBottom: '16px'
      }}>
        <TabButton label="Wallet" icon={Wallet} active={tab === 'wallet'} onClick={() => setTab('wallet')} />
        <TabButton label="Den" icon={Users} active={tab === 'den'} onClick={() => setTab('den')} />
        <TabButton label="Transfer" icon={ArrowUpDown} active={tab === 'transfer'} onClick={() => setTab('transfer')} />
        <TabButton label="Tiers" icon={Award} active={tab === 'tiers'} onClick={() => setTab('tiers')} />
      </div>

      {/* Tab Content */}
      {tab === 'wallet' && (
        <div>
          {/* Wallet Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Smartphone size={20} color="#e63946" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Ruby Wallet</span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>TDG Ruby Rewards</div>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{user.rubyPoints.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                Ruby Points &bull; {user.name}
              </div>
              <div style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                color: '#6b7280'
              }}>
                **** **** **** {user.referralCode}
              </div>
            </div>
          </div>

          {/* Redeem */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Redeem Points</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              Minimum 3,000 Ruby points to redeem. 1 point = ₹1
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={redeemAmount}
                onChange={e => setRedeemAmount(e.target.value)}
                placeholder="Enter points to redeem (min 3000)"
                min="3000"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleRedeem}
                disabled={loading || !redeemAmount}
                style={{
                  padding: '12px 20px',
                  background: '#e63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: loading || !redeemAmount ? 0.6 : 1
                }}
              >
                {loading ? '...' : 'Redeem'}
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Recent Activity</div>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px' }}>
                No transactions yet. Start earning Ruby points!
              </div>
            ) : (
              transactions.slice(0, 10).map((tx, i) => (
                <div key={tx.id || i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < transactions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>{tx.description}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: tx.amount > 0 ? '#10b981' : '#e63946'
                  }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Den Tab */}
      {tab === 'den' && (
        <div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Swords size={20} color="#e63946" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Your Den</span>
              {userDen?.isPrideLion && (
                <span style={{
                  padding: '2px 10px',
                  background: 'linear-gradient(135deg, #f59e0b, #e63946)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  PRIDE LION
                </span>
              )}
            </div>

            {userDen ? (
              <div>
                <div style={{
                  padding: '14px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                    🦁 {userDen.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    Leader: {userDen.leaderName} &bull; {userDen.memberCount}/10 members
                  </div>
                </div>

                {/* Members */}
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Members ({userDen.memberCount}/10)
                </div>
                {userDen.members.map((m, i) => (
                  <div key={m.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom: i < userDen.members.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: m.id === userDen.leaderId ? '#fef2f2' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: m.id === userDen.leaderId ? '#e63946' : '#6b7280'
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: m.id === userDen.leaderId ? 700 : 500, color: '#1a1a2e' }}>
                        {m.name} {m.id === userDen.leaderId && '(Leader)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{m.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Create or join a den (max 10 members per den, no cross-adding). Complete your den to become a Pride Lion!
                </p>

                {/* Create Den */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Create a Den</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={denForm.name}
                      onChange={e => setDenForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Den name"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleCreateDen}
                      disabled={loading || !denForm.name}
                      style={{
                        padding: '12px 20px',
                        background: '#e63946',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: loading || !denForm.name ? 0.6 : 1
                      }}
                    >
                      Create
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                {/* Join Den */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Join a Den</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={denForm.joinCode}
                      onChange={e => setDenForm(prev => ({ ...prev, joinCode: e.target.value }))}
                      placeholder="Den name or code"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleJoinDen}
                      disabled={loading || !denForm.joinCode}
                      style={{
                        padding: '12px 20px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: loading || !denForm.joinCode ? 0.6 : 1
                      }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Tab */}
      {tab === 'transfer' && (
        <div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ArrowUpDown size={20} color="#e63946" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Transfer Ruby Points</span>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', padding: '12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              Max 200 points per transfer. Your balance: <strong>{user.rubyPoints}</strong> Ruby points
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Recipient Phone</label>
                <input
                  value={transferForm.toPhone}
                  onChange={e => setTransferForm(prev => ({ ...prev, toPhone: e.target.value }))}
                  placeholder="Recipient's phone number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Amount (max 200)</label>
                <input
                  type="number"
                  value={transferForm.amount}
                  onChange={e => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Ruby points to transfer"
                  min="1"
                  max="200"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={loading || !transferForm.toPhone || !transferForm.amount}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#e63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  opacity: loading || !transferForm.toPhone || !transferForm.amount ? 0.6 : 1
                }}
              >
                {loading ? 'Transferring...' : 'Transfer Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tiers Tab */}
      {tab === 'tiers' && (
        <div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Award size={20} color="#e63946" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Tier Levels</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Bronze', points: '0 - 999', icon: '🥉', color: '#cd7f32' },
                { name: 'Silver', points: '1,000 - 2,999', icon: '🥈', color: '#9ca3af' },
                { name: 'Gold', points: '3,000 - 5,999', icon: '🥇', color: '#f59e0b' },
                { name: 'Platinum', points: '6,000 - 14,999', icon: '💎', color: '#b0bec5' },
                { name: 'Diamond', points: '15,000 - 24,999', icon: '💠', color: '#38bdf8' },
                { name: 'Emerald', points: '25,000+', icon: '🟢', color: '#10b981' }
              ].map((tier, i) => (
                <div key={tier.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: user.tier === tier.name ? '#fef2f2' : '#f8fafc',
                  border: user.tier === tier.name ? '2px solid #e63946' : '1px solid transparent'
                }}>
                  <div style={{ fontSize: '24px' }}>{tier.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: user.tier === tier.name ? 700 : 500,
                      color: '#1a1a2e'
                    }}>
                      {tier.name} {user.tier === tier.name && '(Current)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{tier.points} points</div>
                  </div>
                  {user.rubyPoints >= parseInt(tier.points.replace(/,/g, '')) && (
                    <Check size={20} color="#10b981" />
                  )}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>👑 Ruby Crown</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Reach 25,000 points to unlock Emerald tier with the prestigious Ruby Crown status.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '14px 24px',
      borderRadius: '12px',
      background: type === 'error' ? '#fef2f2' : '#f0fdf4',
      border: type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
      color: type === 'error' ? '#dc2626' : '#16a34a',
      fontWeight: 600,
      fontSize: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      animation: 'slideUp 0.3s ease',
      maxWidth: '90%',
      textAlign: 'center'
    }}>
      {msg}
    </div>
  )
}