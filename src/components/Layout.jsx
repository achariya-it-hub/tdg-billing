import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  Monitor, ChefHat, Tablet, ShoppingCart, LayoutDashboard, 
  UtensilsCrossed, Globe, BarChart3, LogOut, User, Package, Box, Users, UserPlus, BookOpen, ClipboardList, FileText, Receipt, Gem, Shield, KeyRound, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import API_BASE from '../lib/apiConfig'

const navItems = [
  { path: '/pos', icon: Monitor, label: 'POS', module: 'pos' },
  { path: '/captain', icon: ClipboardList, label: 'Captain', module: 'captain' },
  { path: '/kitchen', icon: ChefHat, label: 'Kitchen', module: 'kitchen' },
  { path: '/billing', icon: Receipt, label: 'Billing', module: 'billing' },
  { path: '/kot', icon: Tablet, label: 'KOT', module: 'kot' },
  { path: '/purchase', icon: Package, label: 'Purchase', module: 'purchase' },
  { path: '/inventory', icon: Box, label: 'Inventory', module: 'inventory' },
  { path: '/menu', icon: BookOpen, label: 'Menu', module: 'menu' },
  { path: '/hr', icon: Users, label: 'HR', module: 'hr' },
  { path: '/loyalty', icon: Gem, label: 'Loyalty', module: 'loyalty' },
  { path: '/customers', icon: UserPlus, label: 'Customers', module: 'customers' },
  { path: '/reports', icon: FileText, label: 'Reports', module: 'reports' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', module: 'dashboard' },
  { path: '/users', icon: Shield, label: 'Users', module: 'users' },
]

export default function Layout({ user, onLogout }) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [onlineCount, setOnlineCount] = useState(2)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [showPinModal, setShowPinModal] = useState(false)
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [pinSaving, setPinSaving] = useState(false)

  const handleChangePin = async () => {
    setPinError('')
    setPinSuccess('')
    if (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin) {
      setPinError('All fields required'); return
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError('New PINs do not match'); return
    }
    if (pinForm.newPin.length !== 4) {
      setPinError('PIN must be 4 digits'); return
    }
    setPinSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/billing/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, currentPin: pinForm.currentPin, newPin: pinForm.newPin })
      })
      const data = await res.json()
      if (res.ok) {
        setPinSuccess('PIN changed successfully')
        setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
        setTimeout(() => setShowPinModal(false), 1500)
      } else {
        setPinError(data.error || 'Failed to change PIN')
      }
    } catch {
      setPinError('Connection error')
    }
    setPinSaving(false)
  }

  const hasView = (module) => {
    if (!user) return true
    if (user.role === 'admin') return true
    if (!user.permissions) return true // legacy users see all
    return user.permissions?.[module]?.view === true
  }

  const visibleNavItems = navItems.filter(item => hasView(item.module))

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 5))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getCurrentTitle = () => {
    if (location.pathname === '/online-orders') return 'Online Orders'
    return navItems.find(n => location.pathname.startsWith(n.path))?.label || 'TDG'
  }

  // Mobile Layout with Sidebar
  const layout = isMobile ? (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        {/* Mobile Header with Menu Button */}
        <header
          style={{
            height: '56px',
            background: 'white',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                padding: '8px',
                background: 'var(--bg-secondary)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              <UtensilsCrossed size={20} color="#6b7280" />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>
              {getCurrentTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasView('onlineOrders') && (
            <NavLink
              to="/online-orders"
              style={{
                position: 'relative',
                padding: '8px',
                color: location.pathname === '/online-orders' ? '#e63946' : '#6b7280'
              }}
            >
              <Globe size={22} />
              {onlineCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    background: '#f59e0b',
                    borderRadius: '50%',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {onlineCount}
                </span>
              )}
            </NavLink>
            )}
            
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                padding: '8px',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <User size={20} color="#6b7280" />
            </button>
          </div>
        </header>

        {/* User Dropdown */}
        {showUserMenu && (
          <div style={{
            position: 'fixed',
            top: '56px',
            right: '16px',
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 200,
            minWidth: '200px'
          }}>
            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); setShowPinModal(true) }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f5f3ff',
                border: 'none',
                borderRadius: '10px',
                color: '#7c3aed',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              <KeyRound size={18} />
              Change PIN
            </button>
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fef2f2',
                border: 'none',
                borderRadius: '10px',
                color: '#dc2626',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {showMobileMenu && (
          <>
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 150
              }}
              onClick={() => setShowMobileMenu(false)}
            />
            <div style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              bottom: 0,
              width: '280px',
              background: 'white',
              zIndex: 200,
              overflowY: 'auto',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }}>
              {/* Logo */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>TDG Billing</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Restaurant POS</div>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <div style={{ padding: '12px' }}>
                {visibleNavItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      marginBottom: '4px',
                      borderRadius: '12px',
                      color: isActive ? '#e63946' : '#4b5563',
                      background: isActive ? '#fef2f2' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.2s'
                    })}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </NavLink>
                ))}
              </div>

              {/* Logout Button */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                <button
                  onClick={() => { setShowMobileMenu(false); onLogout() }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#fef2f2',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Content */}
        <main style={{ flex: 1, padding: '16px' }}>
          <Outlet />
        </main>
      </div>
    ) : (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: '80px',
          background: 'white',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '4px'
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            overflow: 'hidden'
          }}
        >
          <img 
            src="/TDG LOGO.png" 
            alt="TDG" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div style={{ display: 'none', width: '52px', height: '52px', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', borderRadius: '14px', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(230, 57, 70, 0.3)' }}>
            <UtensilsCrossed size={24} color="white" />
          </div>
        </div>

        {visibleNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            style={({ isActive }) => ({
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: isActive ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'transparent',
              color: isActive ? '#e63946' : '#9ca3af',
              transition: 'all 0.2s',
              textDecoration: 'none'
            })}
          >
            <item.icon size={22} />
            <span style={{ fontSize: '9px', fontWeight: 600 }}>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        {hasView('onlineOrders') && (
          <NavLink
            to="/online-orders"
            title="Online Orders"
            style={({ isActive }) => ({
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: isActive ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
              color: isActive ? '#2563eb' : '#9ca3af',
              transition: 'all 0.2s',
              textDecoration: 'none',
              position: 'relative'
            })}
          >
            <Globe size={22} />
            <span style={{ fontSize: '9px', fontWeight: 600 }}>Online</span>
            {onlineCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '18px',
                  height: '18px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {onlineCount}
              </span>
            )}
          </NavLink>
        )}

        <button
          onClick={onLogout}
          title="Logout"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'transparent',
            color: '#9ca3af',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          <LogOut size={22} />
          <span style={{ fontSize: '9px', fontWeight: 600 }}>Logout</span>
        </button>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: '64px',
            background: 'white',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px'
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '1px' }}>
            {getCurrentTitle()}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <User size={18} color="#6b7280" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{user?.name}</span>
                <span style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  background: 'white',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </span>
              </div>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  zIndex: 200,
                  minWidth: '200px'
                }}>
                  <button
                    onClick={() => { setShowUserMenu(false); setShowPinModal(true) }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#f5f3ff',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#7c3aed',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <KeyRound size={18} />
                    Change PIN
                  </button>
                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#dc2626',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
            <span style={{ 
              fontFamily: 'JetBrains Mono',
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: 'var(--bg-primary)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )

  return (
    <>
      {layout}
      {showPinModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500 }} onClick={() => { setShowPinModal(false); setPinError(''); setPinSuccess(''); setPinForm({ currentPin: '', newPin: '', confirmPin: '' }) }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '380px', zIndex: 501,
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#7c3aed" /> Change PIN
              </h3>
              <button onClick={() => { setShowPinModal(false); setPinError(''); setPinSuccess(''); setPinForm({ currentPin: '', newPin: '', confirmPin: '' }) }}
                style={{ padding: '8px', border: 'none', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            {pinSuccess && (
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                {pinSuccess}
              </div>
            )}

            {pinError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '16px', border: '1px solid #fecaca' }}>
                {pinError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Current PIN</label>
              <input type="password" maxLength={4} value={pinForm.currentPin}
                onChange={e => setPinForm({ ...pinForm, currentPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>New PIN</label>
              <input type="password" maxLength={4} value={pinForm.newPin}
                onChange={e => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Confirm New PIN</label>
              <input type="password" maxLength={4} value={pinForm.confirmPin}
                onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <button onClick={handleChangePin} disabled={pinSaving}
              style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', background: pinSaving ? '#9ca3af' : '#7c3aed', color: 'white' }}>
              {pinSaving ? 'Saving...' : 'Change PIN'}
            </button>
          </div>
        </>
      )}
    </>
  )
}
