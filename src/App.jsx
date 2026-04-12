import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toaster'
import OfflineIndicator from './components/OfflineIndicator'
import Login from './pages/Login'
import Kiosk from './pages/Kiosk'
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
import Captain from './pages/Captain'
import Layout from './components/Layout'
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
    return <Navigate to="/login" replace />
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
    window.location.href = '/login'
  }

  return (
    <Layout user={user} onLogout={handleLogout} />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <OfflineIndicator />
        <Routes>
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/pos" replace />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/kot" element={<KOT />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/captain" element={<Captain />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/online-orders" element={<OnlineOrders />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
