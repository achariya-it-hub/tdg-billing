import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Check, ArrowRight } from 'lucide-react'
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
  const getTax = () => getSubtotal() * 0.05
  const getTotal = () => getSubtotal() + getTax()

  const placeOrder = async (paymentMethod) => {
    setProcessing(true)
    try {
      // Demo mode - create local order
      const orderNumber = Math.floor(Math.random() * 9000) + 1000
      setOrderNumber(orderNumber)
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
            <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
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

            {/* Custom Choose Your Own Gyros Kiosk builder widget */}
            <div style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: '24px',
              padding: '32px 24px',
              marginTop: '40px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                🌯 CREATE YOUR OWN GYROS
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px auto' }}>
                Build your customized wrap using fresh proteins, signature spreads, sauces, and toppings.
              </p>

              <Link
                to="/customizer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 36px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                START CUSTOMIZING NOW <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', marginBottom: '24px', textAlign: 'center' }}>
              Select Other Items
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
                  <span>CGST (2.5%)</span>
                  <span>₹{(getTax() / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>SGST (2.5%)</span>
                  <span>₹{(getTax() / 2).toFixed(2)}</span>
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

function KioskGyroBuilder({ onAddCustomGyro }) {
  const [step, setStep] = useState(0)
  const [protein, setProtein] = useState('Chicken')
  const [bread, setBread] = useState('Baked')
  const [spread, setSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion'])
  const [showToast, setShowToast] = useState(false)

  const proteins = ['Chicken', 'Paneer']
  const breads = ['Baked', 'Fried']
  const spreads = ['Hummus', 'Cheese', 'Tzatziki', 'Ricota']
  const sauces = ['Turkish Chill', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard']
  const veggies = ['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans']

  const toggleSauce = (s) => {
    if (selectedSauces.includes(s)) {
      setSelectedSauces(selectedSauces.filter(item => item !== s))
    } else {
      setSelectedSauces([...selectedSauces, s])
    }
  }

  const toggleVeggie = (v) => {
    if (selectedVeggies.includes(v)) {
      setSelectedVeggies(selectedVeggies.filter(item => item !== v))
    } else {
      setSelectedVeggies([...selectedVeggies, v])
    }
  }

  const handleAdd = () => {
    onAddCustomGyro({
      name: `Custom Gyro (${protein}, ${bread})`,
      config: { protein, bread, spread, sauces: selectedSauces, veggies: selectedVeggies }
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)

    // Reset back to initial state
    setStep(0)
    setProtein('Chicken')
    setBread('Baked')
    setSpread('Tzatziki')
    setSelectedSauces(['Garlic Mayo'])
    setSelectedVeggies(['Lettuce', 'Onion'])
  }

  const stepTitles = [
    'Start with your Protein',
    'Choose Your Bread',
    'Choose Your Spread',
    'Choose Your Sauces',
    'Choose Your Veggies'
  ]

  const getProteinImage = (p) => p === 'Chicken' ? '/crispy_chicken.png' : '/timeline_2009.png'
  const getBreadImage = (b) => b === 'Baked' ? '/hero_gyro_wrap.png' : '/hero_greek_gyro.png'
  const getSpreadImage = (s) => {
    if (s === 'Hummus') return '/hummus.png'
    if (s === 'Cheese') return '/cheese.png'
    if (s === 'Tzatziki') return '/tzatziki.png'
    return '/ricotta.png'
  }
  const getSauceImage = (s) => '/sauces_composite.jpg'
  const getVeggieImage = (v) => '/veggies_composite.jpg'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Step Indicator Header */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {stepTitles.map((title, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              onClick={() => setStep(idx)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: step === idx ? 'var(--accent-primary)' : idx < step ? '#10b981' : 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {idx + 1}
            </div>
            {idx < stepTitles.length - 1 && (
              <div style={{ width: '40px', height: '2px', backgroundColor: idx < step ? '#10b981' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
        {stepTitles[step]}
      </h4>

      {/* Step 0: Protein */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {proteins.map(p => (
            <div
              key={p}
              onClick={() => setProtein(p)}
              style={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: protein === p ? 'var(--accent-primary)' : 'var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-elevated)',
                transform: protein === p ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ height: '140px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                <img src={getProteinImage(p)} alt={p} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
              </div>
              <div style={{ padding: '12px', textAlign: 'center', background: protein === p ? 'var(--accent-primary-light)' : 'transparent' }}>
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{p === 'Chicken' ? '🍗 Chicken' : '🧀 Paneer'}</h5>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Bread */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {breads.map(b => (
            <div
              key={b}
              onClick={() => setBread(b)}
              style={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: bread === b ? 'var(--accent-primary)' : 'var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-elevated)',
                transform: bread === b ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ height: '140px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                <img src={getBreadImage(b)} alt={b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px', textAlign: 'center', background: bread === b ? 'var(--accent-primary-light)' : 'transparent' }}>
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{b} Bread</h5>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Spread */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {spreads.map(s => (
            <div
              key={s}
              onClick={() => setSpread(s)}
              style={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: spread === s ? 'var(--accent-primary)' : 'var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-elevated)',
                transform: spread === s ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ height: '120px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                <img src={getSpreadImage(s)} alt={s} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px', textAlign: 'center', background: spread === s ? 'var(--accent-primary-light)' : 'transparent' }}>
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{s}</h5>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Sauces */}
      {step === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {sauces.map(s => {
            const isSelected = selectedSauces.includes(s)
            let position = 'center';
            if (s.toLowerCase().includes('turkish')) position = '0% 0%';
            if (s.toLowerCase().includes('jalapeno cheese')) position = '50% 0%';
            if (s.toLowerCase().includes('garlic')) position = '100% 0%';
            if (s.toLowerCase().includes('spicy')) position = '0% 100%';
            if (s.toLowerCase().includes('peri')) position = '50% 100%';
            if (s.toLowerCase().includes('honey')) position = '100% 100%';

            return (
              <div
                key={s}
                onClick={() => toggleSauce(s)}
                style={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? '#e63946' : 'var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-elevated)',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ height: '100px', width: '100%', overflow: 'hidden', background: '#fff' }}>
                  <img src={getSauceImage(s)} alt={s} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position }} />
                </div>
                <div style={{ padding: '10px', textAlign: 'center', background: isSelected ? 'rgba(230,57,70,0.1)' : 'transparent' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{s}</h5>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Step 4: Veggies */}
      {step === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {veggies.map(v => {
            const isSelected = selectedVeggies.includes(v)
            let position = 'center';
            if (v.toLowerCase().includes('lettuce')) position = '0% 0%';
            if (v.toLowerCase().includes('onion')) position = '33.3% 0%';
            if (v.toLowerCase().includes('jalapeno')) position = '66.6% 0%';
            if (v.toLowerCase().includes('olive')) position = '100% 0%';
            if (v.toLowerCase().includes('capsicum')) position = '0% 100%';
            if (v.toLowerCase().includes('tomato')) position = '33.3% 100%';
            if (v.toLowerCase().includes('cucumber')) position = '66.6% 100%';
            if (v.toLowerCase().includes('bean')) position = '100% 100%';

            return (
              <div
                key={v}
                onClick={() => toggleVeggie(v)}
                style={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? '#10b981' : 'var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-elevated)',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ height: '90px', width: '100%', overflow: 'hidden', background: '#fff' }}>
                  <img src={getVeggieImage(v)} alt={v} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position }} />
                </div>
                <div style={{ padding: '10px', textAlign: 'center', background: isSelected ? 'rgba(16,185,129,0.1)' : 'transparent' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{v}</h5>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stepper Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '12px' }}>
        <button 
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          disabled={step === 0}
          style={{
            padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)',
            backgroundColor: 'transparent', color: step === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 700,
            cursor: step === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Back
        </button>
        
        {step < stepTitles.length - 1 ? (
          <button 
            onClick={() => setStep(prev => prev + 1)}
            style={{
              padding: '12px 28px', borderRadius: '8px', border: 'none',
              backgroundColor: 'var(--accent-primary)', color: '#fff', fontWeight: 800, cursor: 'pointer'
            }}
          >
            Next Stage →
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Summary Box & Add to Cart Action */}
      <div style={{
        marginTop: '12px',
        padding: '18px',
        background: 'var(--bg-elevated)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>Custom Gyro Wrap (₹199)</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {protein} • {bread} Bread • {spread} spread • Sauces: {selectedSauces.join(', ') || 'None'} • Veggies: {selectedVeggies.join(', ') || 'None'}
          </div>
        </div>

        <button
          onClick={handleAdd}
          style={{
            padding: '16px 28px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          Add Custom Gyro to Cart 🛒
        </button>
      </div>

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent-success)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          Custom Gyro added to order!
        </div>
      )}
    </div>
  )
}
