import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toaster'
import OfflineIndicator from './components/OfflineIndicator'
import Login from './pages/Login'
import Kiosk from './pages/Kiosk'
import LandingPage from './pages/LandingPage'
import CustomerAuth from './pages/CustomerAuth'
import Reports from './pages/Reports'
import Billing from './pages/Billing'
import POS from './pages/POS'
import Kitchen from './pages/Kitchen'
import KOT from './pages/KOT'
import OnlineOrders from './pages/OnlineOrders'
import Dashboard from './pages/Dashboard'
import Purchase from './pages/Purchase'
import Inventory from './pages/Inventory'
import Menu from './pages/Menu'
import HR from './pages/HR'
import Customers from './pages/Customers'
import Loyalty from './pages/Loyalty'
import Users from './pages/Users'
import Expenses from './pages/Expenses'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import Customizer from './pages/Customizer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import MobilePreview from './pages/MobilePreview'
import DenWebApp from './pages/DenWebApp'
import TableQRGenerator from './pages/TableQRGenerator'
import Layout from './components/Layout'
import { SettingsProvider } from './lib/settingsContext'
import { useState, useEffect, Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0f0f1a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ fontSize: '24px', color: '#e63946', marginBottom: '12px' }}>
            Session Reset Required
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '20px', textAlign: 'center', maxWidth: '450px' }}>
            A temporary browser session error occurred. Click below to reset session and login cleanly.
          </p>
          {this.state.error?.message && (
            <div style={{
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.2)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              color: '#f87171',
              marginBottom: '20px',
              fontFamily: 'monospace',
              maxWidth: '500px',
              wordBreak: 'break-word',
              textAlign: 'center'
            }}>
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={() => {
              try {
                localStorage.clear()
                sessionStorage.clear()
              } catch (e) {
                console.error(e)
              }
              window.location.href = '/staff-login'
            }}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #e63946, #c1121f)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(230,57,70,0.4)'
            }}
          >
            Reset Session & Login
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        const parsed = JSON.parse(userStr)
        if (parsed && typeof parsed === 'object' && (parsed.role || parsed.id || parsed.name)) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('user')
        }
      } else {
        localStorage.removeItem('user')
      }
    } catch (e) {
      console.error('ProtectedRoute user parse error:', e)
      localStorage.removeItem('user')
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f1a'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#e63946',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff-login" replace />
  }

  return <Outlet />
}

function AppLayout() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const parsed = JSON.parse(userData)
        if (parsed && typeof parsed === 'object') {
          setUser(parsed)
        }
      }
    } catch (e) {
      console.error('AppLayout user parse error:', e)
      localStorage.removeItem('user')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/staff-login'
  }

  return (
    <Layout user={user} onLogout={handleLogout} />
  )
}

export default function App() {
  const hostname = window.location.hostname;
  const path = window.location.pathname;

  const getRoutes = () => {
    if (hostname.includes('pos.') || path.startsWith('/pos') || path.startsWith('/staff-login')) {
      // POS Subdomain: pos.tendengyros.com or staff routes
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/staff-login" element={<Login />} />
          <Route path="/login" element={<Navigate to="/staff-login" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/pos" element={<POS />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/kot" element={<KOT />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/online-orders" element={<OnlineOrders />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loyalty" element={<Loyalty />} />
              <Route path="/users" element={<Users />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/staff-login" replace />} />
        </Routes>
      )
    } else if (hostname.includes('den.')) {
      // Den Subdomain: den.tendengyros.com (Renders the exact Flutter Mobile Web App)
      return (
        <Routes>
          <Route path="/" element={<DenWebApp />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/customizer" element={<DenWebApp />} />
          <Route path="/login" element={<DenWebApp />} />
          <Route path="*" element={<DenWebApp />} />
        </Routes>
      )
    } else {
      // Main Domain: tendengyros.com (And localhost / local fallback for development)
      return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/den" element={<DenWebApp />} />
          <Route path="/den-app" element={<DenWebApp />} />
          <Route path="/mobile" element={<MobilePreview />} />
          <Route path="/app-preview" element={<MobilePreview />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/order" element={<Kiosk />} />
          <Route path="/table/:tableNum" element={<Kiosk />} />
          <Route path="/customizer" element={<Customizer />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/staff-login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/pos" element={<POS />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/kot" element={<KOT />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/online-orders" element={<OnlineOrders />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loyalty" element={<Loyalty />} />
              <Route path="/users" element={<Users />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/table-qr" element={<TableQRGenerator />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      )
    }
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <ToastProvider>
            <OfflineIndicator />
            {getRoutes()}
          </ToastProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
