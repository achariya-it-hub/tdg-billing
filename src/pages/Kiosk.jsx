import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useMenuStore } from '../stores/menuStore'

const categoryIcons = {
  'Burgers': '🍔',
  'Chicken': '🍗',
  'Sides': '🍟',
  'Beverages': '🥤',
  'Desserts': '🍰',
  'Combos': '📦'
}

export default function Kiosk() {
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()
  const [cart, setCart] = useState([])
  const [step, setStep] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [orderNumber, setOrderNumber] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
    
    const resetTimer = setTimeout(() => {
      if (step === 0 || step === 5) return
      setStep(0)
      setCart([])
      setCustomerName('')
    }, 60000)
    
    return () => clearTimeout(resetTimer)
  }, [step])

  const addToCart = (item) => {
    const existing = cart.find(c => c.menuItemId === item.id)
    if (existing) {
      setCart(cart.map(c => 
        c.menuItemId === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        menuItemName: item.name,
        unitPrice: item.price,
        quantity: 1
      }])
    }
  }

  const updateQuantity = (menuItemId, delta) => {
    setCart(cart.map(item => {
      if (item.menuItemId !== menuItemId) return item
      const newQty = item.quantity + delta
      return newQty <= 0 ? null : { ...item, quantity: newQty }
    }).filter(Boolean))
  }

  const removeItem = (menuItemId) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId))
  }

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const getTax = () => getSubtotal() * 0.18
  const getTotal = () => getSubtotal() + getTax()

  const placeOrder = async (paymentMethod) => {
    setProcessing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'takeaway',
          source: 'kiosk',
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            quantity: item.quantity
          })),
          subtotal: getSubtotal(),
          tax: getTax(),
          total: getTotal(),
          customerName: customerName || 'Kiosk Customer',
          paymentMethod
        })
      })
      const data = await res.json()
      setOrderNumber(data.orderNumber)
      setStep(5)
      setShowPayment(false)
    } catch (err) {
      console.error('Order failed')
    }
    setProcessing(false)
  }

  const resetKiosk = () => {
    setStep(0)
    setCart([])
    setCustomerName('')
    setOrderNumber(null)
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 104px)',
        background: 'var(--bg-primary)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Step Indicator */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          background: 'var(--bg-card)'
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(s => (
          <div
            key={s}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: step >= s ? 'var(--accent-primary)' : 'var(--bg-secondary)'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {/* Welcome Screen */}
        {step === 0 && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '120px', marginBottom: '24px' }}>👋</div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '64px', marginBottom: '16px' }}>
              Welcome!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '20px' }}>
              Tap below to start your order
            </p>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '32px 64px',
                fontSize: '28px',
                fontFamily: 'Bebas Neue',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                letterSpacing: '2px'
              }}
            >
              START ORDER
            </button>
          </div>
        )}

        {/* Category Selection */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>
              What would you like?
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    fetchMenuItems(cat.id)
                    setStep(2)
                  }}
                  style={{
                    padding: '48px 24px',
                    background: cat.color,
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span style={{ fontSize: '64px' }}>{categoryIcons[cat.name] || '🍽️'}</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>{cat.name}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => { fetchMenuItems(); setStep(2) }}
                style={{
                  padding: '16px 32px',
                  background: 'var(--bg-card)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                View All Items
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>
              Select Your Items
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              {menuItems.filter(item => item.isAvailable).map(item => (
                <Card key={item.id} padding="none" style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '120px',
                      background: 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px'
                    }}
                  >
                    {categoryIcons[categories.find(c => c.id === item.categoryId)?.name] || '🍽️'}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{item.name}</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '12px' }}>
                      ₹{item.price}
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Plus size={20} />
                      Add to Cart
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cart Review */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>
              Review Your Order
            </h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {cart.map(item => (
                <div
                  key={item.menuItemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    marginBottom: '12px'
                  }}
                >
                  <span style={{ flex: 1, fontSize: '20px', fontWeight: 600 }}>{item.menuItemName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={20} />
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <span style={{ width: '100px', textAlign: 'right', fontSize: '20px', fontWeight: 700 }}>
                    ₹{item.unitPrice * item.quantity}
                  </span>
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '24px', padding: '24px', background: 'var(--bg-card)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Tax (18% GST)</span>
                  <span>₹{getTax().toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '28px',
                  fontWeight: 700,
                  paddingTop: '12px',
                  borderTop: '2px solid var(--border)'
                }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-primary)' }}>₹{getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Name */}
        {step === 4 && (
          <div
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '24px' }}>
              Your Name (Optional)
            </h2>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '24px',
                fontSize: '24px',
                textAlign: 'center',
                borderRadius: '16px',
                marginBottom: '24px'
              }}
            />
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              We'll call your name when your order is ready
            </p>
          </div>
        )}

        {/* Order Confirmation */}
        {step === 5 && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                background: 'var(--accent-success)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <Check size={64} color="white" />
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '8px' }}>
              Order Placed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your order number is
            </p>
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '96px',
                color: 'var(--accent-primary)',
                lineHeight: 1
              }}
            >
              #{orderNumber}
            </div>
            {customerName && (
              <p style={{ marginTop: '24px', fontSize: '20px' }}>
                We'll call <strong>{customerName}</strong> when it's ready
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div
        style={{
          padding: '24px',
          background: 'var(--bg-card)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}
      >
        {step > 0 && step < 5 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setStep(prev => prev - 1)}
            style={{ flex: 1 }}
          >
            Back
          </Button>
        )}
        
        {step === 2 && cart.length > 0 && (
          <button
            onClick={() => setStep(3)}
            style={{
              flex: 2,
              padding: '24px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '24px',
              fontFamily: 'Bebas Neue',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <ShoppingCart size={28} />
            View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}

        {step === 3 && cart.length > 0 && (
          <Button
            size="lg"
            onClick={() => setStep(4)}
            style={{ flex: 2 }}
          >
            Continue to Payment
          </Button>
        )}

        {step === 4 && (
          <Button
            size="lg"
            onClick={() => setShowPayment(true)}
            style={{ flex: 2 }}
          >
            Pay ₹{getTotal().toFixed(2)}
          </Button>
        )}

        {step === 5 && (
          <Button
            size="lg"
            onClick={resetKiosk}
            style={{ flex: 1 }}
          >
            New Order
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title="Select Payment Method"
        size="md"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { method: 'upi', icon: Smartphone, label: 'UPI' },
            { method: 'card', icon: CreditCard, label: 'Card' },
            { method: 'cash', icon: Banknote, label: 'Cash' },
            { method: 'wallet', icon: Smartphone, label: 'Wallet' }
          ].map(({ method, icon: Icon, label }) => (
            <button
              key={method}
              onClick={() => placeOrder(method)}
              disabled={processing}
              style={{
                padding: '32px',
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <Icon size={48} />
              <span style={{ fontSize: '20px', fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
