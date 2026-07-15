import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  Monitor, ChefHat, Tablet, ShoppingCart, LayoutDashboard, 
  UtensilsCrossed, Globe, BarChart3, LogOut, User, Package, Box, Users, UserPlus, BookOpen, FileText, Receipt, Gem, Shield, KeyRound, X, DollarSign, Settings, Landmark
} from 'lucide-react'
import { useState, useEffect } from 'react'
import API_BASE from '../lib/apiConfig'

const navItems = [
  { path: '/pos', icon: Monitor, label: 'POS', module: 'pos' },
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
  { path: '/expenses', icon: DollarSign, label: 'Expenses', module: 'expenses' },
  { path: '/accounts', icon: Landmark, label: 'Accounts', module: 'purchase' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', module: 'dashboard' },
  { path: '/users', icon: Shield, label: 'Users', module: 'users' },
]

export default function Layout({ user, onLogout }) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [onlineCount, setOnlineCount] = useState(2)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  const [queuedCount, setQueuedCount] = useState(0)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [pinSaving, setPinSaving] = useState(false)

  useEffect(() => {
    const handler = () => setShowInstallBtn(true)
    window.addEventListener('pwa-install-ready', handler)
    if (window.getPWAPrompt?.()) setShowInstallBtn(true)
    return () => window.removeEventListener('pwa-install-ready', handler)
  }, [])

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
    if (user.role === 'admin' || user.role === 'super-admin') return true
    if (!user.permissions) return true
    return user.permissions?.[module]?.view === true
  }

  const visibleNavItems = navItems.filter(item => hasView(item.module))
  if (user?.role === 'super-admin') {
    visibleNavItems.push({ path: '/settings', icon: Settings, label: 'Settings', module: 'settings' })
  }

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

  // Network status tracking
  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    setIsOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Listen for SW messages (queue count, replayed)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'QUEUE_COUNT') setQueuedCount(e.data.count)
      if (e.data?.type === 'QUEUE_REPLAYED') setQueuedCount(0)
      if (e.data?.type === 'OFFLINE_QUEUED') setQueuedCount(c => c + 1)
    }
    navigator.serviceWorker?.addEventListener('message', handler)
    // Poll queue count periodically
    const poll = setInterval(() => {
      navigator.serviceWorker?.controller?.postMessage({ type: 'GET_QUEUE_COUNT' })
    }, 5000)
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handler)
      clearInterval(poll)
    }
  }, [])

  const getCurrentTitle = () => {
    if (location.pathname === '/online-orders') return 'Online Orders'
    if (location.pathname === '/accounts') return 'Accounts'
    const item = navItems.find(n => location.pathname.startsWith(n.path))
    if (item) return item.label
    return 'TDG'
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
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
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
                background: 'rgba(0,0,0,0.04)',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isOffline && (
                <div title="Offline - Changes queued" style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.5)'
                }} />
              )}
              {queuedCount > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: '#f59e0b',
                  background: 'rgba(245,158,11,0.1)', padding: '1px 5px',
                  borderRadius: '8px', minWidth: '16px', textAlign: 'center'
                }}>{queuedCount}</span>
              )}
            </div>

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                padding: '8px',
                background: 'rgba(0,0,0,0.04)',
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
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            zIndex: 200,
            minWidth: '200px'
          }}>
            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); setShowPinModal(true) }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(124, 58, 237, 0.08)',
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
                background: 'rgba(220,38,38,0.08)',
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
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
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
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 200,
              overflowY: 'auto',
              borderRight: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '4px 0 30px rgba(0,0,0,0.08)'
            }}>
              {/* Logo */}
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(230,57,70,0.3)' }}>
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
                      background: isActive ? 'linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(230,57,70,0.03) 100%)' : 'transparent',
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

              {/* Install PWA Button (Mobile) */}
              {showInstallBtn && (
                <div style={{ padding: '0 12px 8px' }}>
                  <button
                    onClick={() => {
                      if (window.isPWAiOS) {
                        alert('To install TDG POS on your iPhone:\n\n1. Tap the Share button (□↗) below\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner\n\nThe app will appear on your home screen!')
                      } else {
                        const prompt = window.getPWAPrompt?.()
                        if (prompt) {
                          prompt.prompt()
                          prompt.userChoice.then(() => {
                            window.clearPWAPrompt?.()
                            setShowInstallBtn(false)
                            setShowMobileMenu(false)
                          })
                        } else {
                          alert('To install:\n\nAndroid: Use Chrome menu → Install app\n\nDesktop: Click the install icon in the address bar')
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '12px',
                      color: '#22c55e',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Install App
                  </button>
                </div>
              )}

              {/* Logout Button */}
              <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.04)', marginTop: 'auto' }}>
                <button
                  onClick={() => { setShowMobileMenu(false); onLogout() }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(220,38,38,0.08)',
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
      {/* Glass Sidebar */}
      <nav
        style={{
          width: '80px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '2px',
          position: 'relative',
          zIndex: 10
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
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(230, 57, 70, 0.25)'
          }}
        >
          <img 
            src="/TDG LOGO.png" 
            alt="TDG" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div style={{ display: 'none', width: '52px', height: '52px', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', borderRadius: '14px', alignItems: 'center', justifyContent: 'center' }}>
            <UtensilsCrossed size={24} color="white" />
          </div>
        </div>

        {visibleNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            style={({ isActive }) => ({
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(230,57,70,0.12) 0%, rgba(230,57,70,0.04) 100%)' 
                : 'transparent',
              color: isActive ? '#e63946' : '#9ca3af',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textDecoration: 'none',
              position: 'relative'
            })}
          >
            {location.pathname.startsWith(item.path) && (
              <div style={{
                position: 'absolute',
                left: '-14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #e63946, #c1121f)',
                borderRadius: '0 3px 3px 0'
              }} />
            )}
            <item.icon size={20} />
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px' }}>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        {hasView('onlineOrders') && (
          <NavLink
            to="/online-orders"
            title="Online Orders"
            style={({ isActive }) => ({
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
              color: isActive ? '#2563eb' : '#9ca3af',
              transition: 'all 0.2s',
              textDecoration: 'none',
              position: 'relative'
            })}
          >
            <Globe size={20} />
            <span style={{ fontSize: '9px', fontWeight: 600 }}>Online</span>
            {onlineCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 2px 6px rgba(245,158,11,0.4)'
                }}
              >
                {onlineCount}
              </span>
            )}
          </NavLink>
        )}

        {/* Offline indicator */}
        <div title={isOffline ? `Offline - ${queuedCount} queued` : 'Online'}
          style={{
            width: '40px', padding: '6px', marginBottom: '4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
          }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: isOffline ? '#f59e0b' : '#10b981',
            boxShadow: isOffline ? '0 0 8px rgba(245,158,11,0.5)' : '0 0 8px rgba(16,185,129,0.4)'
          }} />
          {queuedCount > 0 && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b' }}>{queuedCount}</span>
          )}
        </div>

        {/* Install PWA button */}
        {showInstallBtn && (
          <button
            onClick={() => {
              if (window.isPWAiOS) {
                // iOS: show manual instructions
                setShowInstallBtn(false)
                alert('To install TDG POS on your iPhone:\n\n1. Tap the Share button (□↗) below\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner\n\nThe app will appear on your home screen!')
              } else {
                const prompt = window.getPWAPrompt?.()
                if (prompt) {
                  prompt.prompt()
                  prompt.userChoice.then(() => {
                    window.clearPWAPrompt?.()
                    setShowInstallBtn(false)
                  })
                } else {
                  // Fallback: show instructions
                  alert('To install:\n\nAndroid: Tap "Add to Home Screen" when prompted, or use Chrome menu → Install app\n\nDesktop: Click the install icon in the address bar')
                  setShowInstallBtn(false)
                }
              }
            }}
            title="Install App"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
              color: '#22c55e',
              transition: 'all 0.2s',
              border: '1px solid rgba(34,197,94,0.2)',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 600 }}>Install</span>
          </button>
        )}

        <button
          onClick={onLogout}
          title="Logout"
          style={{
            width: '52px',
            height: '52px',
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
            marginTop: '4px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.color = '#dc2626' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: '9px', fontWeight: 600 }}>Logout</span>
        </button>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: '64px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 9
          }}
        >
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            {getCurrentTitle()}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

            {/* Offline indicator */}
            {isOffline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.5)'
                }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                  Offline{queuedCount > 0 ? ` (${queuedCount})` : ''}
                </span>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
              >
                <User size={18} color="#6b7280" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{user?.name}</span>
                <span style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  background: 'rgba(0,0,0,0.04)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'capitalize',
                  fontWeight: 500
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
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  minWidth: '200px'
                }}>
                  <button
                    onClick={() => { setShowUserMenu(false); setShowPinModal(true) }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(124, 58, 237, 0.08)',
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
                      background: 'rgba(220,38,38,0.08)',
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
              color: '#6b7280',
              background: 'rgba(0,0,0,0.03)',
              padding: '6px 12px',
              borderRadius: '8px',
              letterSpacing: '0.5px'
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 500 }} onClick={() => { setShowPinModal(false); setPinError(''); setPinSuccess(''); setPinForm({ currentPin: '', newPin: '', confirmPin: '' }) }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '380px', zIndex: 501,
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#7c3aed" /> Change PIN
              </h3>
              <button onClick={() => { setShowPinModal(false); setPinError(''); setPinSuccess(''); setPinForm({ currentPin: '', newPin: '', confirmPin: '' }) }}
                style={{ padding: '8px', border: 'none', background: 'rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            {pinSuccess && (
              <div style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', padding: '12px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '16px', border: '1px solid rgba(22,163,74,0.15)' }}>
                {pinSuccess}
              </div>
            )}

            {pinError && (
              <div style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '16px', border: '1px solid rgba(220,38,38,0.15)' }}>
                {pinError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Current PIN</label>
              <input type="password" maxLength={4} value={pinForm.currentPin}
                onChange={e => setPinForm({ ...pinForm, currentPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>New PIN</label>
              <input type="password" maxLength={4} value={pinForm.newPin}
                onChange={e => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Confirm New PIN</label>
              <input type="password" maxLength={4} value={pinForm.confirmPin}
                onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '14px', textAlign: 'center', letterSpacing: '4px' }} />
            </div>
            <button onClick={handleChangePin} disabled={pinSaving}
              style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', background: pinSaving ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              {pinSaving ? 'Saving...' : 'Change PIN'}
            </button>
          </div>
        </>
      )}
    </>
  )
}
