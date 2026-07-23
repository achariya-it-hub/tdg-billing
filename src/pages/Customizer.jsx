import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import { useOrderStore } from '../stores/orderStore'
import { useToast } from '../components/ui/Toaster'

export default function Customizer() {
  const navigate = useNavigate()
  const toast = useToast()
  const { addItem } = useOrderStore()

  const [protein, setProtein] = useState('Chicken')
  const [bread, setBread] = useState('Baked')
  const [spread, setSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion'])

  const proteins = ['Chicken', 'Paneer']
  const breads = ['Baked', 'Fried']
  const spreads = ['Hummus', 'Cheese', 'Tzatziki', 'Ricota']
  const sauces = ['Turkish Chill', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard']
  const veggies = ['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans']

  useEffect(() => {
    const customerToken = localStorage.getItem('customer_token')
    if (!customerToken) {
      toast.error('Please sign in or create an account to customize your gyros!')
      navigate('/login')
    }
  }, [navigate])

  const getBreadImage = (b) => {
    if (b === 'Baked') return '/baked.png'
    return '/fried.png'
  }
  const getSpreadImage = (s) => {
    if (s === 'Hummus') return '/hummus.png'
    if (s === 'Cheese') return '/cheese.png'
    if (s === 'Tzatziki') return '/tzatziki.png'
    return '/ricotta.png'
  }
  const getSauceImage = (s) => {
    if (s.toLowerCase().includes('turkish')) return '/turkish mayo.png'
    if (s.toLowerCase().includes('jalapeno cheese')) return '/jalapeno cheese.png'
    if (s.toLowerCase().includes('garlic')) return '/garlic mayo.png'
    if (s.toLowerCase().includes('spicy')) return '/turkish mayo.png'
    if (s.toLowerCase().includes('peri')) return '/peri peri.png'
    return '/honey mustard.png'
  }
  const getVeggieImage = (v) => {
    if (v.toLowerCase().includes('lettuce')) return '/lettuce.png'
    if (v.toLowerCase().includes('onion')) return '/onion.png'
    if (v.toLowerCase().includes('jalapeno')) return '/jalapenos.png'
    if (v.toLowerCase().includes('olive')) return '/olives.png'
    if (v.toLowerCase().includes('capsicum')) return '/bell peppers.png'
    if (v.toLowerCase().includes('tomato')) return '/tomatos.png'
    if (v.toLowerCase().includes('cucumber')) return '/cucumber.png'
    return '/beans.png'
  }

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

  const handleAddToCart = () => {
    // Generate a unique customization signature
    const customItem = {
      menuItemId: 'custom_gyro_' + Date.now(),
      menuItemName: `Custom Gyro Wrap`,
      unitPrice: 199,
      totalPrice: 199,
      quantity: 1,
      customization: {
        protein,
        bread,
        spread,
        sauces: selectedSauces,
        veggies: selectedVeggies
      }
    }
    
    addItem(customItem)
    toast.success('Custom Gyro Wrap added to cart!')
    
    // Redirect to home screen based on active subdomain
    if (window.location.hostname.includes('den.')) {
      navigate('/kiosk')
    } else {
      navigate('/')
    }
  }

  // Calculate crop coordinates
  const getSaucePosition = (s) => {
    if (s.toLowerCase().includes('turkish')) return '0% 0%';
    if (s.toLowerCase().includes('jalapeno cheese')) return '50% 0%';
    if (s.toLowerCase().includes('garlic')) return '100% 0%';
    if (s.toLowerCase().includes('spicy')) return '0% 100%';
    if (s.toLowerCase().includes('peri')) return '50% 100%';
    if (s.toLowerCase().includes('honey')) return '100% 100%';
    return 'center';
  }

  const getVeggiePosition = (v) => {
    if (v.toLowerCase().includes('lettuce')) return '0% 0%';
    if (v.toLowerCase().includes('onion')) return '33.3% 0%';
    if (v.toLowerCase().includes('jalapeno')) return '66.6% 0%';
    if (v.toLowerCase().includes('olive')) return '100% 0%';
    if (v.toLowerCase().includes('capsicum')) return '0% 100%';
    if (v.toLowerCase().includes('tomato')) return '33.3% 100%';
    if (v.toLowerCase().includes('cucumber')) return '66.6% 100%';
    if (v.toLowerCase().includes('bean')) return '100% 100%';
    return 'center';
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a24', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. Header Area */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: '#1a1a24', borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: '#ffc300', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px'
        }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', color: '#ffc300', margin: 0, letterSpacing: '1px' }}>
            BUILD YOUR GYRO
          </h1>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            Made fresh, made yours 🌯
          </p>
        </div>
      </header>

      {/* 2. Main Builder Container */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>
        
        {/* Stage 0: Protein selection */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ background: '#000', color: '#ffc300', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🥩 CHOOSE YOUR PROTEIN
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {proteins.map(p => {
              const isSel = protein === p
              return (
                <div key={p} onClick={() => setProtein(p)} style={{
                  cursor: 'pointer', borderRadius: '16px', border: `2.5px solid ${isSel ? '#ffc300' : 'rgba(255,255,255,0.06)'}`,
                  background: isSel ? 'rgba(255, 195, 0, 0.12)' : '#25262e', overflow: 'hidden', transition: 'all 0.2s', position: 'relative'
                }}>
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121216', padding: '12px' }}>
                    <img src={p === 'Chicken' ? '/crispy_chicken.png' : '/timeline_2009.png'} alt={p} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>{p}</div>
                  {isSel && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffc300', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}><Check size={14} strokeWidth={3} /></div>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Stage 1: Bread options */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ background: '#000', color: '#ffc300', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px' }}>
            🍞 CHOOSE YOUR BREAD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {breads.map(b => {
              const isSel = bread === b
              return (
                <div key={b} onClick={() => setBread(b)} style={{
                  cursor: 'pointer', borderRadius: '16px', border: `2.5px solid ${isSel ? '#ffc300' : 'rgba(255,255,255,0.06)'}`,
                  background: isSel ? 'rgba(255, 195, 0, 0.12)' : '#25262e', overflow: 'hidden', transition: 'all 0.2s', position: 'relative'
                }}>
                  <div style={{ height: '140px', overflow: 'hidden', background: '#121216' }}>
                    <img src={getBreadImage(b)} alt={b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>{b}</div>
                  {isSel && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffc300', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}><Check size={14} strokeWidth={3} /></div>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Stage 2: Spreads */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ background: '#000', color: '#ffc300', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🥣 CHOOSE YOUR SPREAD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {spreads.map(s => {
              const isSel = spread === s
              return (
                <div key={s} onClick={() => setSpread(s)} style={{
                  cursor: 'pointer', borderRadius: '16px', border: `2.5px solid ${isSel ? '#ffc300' : 'rgba(255,255,255,0.06)'}`,
                  background: isSel ? 'rgba(255, 195, 0, 0.12)' : '#25262e', overflow: 'hidden', transition: 'all 0.2s', position: 'relative'
                }}>
                  <div style={{ height: '120px', overflow: 'hidden', background: '#121216' }}>
                    <img src={getSpreadImage(s)} alt={s} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>{s}</div>
                  {isSel && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffc300', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}><Check size={14} strokeWidth={3} /></div>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Stage 3: Sauces */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ background: '#000', color: '#ffc300', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px' }}>
            🌶️ CHOOSE YOUR SAUCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {sauces.map(s => {
              const isSel = selectedSauces.includes(s)
              return (
                <div key={s} onClick={() => toggleSauce(s)} style={{
                  cursor: 'pointer', borderRadius: '16px', border: `2.5px solid ${isSel ? '#ffc300' : 'rgba(255,255,255,0.06)'}`,
                  background: isSel ? 'rgba(255, 195, 0, 0.12)' : '#25262e', overflow: 'hidden', transition: 'all 0.2s', position: 'relative'
                }}>
                  <div style={{ height: '120px', overflow: 'hidden', background: '#121216' }}>
                    <img src={getSauceImage(s)} alt={s} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>{s}</div>
                  {isSel && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffc300', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}><Check size={14} strokeWidth={3} /></div>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Stage 4: Veggies */}
        <section style={{ marginBottom: '120px' }}>
          <div style={{ background: '#000', color: '#ffc300', padding: '12px 18px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🥗 CHOOSE YOUR VEGGIES</span>
            <span style={{ fontSize: '10px', background: '#e63946', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>MULTI</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {veggies.map(v => {
              const isSel = selectedVeggies.includes(v)
              return (
                <div key={v} onClick={() => toggleVeggie(v)} style={{
                  cursor: 'pointer', borderRadius: '16px', border: `2.5px solid ${isSel ? '#ffc300' : 'rgba(255,255,255,0.06)'}`,
                  background: isSel ? 'rgba(255, 195, 0, 0.12)' : '#25262e', overflow: 'hidden', transition: 'all 0.2s', position: 'relative'
                }}>
                  <div style={{ height: '120px', overflow: 'hidden', background: '#121216' }}>
                    <img src={getVeggieImage(v)} alt={v} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>{v}</div>
                  {isSel && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffc300', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}><Check size={14} strokeWidth={3} /></div>}
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* 3. Bottom Summary & Add to Cart Floating Panel */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#121216', borderTop: '2px solid rgba(255, 215, 0, 0.2)',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.4)', zIndex: 10
      }}>
        <div style={{ flex: 1, marginRight: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffc300', marginBottom: '2px' }}>Custom Gyro Wrap</div>
          <div style={{ fontSize: '11px', color: '#aaa', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
            {protein} • {bread} Bread • {spread} spread • Sauces: {selectedSauces.join(', ') || 'None'} • Veggies: {selectedVeggies.join(', ') || 'None'}
          </div>
        </div>

        <button onClick={handleAddToCart} style={{
          backgroundColor: '#ffc300', color: '#000', border: 'none', borderRadius: '12px',
          padding: '16px 28px', fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center',
          gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 195, 0, 0.3)'
        }}>
          ADD TO CART (₹199) <ShoppingBag size={18} />
        </button>
      </footer>

    </div>
  )
}
