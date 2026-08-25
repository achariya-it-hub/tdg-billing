import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, Smartphone, Check, Search, Sparkles, X, ChevronRight, User, Banknote } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { useMenuStore } from '../stores/menuStore'
import API_BASE from '../lib/apiConfig'

const getItemImage = (item) => {
  if (item.image) return item.image
  const name = (item.name || '').toLowerCase()
  if (name.includes('combo') || name.includes('feast') || name.includes('party') || name.includes('double crunch') || name.includes('super 5')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('gyro') || name.includes('wrap')) {
    return 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('wing') || name.includes('strip') || name.includes('leg') || name.includes('thigh') || name.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('fry') || name.includes('fries') || name.includes('side')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('pepsi') || name.includes('coca') || name.includes('sprite') || name.includes('drink') || name.includes('tea') || name.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('brownie') || name.includes('shake') || name.includes('cake') || name.includes('dessert')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
}

export default function Kiosk() {
  const location = useLocation()
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()

  // Table / Kiosk Order detection
  const queryParams = new URLSearchParams(location.search)
  const urlTable = queryParams.get('table') || queryParams.get('t') || ''
  const tableParam = urlTable ? (urlTable.toLowerCase().includes('table') ? urlTable : `Table ${urlTable}`) : 'Kiosk Orders'

  const [cart, setCart] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [tableNumber] = useState(tableParam)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerDiscountPct, setCustomerDiscountPct] = useState(0)
  const [discountStatusMsg, setDiscountStatusMsg] = useState('')
  const [orderNumber, setOrderNumber] = useState(null)
  
  // Modals & Flow State
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [customizingItem, setCustomizingItem] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Single & Dual Gyro Customizer State
  const [selectedProtein, setSelectedProtein] = useState('Chicken')
  const [selectedGyroFlavor, setSelectedGyroFlavor] = useState('Spicy')
  const [selectedBread, setSelectedBread] = useState('Baked')
  const [selectedIceTeaFlavor, setSelectedIceTeaFlavor] = useState('Peach')
  const [selectedSpread, setSelectedSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion'])
  const [gyroNotes, setGyroNotes] = useState('')

  const [selectedGyro1Protein, setSelectedGyro1Protein] = useState('Chicken')
  const [selectedGyro1Bread, setSelectedGyro1Bread] = useState('Baked')
  const [selectedGyro1Flavor, setSelectedGyro1Flavor] = useState('Spicy')
  const [selectedGyro1Spread, setSelectedGyro1Spread] = useState('Tzatziki')

  const [selectedGyro2Protein, setSelectedGyro2Protein] = useState('Paneer')
  const [selectedGyro2Bread, setSelectedGyro2Bread] = useState('Baked')
  const [selectedGyro2Flavor, setSelectedGyro2Flavor] = useState('Spicy')
  const [selectedGyro2Spread, setSelectedGyro2Spread] = useState('Tzatziki')

  const [selectedDrink1, setSelectedDrink1] = useState('Coca-Cola')
  const [selectedDrink2, setSelectedDrink2] = useState('Sprite')
  const [selectedDrink3, setSelectedDrink3] = useState('Fanta')
  const [selectedDrink4, setSelectedDrink4] = useState('Peach Ice Tea')
  const [selectedDrink5, setSelectedDrink5] = useState('Lime Ice Tea')

  const [selectedDip1, setSelectedDip1] = useState('Garlic Mayo Dip')
  const [selectedDip2, setSelectedDip2] = useState('Spicy Mayo Dip')
  const [selectedDip3, setSelectedDip3] = useState('Tzatziki Dip')

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  const getMealDrinkCount = (itemName) => {
    const name = (itemName || '').toLowerCase()
    if (name.includes('den\'s party') || name.includes('party meal')) return 3
    if (name.includes('super 5')) return 5
    if (name.includes('double crunch') || name.includes('duo gyro') || name.includes('mega feast')) return 2
    if (name.includes('meal') || name.includes('box') || name.includes('feast') || name.includes('bucket') || name.includes('combo')) return 1
    return 0
  }

  const getMealDipCount = (itemName) => {
    const name = (itemName || '').toLowerCase()
    if (name.includes('mega feast')) return 3
    return 0
  }

  const isCustomizable = (item) => {
    if (!item) return false
    const cat = categories.find(c => c.id === item.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    const itemName = (item?.name || '').toLowerCase()
    return (
      catName.includes('gyro') || itemName.includes('gyro') ||
      catName.includes('meal') || catName.includes('combo') ||
      itemName.includes('meal') || itemName.includes('box') ||
      itemName.includes('feast') || itemName.includes('bucket') ||
      itemName.includes('rice') || itemName.includes('salad') ||
      catName.includes('fries') || itemName.includes('fries') || itemName.includes('loaded') ||
      itemName.includes('ice tea') || itemName.includes('iced tea')
    )
  }

  const isDualGyroCombo = (item) => {
    if (!item) return false
    const name = (item.name || '').toLowerCase()
    return (
      name.includes('duo') ||
      name.includes('double crunch') ||
      name.includes('party meal') ||
      name.includes('mega feast')
    )
  }

  const handleItemClick = (item) => {
    if (!item || item.isAvailable === false) return
    if (isCustomizable(item)) {
      setCustomizingItem(item)
      setSelectedProtein('Chicken')
      setSelectedGyroFlavor('Spicy')
      setSelectedBread('Baked')
      const itemNameLower = (item.name || '').toLowerCase()
      if (itemNameLower.includes('lime')) {
        setSelectedIceTeaFlavor('Lime')
      } else {
        setSelectedIceTeaFlavor('Peach')
      }
      setSelectedSpread('Tzatziki')
      setSelectedSauces(['Garlic Mayo'])
      setSelectedVeggies(['Lettuce', 'Onion'])

      setSelectedDrink1('Coca-Cola')
      setSelectedDrink2('Sprite')
      setSelectedDrink3('Fanta')
      setSelectedDrink4('Peach Ice Tea')
      setSelectedDrink5('Lime Ice Tea')

      setSelectedDip1('Garlic Mayo Dip')
      setSelectedDip2('Spicy Mayo Dip')
      setSelectedDip3('Tzatziki Dip')

      setSelectedGyro1Protein('Chicken')
      setSelectedGyro1Bread('Baked')
      setSelectedGyro1Flavor('Spicy')
      setSelectedGyro1Spread('Tzatziki')

      setSelectedGyro2Protein('Paneer')
      setSelectedGyro2Bread('Baked')
      setSelectedGyro2Flavor('Spicy')
      setSelectedGyro2Spread('Tzatziki')

      setGyroNotes('')
    } else {
      addToCartDirect(item)
    }
  }

  const addToCartDirect = (item, customDetails = null, overrideName = null) => {
    const cartItemId = customDetails ? `${item.id}_${Date.now()}` : item.id
    const existing = cart.find(c => c.cartItemId === cartItemId || (!customDetails && c.menuItemId === item.id))

    if (existing && !customDetails) {
      setCart(cart.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, {
        cartItemId: cartItemId,
        menuItemId: item.id,
        menuItemName: overrideName || item.name,
        unitPrice: item.price,
        quantity: 1,
        image: getItemImage(item),
        customization: customDetails
      }])
    }
  }

  const confirmCustomization = () => {
    if (!customizingItem) return
    const cat = categories.find(c => c.id === customizingItem.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    const itemName = (customizingItem?.name || '').toLowerCase()

    const isDualCombo = isDualGyroCombo(customizingItem)
    const isRiceItem = itemName.includes('rice')
    const isSuper5 = itemName.includes('super 5')
    const isLoadedFries = itemName.includes('loaded')
    const isIceTea = itemName.includes('ice tea') || itemName.includes('iced tea')
    const hasGyro = (catName.includes('gyro') || itemName.includes('gyro') || itemName.includes('feast') || itemName.includes('meal')) && !isRiceItem && !isSuper5 && !isLoadedFries && !isIceTea

    let formattedName = customizingItem.name
    if (isLoadedFries) {
      formattedName = `Loaded Fries (${selectedProtein})`
    } else if (isIceTea) {
      const size = itemName.includes('large') ? 'Large' : 'Regular'
      formattedName = `${selectedIceTeaFlavor} Ice Tea (${size})`
    }

    const drinkCount = getMealDrinkCount(customizingItem.name)
    const dipCount = getMealDipCount(customizingItem.name)

    let drinkSummary = ''
    if (drinkCount === 1) drinkSummary = selectedDrink1
    else if (drinkCount === 2) drinkSummary = `${selectedDrink1}, ${selectedDrink2}`
    else if (drinkCount === 3) drinkSummary = `${selectedDrink1}, ${selectedDrink2}, ${selectedDrink3}`
    else if (drinkCount === 5) drinkSummary = `${selectedDrink1}, ${selectedDrink2}, ${selectedDrink3}, ${selectedDrink4}, ${selectedDrink5}`

    let dipSummary = ''
    if (dipCount === 3) dipSummary = `${selectedDip1}, ${selectedDip2}, ${selectedDip3}`

    let customization
    if (isDualCombo) {
      customization = {
        gyro1: `Gyro 1: ${selectedGyro1Protein} (${selectedGyro1Flavor}, ${selectedGyro1Spread} Spread, ${selectedGyro1Bread} Pita)`,
        gyro2: `Gyro 2: ${selectedGyro2Protein} (${selectedGyro2Flavor}, ${selectedGyro2Spread} Spread, ${selectedGyro2Bread} Pita)`,
        ...(drinkSummary ? { drink: drinkSummary } : {}),
        ...(dipSummary ? { dips: dipSummary } : {}),
        notes: gyroNotes
      }
    } else if (isIceTea) {
      customization = {
        flavor: selectedIceTeaFlavor,
        notes: gyroNotes
      }
    } else {
      customization = {
        ...(hasGyro ? {
          protein: selectedProtein,
          flavor: selectedGyroFlavor,
          bread: selectedBread,
          spread: selectedSpread,
          sauces: selectedSauces.join(', ') || 'None',
          veggies: selectedVeggies.join(', ') || 'None'
        } : {}),
        ...((hasGyro || isRiceItem || isLoadedFries) ? { protein: selectedProtein } : {}),
        ...(drinkSummary ? { drink: drinkSummary } : {}),
        ...(dipSummary ? { dips: dipSummary } : {}),
        notes: gyroNotes
      }
    }

    addToCartDirect(customizingItem, customization, formattedName)
    setCustomizingItem(null)
  }

  const updateQuantity = (targetId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId !== targetId && item.menuItemId !== targetId) return item
      const newQty = item.quantity + delta
      return newQty <= 0 ? null : { ...item, quantity: newQty }
    }).filter(Boolean))
  }

  const removeItem = (targetId) => {
    setCart(cart.filter(item => item.cartItemId !== targetId && item.menuItemId !== targetId))
  }

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const getDiscountAmount = () => customerDiscountPct > 0 ? Math.round(getSubtotal() * (customerDiscountPct / 100)) : 0
  const getNetSubtotal = () => getSubtotal() - getDiscountAmount()
  const getTax = () => getNetSubtotal() * 0.05
  const getTotal = () => getNetSubtotal() + getTax()
  const getTotalItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrder = async (selectedMethod = 'upi') => {
    if (cart.length === 0) return
    if (!customerName.trim()) { alert('Please enter your Full Name'); return }
    if (customerPhone.replace(/\D/g, '').length < 8) { alert('Please enter a valid 10-digit Mobile Phone Number'); return }

    setProcessing(true)
    try {
      const subtotal = getSubtotal()
      const tax = getTax()
      const total = getTotal()
      const now = new Date().toISOString()
      const isPaid = selectedMethod === 'upi' || selectedMethod === 'card' || selectedMethod === 'cashfree'

      const orderPayload = {
        type: tableNumber && tableNumber !== 'Kiosk Orders' ? 'dine-in' : 'takeaway',
        source: 'qr_self_order',
        tableNumber: tableNumber || 'Kiosk Orders',
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ''),
        customerDiscountPct: customerDiscountPct || 0,
        paymentMethod: selectedMethod,
        status: isPaid ? 'completed' : 'pending',
        paymentStatus: isPaid ? 'paid' : 'pending',
        settleDirectly: isPaid,
        paidAt: isPaid ? now : null,
        subtotal: subtotal,
        tax: tax,
        total: total,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          customization: item.customization || null
        }))
      }

      const res = await fetch(`${API_BASE}/api/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      const data = await res.json()
      if (res.ok && (data.orderNumber || data.id)) {
        setOrderNumber(data.orderNumber || data.id)
        setOrderSuccess(true)
        setShowPaymentModal(false)
        setShowCartDrawer(false)
      } else {
        alert(data.error || 'Failed to place self order. Please try again.')
      }
    } catch (err) {
      console.error('Order placement failed:', err)
      alert('Network error while placing order.')
    }
    setProcessing(false)
  }

  const resetOrder = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setCustomerDiscountPct(0)
    setDiscountStatusMsg('')
    setOrderNumber(null)
    setOrderSuccess(false)
  }

  // Filtered menu items
  const filteredItems = menuItems.filter(item => {
    if (item.isAvailable === false) return false
    const matchesCat = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId
    const matchesQuery = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#18191c',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffd100, #ffcc00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(255,209,0,0.4)', marginBottom: '20px'
        }}>
          <Check size={48} color="#18191c" />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', color: '#ffffff' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#ffd100', fontSize: '15px', fontWeight: 700, marginBottom: '24px' }}>
          Thank you {customerName}! Your order is sent to our kitchen.
        </p>

        {/* Token Card */}
        <div style={{
          background: '#232428',
          border: '2px solid #ffd100',
          borderRadius: '24px',
          padding: '28px 40px',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          width: '100%', maxWidth: '340px', boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '12px', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '6px' }}>
            YOUR ORDER TOKEN
          </div>
          <div style={{ fontSize: '64px', fontWeight: 900, color: '#e63946', lineHeight: 1 }}>
            #{orderNumber}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#ffffff', background: '#2a2b2e', padding: '6px 14px', borderRadius: '20px', fontWeight: 700 }}>
            📍 {tableNumber} • {cart.length} Items
          </div>
        </div>

        <button
          onClick={resetOrder}
          style={{
            padding: '14px 36px', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #ffd100, #ffcc00)',
            color: '#18191c', fontWeight: 900, fontSize: '16px', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,209,0,0.3)', transition: 'all 0.2s'
          }}
        >
          Place Another Order
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#18191c',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '120px'
    }}>
      {/* Brand Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(24, 25, 28, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 209, 0, 0.2)',
        padding: '12px 16px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* TDG Official Web Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/tdg-logo.png"
              alt="Tendens Gyros TDG Logo"
              style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Kiosk Orders Badge */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              background: '#232428',
              border: '1.5px solid #ffd100',
              color: '#ffd100', padding: '6px 14px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              📍 {tableNumber}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '1200px', margin: '10px auto 0 auto', position: 'relative' }}>
          <Search size={18} color="#ffd100" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Gyros, Combos, Fries, Beverages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px',
              background: '#232428', border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ffd100', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills Bar (100% Mobile Friendly & Visible) */}
        <div style={{
          maxWidth: '1200px', margin: '12px auto 0 auto',
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button
            onClick={() => setSelectedCategoryId('all')}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              background: selectedCategoryId === 'all' ? '#ffd100' : '#2a2b2e',
              color: selectedCategoryId === 'all' ? '#18191c' : '#ffffff',
              fontWeight: 900, fontSize: '13px', cursor: 'pointer',
              boxShadow: selectedCategoryId === 'all' ? '0 4px 12px rgba(255,209,0,0.3)' : 'none', transition: 'all 0.2s'
            }}
          >
            🔥 All Items
          </button>
          {categories.map(cat => {
            const isSel = selectedCategoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  background: isSel ? '#ffd100' : '#2a2b2e',
                  color: isSel ? '#18191c' : '#ffffff',
                  fontWeight: 900, fontSize: '13px', cursor: 'pointer',
                  boxShadow: isSel ? '0 4px 12px rgba(255,209,0,0.3)' : 'none', transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Food Cards Grid */}
      <main style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 14px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#a0a0a0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>No matching items found</h3>
            <p style={{ fontSize: '13px' }}>Try searching for another item or category</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: '14px'
          }}>
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.menuItemId === item.id)
              const qty = inCart ? inCart.quantity : 0
              const isVeg = (item.name || '').toLowerCase().includes('paneer') || (item.name || '').toLowerCase().includes('veg')
              const isCustom = isCustomizable(item)
              const imgUrl = getItemImage(item)

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#232428',
                    border: '1px solid rgba(255, 209, 0, 0.15)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Image Header Container (Fitted Full Image) */}
                  <div style={{ position: 'relative', height: '115px', width: '100%', overflow: 'hidden', background: '#18191c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={imgUrl}
                      alt={item.name}
                      style={{
                        width: '100%', height: '100%', objectFit: 'contain', padding: '4px', boxSizing: 'border-box'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    
                    {/* Dark subtle gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(24,25,28,0.7) 100%)', pointerEvents: 'none' }} />

                    {/* Veg/Non-Veg Badge */}
                    <div style={{
                      position: 'absolute', top: '6px', left: '6px',
                      background: 'rgba(24,25,28,0.9)', backdropFilter: 'blur(8px)',
                      padding: '3px 7px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 900,
                      color: isVeg ? '#4ade80' : '#f87171', border: `1px solid ${isVeg ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isVeg ? '#22c55e' : '#ef4444' }} />
                      {isVeg ? 'VEG' : 'NON-VEG'}
                    </div>

                    {/* Customizable Badge */}
                    {isCustom && (
                      <div style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'linear-gradient(135deg, #e63946, #c1121f)',
                        color: 'white', padding: '3px 7px', borderRadius: '8px',
                        fontSize: '9px', fontWeight: 900, boxShadow: '0 2px 6px rgba(230,57,70,0.4)',
                        display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        <Sparkles size={10} /> CUSTOM
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '10px 12px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ fontSize: '10.5px', color: '#a0a0a0', margin: '0 0 6px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Action Counter */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px rgba(255,255,255,0.08) solid' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffd100' }}>
                          ₹{item.price}
                        </div>
                      </div>

                      {qty > 0 ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: '#2a2b2e', borderRadius: '8px', padding: '2px 5px',
                          border: '1px solid rgba(255,209,0,0.3)'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#e63946', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Minus size={11} />
                          </button>
                          <span style={{ fontWeight: 900, fontSize: '12.5px', minWidth: '14px', textAlign: 'center', color: '#ffffff' }}>{qty}</span>
                          <button
                            onClick={() => isCustom ? handleItemClick(item) : addToCartDirect(item)}
                            style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#ffd100', border: 'none', color: '#18191c', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleItemClick(item)}
                          style={{
                            padding: '5px 12px', borderRadius: '8px', border: 'none',
                            background: isCustom ? 'linear-gradient(135deg, #e63946, #c1121f)' : '#ffd100',
                            color: isCustom ? '#ffffff' : '#18191c', fontWeight: 900, fontSize: '11.5px', cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.2)', transition: 'all 0.2s'
                          }}
                        >
                          {isCustom ? 'CUSTOMIZE' : '+ ADD'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Bar (Bottom) */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: '540px', zIndex: 100
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffd100 0%, #ffcc00 100%)',
            borderRadius: '18px', padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(255,209,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1.5px solid #ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#18191c', padding: '9px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShoppingCart size={20} color="#ffd100" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#18191c', fontWeight: 800 }}>
                  {getTotalItemCount()} Item{getTotalItemCount() > 1 ? 's' : ''} in Cart
                </div>
                <div style={{ fontSize: '19px', fontWeight: 900, color: '#18191c' }}>
                  ₹{getTotal().toFixed(0)} <span style={{ fontSize: '10px', fontWeight: 700, color: '#4a4000' }}>(incl. GST)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              style={{
                background: '#18191c', color: '#ffd100', border: 'none',
                padding: '10px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '13.5px',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              View Cart & Pay <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      <Modal isOpen={showCartDrawer} onClose={() => setShowCartDrawer(false)} title="🛒 Your Cart Items" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{
                background: '#f8fafc', padding: '12px', borderRadius: '14px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <img src={item.image} alt={item.menuItemName} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>{item.menuItemName}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#e63946' }}>₹{item.unitPrice}</div>
                  {item.customization && (
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '3px' }}>
                      {item.customization.gyro1 && <div>• {item.customization.gyro1}</div>}
                      {item.customization.gyro2 && <div>• {item.customization.gyro2}</div>}
                      {item.customization.protein && <div>• Protein: {item.customization.protein}</div>}
                      {item.customization.flavor && <div>• Flavor: {item.customization.flavor}</div>}
                      {item.customization.bread && <div>• Bread: {item.customization.bread}</div>}
                      {item.customization.spread && <div>• Spread: {item.customization.spread}</div>}
                      {item.customization.sauces && <div>• Sauces: {item.customization.sauces}</div>}
                      {item.customization.veggies && <div>• Veggies: {item.customization.veggies}</div>}
                      {item.customization.drink && <div>• 🥤 Drink: {item.customization.drink}</div>}
                      {item.customization.dips && <div>• 🧄 Dips: {item.customization.dips}</div>}
                      {item.customization.notes && <div>• Notes: {item.customization.notes}</div>}
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '4px 6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <button onClick={() => updateQuantity(item.cartItemId || item.menuItemId, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Minus size={13} color="#ef4444" />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId || item.menuItemId, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Plus size={13} color="#10b981" />
                  </button>
                </div>

                <div style={{ fontWeight: 900, fontSize: '14px', color: '#0f172a', minWidth: '50px', textAlign: 'right' }}>
                  ₹{item.unitPrice * item.quantity}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeItem(item.cartItemId || item.menuItemId)}
                  style={{
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    borderRadius: '8px', padding: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Remove Item from Cart"
                >
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
            ))}
          </div>

          {/* Guest Info Input */}
          <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#e63946" /> Enter Guest Information
            </div>

            {discountStatusMsg && (
              <div style={{
                background: customerDiscountPct > 0 ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${customerDiscountPct > 0 ? '#a7f3d0' : '#fde68a'}`,
                color: customerDiscountPct > 0 ? '#047857' : '#b45309',
                padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: '10px'
              }}>
                {discountStatusMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Mobile Phone *</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => {
                    const p = e.target.value.replace(/\D/g, '')
                    setCustomerPhone(p)
                    if (p.length >= 10) {
                      fetch(`${API_BASE}/api/customers/check-discount?phone=${p}`)
                        .then(r => r.json())
                        .then(data => {
                          if (data.offerRedeemed) {
                            setCustomerDiscountPct(0)
                            setDiscountStatusMsg('⚠️ Offer Already Redeemed for this phone number')
                          } else if (data.hasDiscount && data.discountPct > 0) {
                            setCustomerDiscountPct(data.discountPct)
                            setDiscountStatusMsg(`👑 ${data.discountReason || `VIP ${data.discountPct}% OFF Discount Auto-Applied!`}`)
                            if (data.customerName && !['customer', 'vip customer', 'vip 50% customer', 'mobile app user', 'den member', 'new customer', 'guest', 'user'].includes(String(data.customerName).trim().toLowerCase())) {
                              setCustomerName(data.customerName)
                            }
                          } else {
                            setCustomerDiscountPct(0); setDiscountStatusMsg('')
                          }
                        }).catch(() => {})
                    } else {
                      setCustomerDiscountPct(0); setDiscountStatusMsg('')
                    }
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Subtotal & Bill Breakdown */}
          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '4px' }}>
              <span>Items Subtotal</span>
              <span>₹{getSubtotal().toFixed(2)}</span>
            </div>
            {customerDiscountPct > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#dc2626', fontWeight: 700, marginBottom: '4px' }}>
                <span>VIP Discount ({customerDiscountPct}%)</span>
                <span>- ₹{getDiscountAmount().toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '6px' }}>
              <span>GST (5%)</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
              <span>Total Payable</span>
              <span style={{ color: '#e63946' }}>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!customerName.trim()) { alert('Please enter your Full Name'); return }
              if (customerPhone.replace(/\D/g, '').length < 8) { alert('Please enter a valid 10-digit Mobile Phone Number'); return }
              setShowPaymentModal(true)
            }}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: '#e63946', color: 'white', fontWeight: 900, fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(230,57,70,0.3)'
            }}
          >
            Proceed to Payment (₹{getTotal().toFixed(2)}) →
          </button>
        </div>
      </Modal>

      {/* Instant UPI Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="💳 Select Payment Method & Place Order" size="md">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
            Total Amount: <strong style={{ fontSize: '20px', color: '#e63946' }}>₹{getTotal().toFixed(2)}</strong>
          </div>

          {/* Instant UPI QR */}
          <div style={{ background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#166534', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Smartphone size={18} color="#10b981" /> Instant Scan & Pay via UPI (GPay / PhonePe)
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>
              Scan with any UPI App on your phone to complete payment:
            </div>

            <div style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'inline-block', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=tendengyros@upi&pn=Ten%20Den%20Gyros&am=${getTotal().toFixed(2)}&tn=${encodeURIComponent(tableNumber + '_SelfOrder')}`)}`}
                alt="UPI Payment QR"
                style={{ width: '170px', height: '170px', display: 'block' }}
              />
            </div>

            <button
              onClick={() => handlePlaceOrder('upi')}
              disabled={processing}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: '#10b981', color: 'white', fontWeight: 900, fontSize: '14.5px', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
              }}
            >
              {processing ? 'Processing Order...' : `✓ I Have Paid ₹${getTotal().toFixed(2)} — Submit Order`}
            </button>
          </div>

          {/* Pay at Counter Option */}
          <button
            onClick={() => handlePlaceOrder('counter')}
            disabled={processing}
            style={{
              width: '100%', padding: '12px', background: '#f8fafc', border: '1.5px solid #cbd5e1',
              borderRadius: '10px', fontWeight: 800, fontSize: '13px', color: '#334155', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Banknote size={16} color="#059669" /> Pay Cash at Counter
          </button>
        </div>
      </Modal>

      {/* FULL Customizer Modal (POS-Matching Steps & Sticky Fully-Visible Action Button) */}
      <Modal isOpen={!!customizingItem} onClose={() => setCustomizingItem(null)} title={`Customize ${customizingItem?.name || 'Item'}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '75vh', position: 'relative' }}>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Dual Gyro Combos Customizer */}
            {isDualGyroCombo(customizingItem) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Gyro 1 */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#e63946', marginBottom: '8px' }}>GYRO 1 CUSTOMIZATION</div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Protein</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['Chicken', 'Paneer'].map(p => (
                        <button key={p} onClick={() => setSelectedGyro1Protein(p)} style={{
                          flex: 1, padding: '8px', borderRadius: '8px',
                          border: selectedGyro1Protein === p ? '2px solid #e63946' : '1px solid #cbd5e1',
                          background: selectedGyro1Protein === p ? '#fff5f5' : '#ffffff',
                          color: selectedGyro1Protein === p ? '#e63946' : '#334155', fontWeight: 800, fontSize: '12px', cursor: 'pointer'
                        }}>{p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Flavor / Style</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Spicy', 'Creamy', 'BBQ', 'Signature'].map(f => (
                        <button key={f} onClick={() => setSelectedGyro1Flavor(f)} style={{
                          padding: '6px', borderRadius: '8px',
                          border: selectedGyro1Flavor === f ? '2px solid #e63946' : '1px solid #cbd5e1',
                          background: selectedGyro1Flavor === f ? '#e63946' : '#ffffff',
                          color: selectedGyro1Flavor === f ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
                        }}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Base Spread</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Tzatziki', 'Hummus', 'Cheese', 'Ricotta'].map(s => (
                        <button key={s} onClick={() => setSelectedGyro1Spread(s)} style={{
                          padding: '6px', borderRadius: '8px',
                          border: selectedGyro1Spread === s ? '2px solid #e63946' : '1px solid #cbd5e1',
                          background: selectedGyro1Spread === s ? '#e63946' : '#ffffff',
                          color: selectedGyro1Spread === s ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gyro 2 */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#2563eb', marginBottom: '8px' }}>GYRO 2 CUSTOMIZATION</div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Protein</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['Chicken', 'Paneer'].map(p => (
                        <button key={p} onClick={() => setSelectedGyro2Protein(p)} style={{
                          flex: 1, padding: '8px', borderRadius: '8px',
                          border: selectedGyro2Protein === p ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedGyro2Protein === p ? '#eff6ff' : '#ffffff',
                          color: selectedGyro2Protein === p ? '#1e40af' : '#334155', fontWeight: 800, fontSize: '12px', cursor: 'pointer'
                        }}>{p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Flavor / Style</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Spicy', 'Creamy', 'BBQ', 'Signature'].map(f => (
                        <button key={f} onClick={() => setSelectedGyro2Flavor(f)} style={{
                          padding: '6px', borderRadius: '8px',
                          border: selectedGyro2Flavor === f ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedGyro2Flavor === f ? '#2563eb' : '#ffffff',
                          color: selectedGyro2Flavor === f ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
                        }}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Base Spread</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Tzatziki', 'Hummus', 'Cheese', 'Ricotta'].map(s => (
                        <button key={s} onClick={() => setSelectedGyro2Spread(s)} style={{
                          padding: '6px', borderRadius: '8px',
                          border: selectedGyro2Spread === s ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedGyro2Spread === s ? '#2563eb' : '#ffffff',
                          color: selectedGyro2Spread === s ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Regular Drinks Selection */}
                {(() => {
                  const dCount = getMealDrinkCount(customizingItem?.name)
                  if (dCount <= 0) return null
                  const drinksArr = [
                    { label: '1st Drink', val: selectedDrink1, set: setSelectedDrink1 },
                    { label: '2nd Drink', val: selectedDrink2, set: setSelectedDrink2 },
                    { label: '3rd Drink', val: selectedDrink3, set: setSelectedDrink3 },
                    { label: '4th Drink', val: selectedDrink4, set: setSelectedDrink4 },
                    { label: '5th Drink', val: selectedDrink5, set: setSelectedDrink5 }
                  ].slice(0, dCount)

                  return (
                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1.5px solid #bbf7d0' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#15803d', marginBottom: '8px' }}>
                        🥤 CHOOSE YOUR {dCount} REGULAR DRINK{dCount > 1 ? 'S' : ''}
                      </div>
                      {drinksArr.map((dItem, idx) => (
                        <div key={idx} style={{ marginBottom: idx === drinksArr.length - 1 ? 0 : '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>{idx + 1}. {dItem.label}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea', 'Water Bottle'].map(d => (
                              <button key={d} onClick={() => dItem.set(d)} style={{
                                padding: '6px', borderRadius: '6px',
                                border: dItem.val === d ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                background: dItem.val === d ? '#16a34a' : '#ffffff',
                                color: dItem.val === d ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '10.5px', cursor: 'pointer'
                              }}>{dItem.val === d ? '✓ ' : ''}{d}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Dips Selection */}
                {(() => {
                  const dipCount = getMealDipCount(customizingItem?.name)
                  if (dipCount <= 0) return null
                  const dipsArr = [
                    { label: '1st Dip', val: selectedDip1, set: setSelectedDip1 },
                    { label: '2nd Dip', val: selectedDip2, set: setSelectedDip2 },
                    { label: '3rd Dip', val: selectedDip3, set: setSelectedDip3 }
                  ].slice(0, dipCount)

                  return (
                    <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#c2410c', marginBottom: '8px' }}>
                        🧄 CHOOSE YOUR {dipCount} DIPS
                      </div>
                      {dipsArr.map((dItem, idx) => (
                        <div key={idx} style={{ marginBottom: idx === dipsArr.length - 1 ? 0 : '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9a3412', marginBottom: '4px' }}>{idx + 1}. {dItem.label}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {['Garlic Mayo Dip', 'Spicy Mayo Dip', 'Tzatziki Dip', 'Peri Peri Dip', 'Jalapeno Cheese Dip', 'Turkish Chili Dip'].map(dp => (
                              <button key={dp} onClick={() => dItem.set(dp)} style={{
                                padding: '6px', borderRadius: '6px',
                                border: dItem.val === dp ? '2px solid #ea580c' : '1px solid #cbd5e1',
                                background: dItem.val === dp ? '#ea580c' : '#ffffff',
                                color: dItem.val === dp ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '10.5px', cursor: 'pointer'
                              }}>{dItem.val === dp ? '✓ ' : ''}{dp}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            ) : (
              /* POS MATCHING CUSTOMIZER STEPS (Protein, Drink, Gyro Steps) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(() => {
                  const cItemName = (customizingItem?.name || '').toLowerCase()
                  const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
                  const isRiceItem = cItemName.includes('rice')
                  const isSuper5 = cItemName.includes('super 5')
                  const isIceTea = cItemName.includes('ice tea') || cItemName.includes('iced tea')
                  const hasProteinChoice = (cItemName.includes('gyro') || cItemName.includes('rice') || cItemName.includes('meal') || cItemName.includes('feast') || cItemName.includes('box') || cItemName.includes('loaded') || cCatName.includes('gyro') || cCatName.includes('rice') || cCatName.includes('protein')) && !isIceTea
                  const hasGyroChoice = (cItemName.includes('gyro') || cItemName.includes('meal') || cItemName.includes('feast') || cCatName.includes('gyro')) && !isRiceItem && !isSuper5 && !isIceTea
                  const dCount = getMealDrinkCount(customizingItem?.name)

                  return (
                    <>
                      {/* Ice Tea Flavor Selection */}
                      {isIceTea && (
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                            🍹 Choose Ice Tea Flavor *
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['Peach', 'Lime'].map(f => (
                              <button key={f} onClick={() => setSelectedIceTeaFlavor(f)} style={{
                                flex: 1, padding: '12px', borderRadius: '10px',
                                border: selectedIceTeaFlavor === f ? '2px solid #e63946' : '1px solid #cbd5e1',
                                background: selectedIceTeaFlavor === f ? '#fff5f5' : '#ffffff',
                                color: selectedIceTeaFlavor === f ? '#e63946' : '#334155', fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                              }}>{f === 'Peach' ? '🍑 Peach Ice Tea' : '🍋 Lime Ice Tea'}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 1. Choose Protein */}
                      {hasProteinChoice && (
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                            1. Choose Protein *
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['Chicken', 'Paneer'].map(p => (
                              <button key={p} onClick={() => setSelectedProtein(p)} style={{
                                flex: 1, padding: '10px', borderRadius: '10px',
                                border: selectedProtein === p ? '2px solid #e63946' : '1px solid #cbd5e1',
                                background: selectedProtein === p ? '#fff5f5' : '#ffffff',
                                color: selectedProtein === p ? '#e63946' : '#334155', fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                              }}>{p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Drink Choice Section */}
                      {dCount > 0 && (
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                            🥤 Choose Drink / Beverage ({dCount} Included) *
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea', 'Water Bottle'].map(d => (
                              <button key={d} onClick={() => setSelectedDrink1(d)} style={{
                                padding: '8px 4px', borderRadius: '8px',
                                border: selectedDrink1 === d ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                                background: selectedDrink1 === d ? '#ecfeff' : '#ffffff',
                                color: selectedDrink1 === d ? '#0891b2' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer', textAlign: 'center'
                              }}>{selectedDrink1 === d ? '✓ ' : ''}{d}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gyro Flavor & Bread */}
                      {hasGyroChoice && (
                        <>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                              Flavor / Style *
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                              {['Spicy', 'Creamy', 'BBQ', 'Signature'].map(f => (
                                <button key={f} onClick={() => setSelectedGyroFlavor(f)} style={{
                                  padding: '8px 4px', borderRadius: '8px',
                                  border: selectedGyroFlavor === f ? '2px solid #e63946' : '1px solid #cbd5e1',
                                  background: selectedGyroFlavor === f ? '#e63946' : '#ffffff',
                                  color: selectedGyroFlavor === f ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer', textAlign: 'center'
                                }}>{selectedGyroFlavor === f ? '✓ ' : ''}{f}</button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                              Choose Pita Bread *
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {['Baked', 'Fried'].map(b => (
                                <button key={b} onClick={() => setSelectedBread(b)} style={{
                                  flex: 1, padding: '10px', borderRadius: '10px',
                                  border: selectedBread === b ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                  background: selectedBread === b ? '#eff6ff' : '#ffffff',
                                  color: selectedBread === b ? '#1e40af' : '#334155', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer'
                                }}>{b === 'Baked' ? 'Baked Pita' : 'Fried Pita'}</button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )
                })()}

                {/* 4. Sauces (Select Multiple) */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>4. Choose Sauces (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['Turkish Chili', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard', 'Tzatziki'].map(sauce => {
                      const isSel = selectedSauces.includes(sauce)
                      return (
                        <button key={sauce} onClick={() => {
                          if (isSel) setSelectedSauces(selectedSauces.filter(x => x !== sauce))
                          else setSelectedSauces([...selectedSauces, sauce])
                        }} style={{
                          padding: '8px 4px', borderRadius: '8px',
                          border: isSel ? '2px solid #e63946' : '1px solid #cbd5e1',
                          background: isSel ? '#e63946' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer', textAlign: 'center'
                        }}>{isSel ? '✓ ' : ''}{sauce}</button>
                      )
                    })}
                  </div>
                </div>

                {/* 5. Fresh Veggies & Toppings (Select Multiple) */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>5. Fresh Veggies & Toppings (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'].map(veg => {
                      const isSel = selectedVeggies.includes(veg)
                      return (
                        <button key={veg} onClick={() => {
                          if (isSel) setSelectedVeggies(selectedVeggies.filter(x => x !== veg))
                          else setSelectedVeggies([...selectedVeggies, veg])
                        }} style={{
                          padding: '6px 4px', borderRadius: '8px',
                          border: isSel ? '2px solid #10b981' : '1px solid #cbd5e1',
                          background: isSel ? '#10b981' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer', textAlign: 'center'
                        }}>{isSel ? '✓ ' : ''}{veg}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Drink Choice Section */}
                {(() => {
                  const dCount = getMealDrinkCount(customizingItem?.name)
                  if (dCount <= 0) return null
                  return (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>🥤 Choose Drink / Beverage</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea', 'Water Bottle'].map(d => (
                          <button key={d} onClick={() => setSelectedDrink1(d)} style={{
                            padding: '8px', borderRadius: '8px',
                            border: selectedDrink1 === d ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                            background: selectedDrink1 === d ? '#ecfeff' : '#ffffff',
                            color: selectedDrink1 === d ? '#0891b2' : '#334155', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
                          }}>{selectedDrink1 === d ? '✓ ' : ''}{d}</button>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Special Cooking Notes */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '4px' }}>📝 Special Cooking Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra sauce, no onions..."
                    value={gyroNotes}
                    onChange={(e) => setGyroNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Fully-Visible Action Button */}
          <div style={{
            position: 'sticky', bottom: 0, zIndex: 30, background: '#ffffff',
            paddingTop: '10px', paddingBottom: '4px', borderTop: '1px solid #e2e8f0', marginTop: '4px'
          }}>
            <button
              onClick={confirmCustomization}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #ffd100, #ffcc00)',
                color: '#18191c', fontWeight: 900, fontSize: '15px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,209,0,0.3)', display: 'block'
              }}
            >
              Add Customized Item to Cart 🛒
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
