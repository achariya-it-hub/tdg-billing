import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Award, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  LogOut,
  ShoppingBag
} from 'lucide-react'
import API_BASE from '../lib/apiConfig'

export default function CustomerAuth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // User state if logged in
  const [customer, setCustomer] = useState(null)

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referredBy: ''
  })

  useEffect(() => {
    // Check URL parameters for session credentials (for subdomain redirection)
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const userParam = params.get('user')

    if (tokenParam && userParam) {
      try {
        localStorage.setItem('customer_token', tokenParam)
        localStorage.setItem('customer_user', decodeURIComponent(userParam))
        
        // Clean URL parameter list
        window.history.replaceState({}, document.title, window.location.pathname)
        
        const parsedUser = JSON.parse(decodeURIComponent(userParam))
        setCustomer(parsedUser)
        
        setTimeout(() => {
          navigate('/kiosk')
        }, 800)
        return
      } catch (e) {
        console.error('Failed to parse URL login credentials', e)
      }
    }

    const savedCustomer = localStorage.getItem('customer_user')
    if (savedCustomer) {
      setCustomer(JSON.parse(savedCustomer))
    }
  }, [navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const url = isLogin 
      ? `${API_BASE}/api/auth/login`
      : `${API_BASE}/api/auth/signup`

    const body = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password,
          referredBy: formData.referredBy 
        }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('customer_token', data.token)
        localStorage.setItem('customer_user', JSON.stringify(data.user))
        setCustomer(data.user)
        setSuccess(isLogin ? 'Logged in successfully!' : 'Account created successfully!')
        
        // Clear inputs
        setFormData({ name: '', email: '', phone: '', password: '', referredBy: '' })
        
        // Wait and redirect to kiosk
        setTimeout(() => {
          const isMainDomain = !window.location.hostname.includes('den.') && !window.location.hostname.includes('pos.')
          if (isMainDomain && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            const redirectUrl = `https://den.tendengyros.com/login?token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`
            window.location.href = redirectUrl
          } else {
            navigate('/kiosk')
          }
        }, 1500)
      } else {
        setError(data.message || 'Authentication failed. Please check your details.')
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_user')
    setCustomer(null)
    setSuccess('Logged out successfully.')
    setTimeout(() => setSuccess(''), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0c 0%, #121216 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Spots */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(230, 57, 70, 0.08) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Navigation Header */}
      <div style={{
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Link to="/" style={{
          color: '#ffd700',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 700
        }}>
          <ArrowLeft size={16} /> BACK TO HOME
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/tdg-logo.png" alt="TDG" style={{ height: '32px' }} onError={(e) => e.target.style.display = 'none'} />
          <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>TEN DEN GYROS</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <AnimatePresence mode="wait">
          {customer ? (
            /* Logged In Dashboard View */
            <motion.div
              key="logged-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <Award size={36} color="#ffd700" />
              </div>

              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome, {customer.name}!</h2>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '6px' }}>Your Guest Den Account is active.</p>
              </div>

              {/* Points Card */}
              <div style={{
                backgroundColor: 'rgba(255, 215, 0, 0.05)',
                border: '1.5px dashed rgba(255, 215, 0, 0.3)',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' }}>Available Loyalty Points</span>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffd700', marginTop: '4px' }}>
                  🪙 {customer.points || 0}
                </div>
                <p style={{ fontSize: '11px', color: '#ffd700', marginTop: '8px' }}>
                  Use points to claim free sides and beverages on order checkout!
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/kiosk" style={{
                  backgroundColor: '#e63946',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <ShoppingBag size={18} /> GO TO SELF ORDER KIOSK
                </Link>

                <button 
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ff8b94',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={16} /> SIGN OUT
                </button>
              </div>
            </motion.div>
          ) : (
            /* Login / Signup Form View */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              {/* Form Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '30px' }}>
                <button
                  onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
                  style={{
                    flex: 1,
                    paddingBottom: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isLogin ? '2.5px solid #ffd700' : 'none',
                    color: isLogin ? '#ffd700' : '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  SIGN IN
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
                  style={{
                    flex: 1,
                    paddingBottom: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: !isLogin ? '2.5px solid #ffd700' : 'none',
                    color: !isLogin ? '#ffd700' : '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Name (Signup only) */}
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>FULL NAME</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#9ca3af' }} />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '14px 16px 14px 40px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Email (Always needed) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>
                    {isLogin ? 'EMAIL OR PHONE NUMBER' : 'EMAIL ADDRESS'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#9ca3af' }} />
                    <input
                      type="text"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "email@example.com or 9876543210" : "email@example.com"}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '14px 16px 14px 40px',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                {/* Phone (Signup only) */}
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>PHONE NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#9ca3af' }} />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '14px 16px 14px 40px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Password (Always needed) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#9ca3af' }} />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '14px 16px 14px 40px',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                {/* Referral Code (Signup only) */}
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>REFERRAL CODE (OPTIONAL)</label>
                      <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: 700 }}>GET +500 PTS</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Award size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#9ca3af' }} />
                      <input
                        type="text"
                        name="referredBy"
                        value={formData.referredBy}
                        onChange={handleInputChange}
                        placeholder="Friend's email or phone number"
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '14px 16px 14px 40px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(230, 57, 70, 0.15)',
                    border: '1px solid rgba(230, 57, 70, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#ff8b94',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div style={{
                    backgroundColor: 'rgba(42, 157, 143, 0.15)',
                    border: '1px solid rgba(42, 157, 143, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#80ed99',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Check size={16} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#ffd700',
                    color: '#000',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { if(!loading) e.target.style.backgroundColor = '#ffd700'; e.target.style.transform = 'scale(1.01)' }}
                  onMouseLeave={e => { if(!loading) e.target.style.backgroundColor = '#ffd700'; e.target.style.transform = 'none' }}
                >
                  {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE DEN ACCOUNT'}
                </button>

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
