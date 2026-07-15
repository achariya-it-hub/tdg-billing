import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, ShoppingBag, BarChart3, Globe, Lock, UtensilsCrossed } from 'lucide-react'
import API_BASE from '../lib/apiConfig'

const features = [
  { icon: ShoppingBag, title: 'Fast POS', desc: 'Quick billing with touch-optimized interface' },
  { icon: ChefHat, title: 'Kitchen Display', desc: 'Real-time KOT for your kitchen staff' },
  { icon: Globe, title: 'Online Orders', desc: 'Swiggy & Zomato orders in one place' },
  { icon: BarChart3, title: 'Analytics', desc: 'Sales insights and inventory tracking' },
]

export default function Login() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const arr = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 60,
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 4,
      emoji: ['🍔', '🍕', '🥗', '🍣', '🌮', '🍝'][i]
    }))
    setParticles(arr)
  }, [])

  const handlePinChange = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      if (newPin.length === 4) handleLogin(newPin)
    }
  }

  const handleBackspace = () => { setPin(pin.slice(0, -1)); setError('') }
  const handleClear = () => { setPin(''); setError('') }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return
      if (e.key >= '0' && e.key <= '9') handlePinChange(e.key)
      else if (e.key === 'Backspace') handleBackspace()
      else if (e.key === 'Escape') handleClear()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pin, loading])

  const handleLogin = async (pinToUse = pin) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/api/billing/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToUse })
      })
      const data = await res.json()
      if (res.ok && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/pos')
      } else {
        setError(data.error || 'Invalid PIN'); setPin('')
      }
    } catch {
      setError('Connection error. Check server.'); setPin('')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated gradient overlay */}
      <div className="animate-gradient" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(230, 57, 70, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(244, 162, 97, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(42, 157, 143, 0.06) 0%, transparent 50%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite',
        pointerEvents: 'none'
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          fontSize: `${p.size}px`, opacity: 0.08,
          animation: `float ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)'
        }}>
          {p.emoji}
        </div>
      ))}

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', position: 'relative', zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          gap: '80px',
          alignItems: 'center',
          maxWidth: '1100px',
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Left: Brand */}
          <div style={{
            flex: '1 1 300px',
            maxWidth: '440px',
            animation: 'fadeInUp 0.6s ease'
          }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '24px',
              background: 'linear-gradient(135deg, #c1121f 0%, #e63946 50%, #f4a261 100%)',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(230,57,70,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '32px', overflow: 'hidden', padding: '12px'
            }}>
              <img src="/tdg-logo.png" alt="TDG" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              TDG
            </h1>
            <h2 style={{
              fontSize: 'clamp(18px, 3vw, 28px)',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              letterSpacing: '-0.01em',
              marginBottom: '24px'
            }}>
              Restaurant Management System
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '15px',
              lineHeight: 1.7,
              maxWidth: '360px',
              margin: 0
            }}>
              Streamline your restaurant operations with POS, kitchen display, online orders, and analytics — all in one place.
            </p>
          </div>

          {/* Right: Login Card - Glassmorphism */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '28px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            animation: 'fadeInUp 0.6s ease 0.15s both'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(230,57,70,0.2) 0%, rgba(230,57,70,0.05) 100%)',
                border: '1px solid rgba(230,57,70,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Lock size={24} color="#e63946" />
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                marginBottom: '6px'
              }}>
                Staff Login
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
                margin: 0
              }}>
                Enter your 4-digit PIN
              </p>
            </div>

            {/* PIN Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '14px',
              marginBottom: '32px'
            }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: '52px',
                  height: '60px',
                  borderRadius: '14px',
                  background: pin.length > i ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${pin.length > i ? 'rgba(230,57,70,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: pin.length > i ? '0 4px 16px rgba(230, 57, 70, 0.35)' : 'none',
                  transform: pin.length > i ? 'translateY(-2px)' : 'none'
                }}>
                  {pin.length > i && (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 0 8px rgba(255,255,255,0.4)'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="animate-shake" style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                {error}
              </div>
            )}

            {/* Keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key, i) => (
                <button key={i}
                  onClick={() => { if (key === 'C') handleClear(); else if (key === '←') handleBackspace(); else handlePinChange(String(key)) }}
                  disabled={loading}
                  style={{
                    height: '60px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: key === 'C' ? 'rgba(220,38,38,0.08)' : key === '←' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                    color: key === 'C' ? '#fca5a5' : key === '←' ? '#93c5fd' : '#ffffff',
                    fontSize: key === 'C' || key === '←' ? '18px' : '22px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseDown={(e) => { if (!loading) { e.currentTarget.style.transform = 'scale(0.94)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' } }}
                  onMouseUp={(e) => { if (!loading) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = key === 'C' ? 'rgba(220,38,38,0.08)' : key === '←' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)' } }}
                  onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = key === 'C' ? 'rgba(220,38,38,0.08)' : key === '←' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)' } }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>
          &copy; 2024 TDG Billing &bull; Restaurant Management System
        </p>
      </footer>
    </div>
  )
}
