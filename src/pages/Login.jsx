import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Clock, ShoppingBag, BarChart3, Globe, Lock, User, Eye, EyeOff, UtensilsCrossed } from 'lucide-react'

const features = [
  { icon: ShoppingBag, title: 'Fast POS', desc: 'Quick billing with touch-optimized interface' },
  { icon: ChefHat, title: 'Kitchen Display', desc: 'Real-time KOT for your kitchen staff' },
  { icon: Globe, title: 'Online Orders', desc: 'Swiggy & Zomato orders in one place' },
  { icon: BarChart3, title: 'Analytics', desc: 'Sales insights and inventory tracking' },
]

export default function Login() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentBg, setCurrentBg] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePinChange = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      
      if (newPin.length === 4) {
        handleLogin(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const demoUsers = {
    '1234': { id: 'u1', name: 'Admin', role: 'admin' },
    '5678': { id: 'u2', name: 'Manager', role: 'manager' },
    '0000': { id: 'u3', name: 'Cashier', role: 'cashier' },
    '9999': { id: 'u4', name: 'Kitchen', role: 'kitchen' },
    '8888': { id: 'u5', name: 'Kitchen Staff', role: 'kitchen' }
  }

  const handleLogin = async (pinToUse = pin) => {
    setLoading(true)
    setError('')
    
    const user = demoUsers[pinToUse]
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/pos')
    } else {
      setError('Invalid PIN')
      setPin('')
    }
    
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #fff7ed 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${20 + currentBg * 30}% 50%, rgba(230, 57, 70, 0.08) 0%, transparent 50%)`,
          transition: 'background 1s ease'
        }} />
        
        {/* Floating Food Icons */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          fontSize: '80px',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}>
          🍔
        </div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          fontSize: '60px',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite 1s'
        }}>
          🍗
        </div>
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '8%',
          fontSize: '50px',
          opacity: 0.1,
          animation: 'float 7s ease-in-out infinite 2s'
        }}>
          🍟
        </div>

        {/* Logo & Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            overflow: 'hidden'
          }}>
            <img 
              src="/TDG LOGO.png" 
              alt="TDG Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
          <h1 style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 'clamp(48px, 10vw, 72px)',
            letterSpacing: '4px',
            color: '#1a1a2e',
            margin: 0,
            lineHeight: 1
          }}>
            TDG <span style={{ color: '#e63946' }}>BILLING</span>
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            marginTop: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            Restaurant Management System
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: '32px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <Lock size={20} color="#e63946" />
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0
              }}>
                Staff Login
              </h2>
            </div>
            <p style={{
              color: '#6b7280',
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
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: pin.length > i ? '#e63946' : '#f3f4f6',
                  border: `2px solid ${pin.length > i ? '#e63946' : '#e5e7eb'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: pin.length > i ? '0 4px 12px rgba(230, 57, 70, 0.3)' : 'none'
                }}
              >
                {pin.length > i && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'white'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Keypad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === 'C') handleClear()
                  else if (key === '←') handleBackspace()
                  else handlePinChange(String(key))
                }}
                disabled={loading}
                style={{
                  height: '64px',
                  borderRadius: '16px',
                  border: 'none',
                  background: key === 'C' ? '#fef2f2' : key === '←' ? '#eff6ff' : '#f9fafb',
                  color: key === 'C' ? '#dc2626' : key === '←' ? '#2563eb' : '#1a1a2e',
                  fontSize: key === 'C' || key === '←' ? '20px' : '24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Demo PINs */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Demo PINs
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              {[
                { pin: '1234', role: 'Admin' },
                { pin: '5678', role: 'Manager' },
                { pin: '0000', role: 'Cashier' },
                { pin: '9999', role: 'Kitchen' }
              ].map(demo => (
                <button
                  key={demo.pin}
                  onClick={() => {
                    setPin(demo.pin)
                    setTimeout(() => handleLogin(demo.pin), 100)
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#4b5563',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {demo.role}: {demo.pin}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '48px',
          maxWidth: '900px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <feature.icon size={28} color="#e63946" />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: '4px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '13px',
          margin: 0
        }}>
          © 2024 TDG Billing • Restaurant Management System
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
