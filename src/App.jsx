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
import Layout from './components/Layout'
import { SettingsProvider } from './lib/settingsContext'
import { useState, useEffect } from 'react'

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      setIsAuthenticated(true)
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
        background: 'white'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f4f6',
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
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
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

  const getRoutes = () => {
    if (hostname.includes('pos.')) {
      // POS Subdomain: pos.tendengyros.com
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/staff-login" replace />} />
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
      // Den Subdomain: den.tendengyros.com (Guest Auth & Self Order Kiosk)
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/kiosk" replace />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="*" element={<Navigate to="/kiosk" replace />} />
        </Routes>
      )
    } else {
      // Main Domain: tendengyros.com (And localhost / local fallback for development)
      return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kiosk" element={<Kiosk />} />
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
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      )
    }
  }

  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastProvider>
          <OfflineIndicator />
          {getRoutes()}
        </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
