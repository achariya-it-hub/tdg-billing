import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  Monitor, ChefHat, Tablet, ShoppingCart, LayoutDashboard, 
  UtensilsCrossed, Globe, BarChart3, LogOut, User, Package, Box, Users, UserPlus, BookOpen, ClipboardList, FileText, Receipt
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/pos', icon: Monitor, label: 'POS' },
  { path: '/captain', icon: ClipboardList, label: 'Captain' },
  { path: '/kitchen', icon: ChefHat, label: 'Kitchen' },
  { path: '/billing', icon: Receipt, label: 'Billing' },
  { path: '/kot', icon: Tablet, label: 'KOT' },
  { path: '/purchase', icon: Package, label: 'Purchase' },
  { path: '/inventory', icon: Box, label: 'Inventory' },
  { path: '/menu', icon: BookOpen, label: 'Menu' },
  { path: '/hr', icon: Users, label: 'HR' },
  { path: '/customers', icon: UserPlus, label: 'Customers' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
]

export default function Layout({ user, onLogout }) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [onlineCount, setOnlineCount] = useState(2)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
  if (isMobile) {
    return (
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
                {navItems.map(item => (
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
        <main style={{ flex: 1, padding: '16px', paddingBottom: '80px' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  // Desktop Layout
  return (
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

        {navItems.map(item => (
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px'
            }}>
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
}
