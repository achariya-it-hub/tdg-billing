import { useState, useEffect, useRef } from 'react'
import { Plus, Minus, Trash2, ShoppingBag, X, Volume2, VolumeX } from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import { useMenuStore } from '../stores/menuStore'
import { useOrderStore } from '../stores/orderStore'
import { getSocket, connectToPOS } from '../lib/socket'
import { playOrderAlertSound, getSoundEnabled, setSoundEnabled } from '../utils/audioAlert'
import PrintService from '../lib/printService'
import API_BASE from '../lib/apiConfig'

const categoryIcons = {
  'Burgers': '🍔',
  'Chicken': '🍗',
  'Sides': '🍟',
  'Beverages': '🥤',
  'Desserts': '🍰',
  'Combos': '📦'
}

const glassCard = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
}

const menuItemCard = {
  ...glassCard,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden'
}

const orderPanel = {
  ...glassCard,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}

const orderTypeBtn = (active) => ({
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  background: active ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(0,0,0,0.03)',
  color: active ? 'white' : '#6b7280',
  fontWeight: 600,
  fontSize: '12px',
  border: 'none',
  cursor: 'pointer',
  textTransform: 'uppercase',
  transition: 'all 0.2s',
  boxShadow: active ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
})

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid var(--border)',
  fontSize: '14px',
  background: 'white',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}

const qtyBtn = (color) => ({
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: color,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s',
  boxShadow: color === '#e63946' ? '0 2px 6px rgba(230,57,70,0.3)' : 'none'
})

export default function POS() {
  const toast = useToast()
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()
  const {
    currentOrder, addItem, updateItemQuantity, removeItem,
    setOrderType, setTableNumber, setCustomerName, setCustomerPhone, setComplimentary, setSpecialRemarks, clearOrder,
    setInaugurationOffer, getDiscount,
    holdOrder, recallOrder, heldOrders, getSubtotal, getTax, getTotal, placeOrder
  } = useOrderStore()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCart, setShowCart] = useState(false)
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled())

  // Gyro & Combo Customizer State
  const [customizingItem, setCustomizingItem] = useState(null)
  const [selectedBread, setSelectedBread] = useState('Baked')
  const [selectedProtein, setSelectedProtein] = useState('Chicken')
  const [selectedDrink, setSelectedDrink] = useState('Coca-Cola')
  const [selectedSpread, setSelectedSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion'])
  const [gyroNotes, setGyroNotes] = useState('')
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data?.company?.deliveryEnabled !== undefined) {
          setDeliveryEnabled(data.company.deliveryEnabled !== false)
        }
      })
      .catch(() => {})
  }, [])

  const handleSelectOrderType = (type) => {
    if (type === 'delivery' && !deliveryEnabled) {
      toast.error('Delivery service is currently turned OFF by store settings')
      return
    }
    setOrderType(type)
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
      itemName.includes('rice') || itemName.includes('salad')
    )
  }

  const isGyro = isCustomizable

  const handleItemClick = (item) => {
    if (!item || !item.isAvailable) return
    if (isCustomizable(item)) {
      setCustomizingItem(item)
      setSelectedBread('Baked')
      setSelectedProtein('Chicken')
      setSelectedDrink('Coca-Cola')
      setSelectedSpread('Tzatziki')
      setSelectedSauces(['Garlic Mayo'])
      setSelectedVeggies(['Lettuce', 'Onion'])
      setGyroNotes('')
    } else {
      addItem({
        menuItemId: item.id,
        menuItemName: item.name || 'Unnamed Item',
        unitPrice: item.price || 0,
        totalPrice: item.price || 0
      })
    }
  }

  const handleAddGyroWithCustomization = () => {
    if (!customizingItem) return
    const cat = categories.find(c => c.id === customizingItem.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    const itemName = (customizingItem?.name || '').toLowerCase()

    const hasGyro = catName.includes('gyro') || itemName.includes('gyro') || itemName.includes('feast') || itemName.includes('box') || itemName.includes('meal')
    const hasRice = itemName.includes('rice')
    const hasDrink = itemName.includes('meal') || itemName.includes('box') || itemName.includes('feast') || itemName.includes('bucket') || itemName.includes('drink') || catName.includes('meal')

    const customization = {
      ...(hasGyro ? { bread: selectedBread, spread: selectedSpread, sauces: selectedSauces, veggies: selectedVeggies } : {}),
      ...((hasGyro || hasRice) ? { protein: selectedProtein } : {}),
      ...(hasDrink ? { drink: selectedDrink } : {}),
      notes: gyroNotes
    }

    addItem({
      menuItemId: customizingItem.id,
      menuItemName: customizingItem.name,
      unitPrice: customizingItem.price,
      totalPrice: customizingItem.price,
      customization
    })
    setCustomizingItem(null)
    toast.success(`Added ${customizingItem.name} to order`)
  }

  const handleAddStandardGyro = () => {
    if (!customizingItem) return
    addItem({
      menuItemId: customizingItem.id,
      menuItemName: customizingItem.name,
      unitPrice: customizingItem.price,
      totalPrice: customizingItem.price
    })
    setCustomizingItem(null)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) playOrderAlertSound('new_order')
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchCategories(); fetchMenuItems() }, [])
  useEffect(() => { selectedCategory ? fetchMenuItems(selectedCategory) : fetchMenuItems() }, [selectedCategory])

  // Track printed orders to prevent duplicate printouts (local vs socket event)
  const printedOrderIdsRef = useRef(new Set())

  // Real-time Order Sound Alert Listener
  useEffect(() => {
    const socket = getSocket()
    connectToPOS()

    const handleNewOrder = (order) => {
      if (!order) return
      const orderIdKey = String(order.id || order.orderNumber || '')
      if (printedOrderIdsRef.current.has(orderIdKey) || (order.id && printedOrderIdsRef.current.has(String(order.id)))) {
        console.log('[PRINT DEDUPLICATION] Order already printed locally, skipping duplicate socket print:', orderIdKey)
        return
      }
      printedOrderIdsRef.current.add(orderIdKey)
      if (order.id) printedOrderIdsRef.current.add(String(order.id))

      playOrderAlertSound('new_order')
      const num = order?.orderNumber || order?.id || ''
      const src = order?.source ? order.source.toUpperCase() : (order?.type ? order.type.toUpperCase() : 'WAITER')
      toast.success(`🔔 New ${src} Order #${num} received! Printing KOT...`)

      try {
        PrintService.printKOTAndBill(order)
      } catch (pe) {
        console.error('Remote order auto-print failed:', pe)
      }
    }

    const handleOnlineOrder = (order) => {
      if (!order) return
      const orderIdKey = String(order.id || order.orderNumber || '')
      if (printedOrderIdsRef.current.has(orderIdKey) || (order.id && printedOrderIdsRef.current.has(String(order.id)))) {
        return
      }
      printedOrderIdsRef.current.add(orderIdKey)
      if (order.id) printedOrderIdsRef.current.add(String(order.id))

      playOrderAlertSound('online_order')
      const num = order?.orderNumber || order?.id || ''
      toast.success(`🔔 New Online Order #${num} Received! Printing KOT...`)
      try {
        PrintService.printKOTAndBill(order)
      } catch (pe) {
        console.error('Online order auto-print failed:', pe)
      }
    }

    const handleMenuUpdated = () => {
      fetchMenuItems(selectedCategory || undefined)
    }

    socket.on('order:created', handleNewOrder)
    socket.on('online-order:new', handleOnlineOrder)
    socket.on('menu:updated', handleMenuUpdated)

    return () => {
      socket.off('order:created', handleNewOrder)
      socket.off('online-order:new', handleOnlineOrder)
      socket.off('menu:updated', handleMenuUpdated)
    }
  }, [selectedCategory])

  const [lastPlacedOrder, setLastPlacedOrder] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handlePlaceOrder = async () => {
    if (!currentOrder.items || currentOrder.items.length === 0) { toast.error('Add items to place order'); return }
    setProcessing(true)
    try {
      const newOrder = await placeOrder()
      toast.success('Order placed & Bill generated!')
      setShowCart(false)
      if (newOrder) {
        setLastPlacedOrder(newOrder)
        setShowSuccessModal(true)
        if (newOrder.id) printedOrderIdsRef.current.add(String(newOrder.id))
        if (newOrder.orderNumber) printedOrderIdsRef.current.add(String(newOrder.orderNumber))
        PrintService.printKOTAndBill(newOrder)
      }
    }
    catch (err) { console.error('Order error:', err); toast.error('Failed: ' + err.message) }
    setProcessing(false)
  }

  const CategoryPills = ({ onSelect }) => (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
      <button onClick={() => setSelectedCategory(null)} style={{
        padding: '10px 18px', borderRadius: '12px',
        background: !selectedCategory ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.7)',
        color: !selectedCategory ? 'white' : '#4b5563', fontWeight: 600, fontSize: '13px',
        whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
        boxShadow: !selectedCategory ? '0 2px 8px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s'
      }}>All</button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
          padding: '10px 18px', borderRadius: '12px',
          background: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.7)',
          color: selectedCategory === cat.id ? 'white' : '#1a1a2e', fontWeight: 600, fontSize: '13px',
          whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: selectedCategory === cat.id ? `0 2px 8px ${cat.color}40` : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s'
        }}>
          <span>{categoryIcons[cat.name]?.[0] || '🍽️'}</span>
          {cat.name}
        </button>
      ))}
    </div>
  )

  const MenuItemCard = ({ item }) => {
    const cat = categories.find(c => c.id === item.categoryId)
    const isGyroItem = isGyro(item)
    return (
      <div
        onClick={() => handleItemClick(item)}
        style={{
          ...menuItemCard,
          opacity: item.isAvailable ? 1 : 0.5,
          cursor: item.isAvailable ? 'pointer' : 'not-allowed',
          position: 'relative'
        }}
        onMouseEnter={(e) => { if (item.isAvailable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {isGyroItem && item.isAvailable && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            color: 'white', fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            CUSTOMIZABLE
          </span>
        )}
        <div style={{
          height: isMobile ? '70px' : '100px',
          background: `linear-gradient(135deg, ${cat?.color || '#333'}22, ${cat?.color || '#333'}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '28px' : '40px',
          overflow: 'hidden', padding: '6px'
        }}>
          {!item.isAvailable && <span style={{ background: '#e63946', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>UNAVAILABLE</span>}
          {item.isAvailable && (
            item.image ? (
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              (categoryIcons[cat?.name] || '🍽️')
            )
          )}
        </div>
        <div style={{ padding: isMobile ? '8px 10px' : '12px' }}>
          <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, marginBottom: '2px', lineHeight: 1.2 }}>{item.name}</div>
          <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#e63946' }}>₹{item.price}</div>
        </div>
      </div>
    )
  }

  const OrderItemRow = ({ item, index }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '6px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.menuItemName}</div>
        {item.customization && (
          <div style={{ fontSize: '11px', color: '#e63946', marginTop: '2px', fontWeight: 500, lineHeight: 1.3 }}>
            {item.customization.bread} bread • {item.customization.spread} spread
            {item.customization.sauces?.length > 0 && ` • Sauces: ${item.customization.sauces.join(', ')}`}
            {item.customization.veggies?.length > 0 && ` • Veggies: ${item.customization.veggies.join(', ')}`}
            {item.customization.notes && ` • Note: ${item.customization.notes}`}
          </div>
        )}
        <div style={{ color: '#e63946', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>₹{item.unitPrice}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => updateItemQuantity(index, item.quantity - 1)} style={qtyBtn('#f3f4f6')}>
          <Minus size={14} color="#4b5563" />
        </button>
        <span style={{ width: '24px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{item.quantity}</span>
        <button onClick={() => updateItemQuantity(index, item.quantity + 1)} style={qtyBtn('#e63946')}>
          <Plus size={14} />
        </button>
      </div>
      <div style={{ width: '65px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>₹{item.totalPrice}</div>
      <button onClick={() => removeItem(index)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'transparent', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
        <Trash2 size={14} />
      </button>
    </div>
  )

  // Mobile POS Layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
        <CategoryPills />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {menuItems.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
        </div>
        {/* Mobile Cart Button */}
        <div onClick={() => setShowCart(true)} style={{
          marginTop: '12px', padding: '16px 20px',
          background: 'linear-gradient(135deg, #e63946, #c1121f)',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(230,57,70,0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{currentOrder.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
          </div>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>₹{getTotal().toFixed(0)}</span>
        </div>
        {/* Mobile Cart Modal */}
        <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="Your Order" size="full">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['dine-in', 'takeaway', 'delivery'].map(type => {
              const isDisabled = type === 'delivery' && !deliveryEnabled
              return (
                <button key={type} onClick={() => handleSelectOrderType(type)} style={{
                  ...orderTypeBtn(currentOrder.type === type),
                  opacity: isDisabled ? 0.45 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}>
                  {type === 'dine-in' ? 'Dine In' : type === 'delivery' && !deliveryEnabled ? 'Delivery (OFF)' : type}
                </button>
              )
            })}
          </div>
          <input type="tel" placeholder="Customer Phone" value={currentOrder.customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
            {currentOrder.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No items yet</div>
            ) : currentOrder.items.map((item, index) => <OrderItemRow key={index} item={item} index={index} />)}
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>CGST (2.5%)</span><span>₹{(getTax() / 2).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>SGST (2.5%)</span><span>₹{(getTax() / 2).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 800, marginBottom: '16px', paddingTop: '8px', borderTop: '2px solid #1a1a2e' }}>
              <span>Total</span><span style={{ color: '#e63946' }}>₹{getTotal().toFixed(2)}</span>
            </div>
            <input placeholder="Special remarks for kitchen..." value={currentOrder.specialRemarks || ''} onChange={e => setSpecialRemarks(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['', 'MD', 'Chairman', 'Internal Corporate', 'VIP'].map(type => (
                <button key={type} onClick={() => setComplimentary(type)} style={{
                  padding: '8px 14px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  background: currentOrder.complimentaryType === type ? (type ? '#f59e0b' : 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.04)',
                  color: currentOrder.complimentaryType === type ? 'white' : '#6b7280', transition: 'all 0.2s'
                }}>{type || 'Chargeable'}</button>
              ))}
            </div>
            <button onClick={handlePlaceOrder} disabled={processing || currentOrder.items.length === 0} style={{
              width: '100%', padding: '18px', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: 700,
              background: processing ? '#9ca3af' : currentOrder.complimentary ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #e63946, #c1121f)',
              color: 'white', cursor: processing || currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: processing ? 'none' : currentOrder.complimentary ? '0 4px 16px rgba(245,158,11,0.3)' : '0 4px 16px rgba(230,57,70,0.35)'
            }}>
              {processing ? 'Placing...' : currentOrder.complimentary ? `Place (Complimentary)` : `Place Order • ₹${getTotal().toFixed(0)}`}
            </button>
          </div>
        </Modal>
      </div>
    )
  }

  // Desktop POS Layout
  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 104px)' }}>
      {/* Categories Sidebar */}
      <div style={{ width: '170px', display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'auto' }}>
        <button onClick={toggleSound} style={{
          padding: '10px 14px', borderRadius: '12px',
          background: soundOn ? '#ecfdf5' : '#fef2f2',
          color: soundOn ? '#047857' : '#b91c1c',
          border: `1px solid ${soundOn ? '#10b98140' : '#ef444440'}`,
          fontWeight: 600, fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '4px', transition: 'all 0.2s'
        }}>
          {soundOn ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} color="#ef4444" />}
          {soundOn ? 'Alerts ON' : 'Muted'}
        </button>

        <button onClick={() => setSelectedCategory(null)} style={{
          padding: '12px 16px', borderRadius: '12px',
          background: !selectedCategory ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.7)',
          color: !selectedCategory ? 'white' : '#4b5563', fontWeight: 600, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer',
          backdropFilter: 'blur(10px)', transition: 'all 0.2s',
          boxShadow: !selectedCategory ? '0 2px 8px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '18px' }}>✨</span> All Items
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
            padding: '12px 16px', borderRadius: '12px',
            background: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.7)',
            color: selectedCategory === cat.id ? 'white' : '#1a1a2e', fontWeight: 600, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer',
            backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            boxShadow: selectedCategory === cat.id ? `0 2px 8px ${cat.color}40` : '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '18px' }}>{categoryIcons[cat.name] || '🍽️'}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px' }}>
          {menuItems.map(item => <MenuItemCard key={item.id} item={item} />)}
        </div>
      </div>

      {/* Order Panel */}
      <div style={orderPanel}>
        {/* Order Type Tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          {['dine-in', 'takeaway', 'delivery'].map(type => {
            const isDisabled = type === 'delivery' && !deliveryEnabled
            return (
              <button key={type} onClick={() => handleSelectOrderType(type)} style={{
                ...orderTypeBtn(currentOrder.type === type),
                opacity: isDisabled ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer'
              }}>
                {type === 'dine-in' ? 'Dine In' : type === 'delivery' && !deliveryEnabled ? 'Delivery (OFF)' : type}
              </button>
            )
          })}
        </div>

        {(currentOrder.type === 'dine-in' || currentOrder.type === 'takeaway' || currentOrder.type === 'delivery') && (
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <input type="tel" placeholder="Customer Phone" value={currentOrder.customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} />
          </div>
        )}

        {/* Order Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {currentOrder.items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={28} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Start adding items</span>
            </div>
          ) : currentOrder.items.map((item, index) => <OrderItemRow key={index} item={item} index={index} />)}
        </div>

        {/* Held Orders */}
        {heldOrders.length > 0 && (
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: 600 }}>Held ({heldOrders.length})</div>
            <div style={{ display: 'flex', gap: '6px', overflow: 'auto' }}>
              {heldOrders.map((order, i) => (
                <button key={i} onClick={() => recallOrder(i)} style={{
                  padding: '6px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: '8px',
                  border: 'none', color: '#4b5563', fontSize: '11px', cursor: 'pointer', fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>#{i + 1} ({order.items.length})</button>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(248,249,250,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>Subtotal</span><span style={{ fontSize: '13px' }}>₹{useOrderStore.getState().getRawSubtotal().toFixed(2)}</span></div>
          {currentOrder.inaugurationOffer && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#10b981', fontWeight: 700 }}>
              <span style={{ fontSize: '13px' }}>🎉 Inauguration Offer (50% OFF)</span>
              <span style={{ fontSize: '13px' }}>-₹{getDiscount().toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>CGST (2.5%)</span><span style={{ fontSize: '13px' }}>₹{(getTax() / 2).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>SGST (2.5%)</span><span style={{ fontSize: '13px' }}>₹{(getTax() / 2).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, marginBottom: '12px', paddingTop: '8px', borderTop: '2px solid #1a1a2e' }}>
            <span>Total</span><span style={{ color: '#e63946' }}>₹{getTotal().toFixed(2)}</span>
          </div>

          {/* 1-Click Inauguration Offer Button */}
          <button
            type="button"
            onClick={() => setInaugurationOffer(!currentOrder.inaugurationOffer)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: currentOrder.inaugurationOffer ? '2px solid #10b981' : '1px solid #d1d5db',
              background: currentOrder.inaugurationOffer ? 'linear-gradient(135deg, #10b981, #059669)' : '#fff',
              color: currentOrder.inaugurationOffer ? '#fff' : '#374151',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: currentOrder.inaugurationOffer ? '0 3px 10px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🎉</span> {currentOrder.inaugurationOffer ? '50% OFF Inauguration Offer (ACTIVE)' : 'Apply 50% OFF Inauguration Offer'}
          </button>

          <input placeholder="Special remarks..." value={currentOrder.specialRemarks || ''} onChange={e => setSpecialRemarks(e.target.value)} style={{ ...inputStyle, fontSize: '12px', padding: '8px 10px', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {['', 'MD', 'Chairman', 'Internal Corporate', 'VIP'].map(type => (
              <button key={type} onClick={() => setComplimentary(type)} style={{
                padding: '5px 10px', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                background: currentOrder.complimentaryType === type ? (type ? '#f59e0b' : 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.04)',
                color: currentOrder.complimentaryType === type ? 'white' : '#6b7280', transition: 'all 0.2s'
              }}>{type || 'Chargeable'}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Button variant="secondary" size="sm" onClick={holdOrder} style={{ flex: 1, borderRadius: '10px' }}>Hold</Button>
            <Button variant="secondary" size="sm" onClick={clearOrder} style={{ flex: 1, borderRadius: '10px' }}>Clear</Button>
          </div>
          <Button fullWidth size="lg" onClick={handlePlaceOrder} disabled={currentOrder.items.length === 0 || processing}
            variant={currentOrder.complimentary ? 'warning' : 'primary'}
            style={{ borderRadius: '14px', boxShadow: '0 4px 16px rgba(230,57,70,0.35)' }}
          >
            {processing ? 'Placing...' : currentOrder.complimentary ? `Place (Free)` : `Place Order • ₹${getTotal().toFixed(0)}`}
          </Button>
        </div>
      </div>

      {/* Customizer Modal for Gyros & Combos */}
      <Modal isOpen={!!customizingItem} onClose={() => setCustomizingItem(null)} title={`🍱 Customize ${customizingItem?.name || 'Item'}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* Protein Choice Section (Chicken / Paneer) */}
          {(() => {
            const cItemName = (customizingItem?.name || '').toLowerCase()
            const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
            const hasProteinChoice = cItemName.includes('gyro') || cItemName.includes('rice') || cItemName.includes('meal') || cItemName.includes('feast') || cItemName.includes('box') || cCatName.includes('gyro') || cCatName.includes('rice') || cCatName.includes('protein')
            if (!hasProteinChoice) return null
            return (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🍗 / 🧀 Choose Protein
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Chicken', 'Paneer'].map(p => (
                    <button key={p} type="button" onClick={() => setSelectedProtein(p)} style={{
                      flex: 1, padding: '12px 14px', borderRadius: '10px',
                      border: selectedProtein === p ? '2px solid #e63946' : '1px solid #e5e7eb',
                      background: selectedProtein === p ? '#fff5f5' : '#f9fafb',
                      color: selectedProtein === p ? '#e63946' : '#374151',
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      {p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Drink Choice Section (Coca-Cola / Sprite / Fanta / Ice Tea) */}
          {(() => {
            const cItemName = (customizingItem?.name || '').toLowerCase()
            const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
            const hasDrinkChoice = cItemName.includes('meal') || cItemName.includes('box') || cItemName.includes('feast') || cItemName.includes('bucket') || cItemName.includes('drink') || cCatName.includes('meal') || cCatName.includes('beverage')
            if (!hasDrinkChoice) return null
            return (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🥤 Choose Drink / Beverage
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea'].map(d => (
                    <button key={d} type="button" onClick={() => setSelectedDrink(d)} style={{
                      padding: '10px', borderRadius: '10px',
                      border: selectedDrink === d ? '2px solid #06b6d4' : '1px solid #e5e7eb',
                      background: selectedDrink === d ? '#ecfeff' : '#f9fafb',
                      color: selectedDrink === d ? '#0891b2' : '#374151',
                      fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                    }}>
                      {selectedDrink === d ? '✓ ' : ''}{d}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Gyro Pita Bread Section */}
          {(() => {
            const cItemName = (customizingItem?.name || '').toLowerCase()
            const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
            const hasGyroChoice = cItemName.includes('gyro') || cItemName.includes('meal') || cItemName.includes('feast') || cItemName.includes('box') || cCatName.includes('gyro')
            if (!hasGyroChoice) return null
            return (
              <>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🥙 Pita Bread Type
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Baked', 'Fried'].map(b => (
                      <button key={b} type="button" onClick={() => setSelectedBread(b)} style={{
                        flex: 1, padding: '10px 14px', borderRadius: '10px',
                        border: selectedBread === b ? '2px solid #e63946' : '1px solid #e5e7eb',
                        background: selectedBread === b ? '#fff5f5' : '#f9fafb',
                        color: selectedBread === b ? '#e63946' : '#374151',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                        {b === 'Baked' ? '🫓 Baked Pita' : '🥙 Fried Pita'}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Base Spread Section */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🧄 Base Spread
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {['Tzatziki', 'Hummus', 'Cheese', 'Ricotta'].map(s => (
                    <button key={s} type="button" onClick={() => setSelectedSpread(s)} style={{
                      padding: '10px', borderRadius: '10px',
                      border: selectedSpread === s ? '2px solid #e63946' : '1px solid #e5e7eb',
                      background: selectedSpread === s ? '#fff5f5' : '#f9fafb',
                      color: selectedSpread === s ? '#e63946' : '#374151',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sauces Section */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🌶️ Sauces (Select Multiple)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Garlic Mayo', 'Turkish Chili', 'Jalapeno Cheese', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard'].map(sauce => {
                    const isSelected = selectedSauces.includes(sauce)
                    return (
                      <button key={sauce} type="button" onClick={() => {
                        if (isSelected) setSelectedSauces(selectedSauces.filter(x => x !== sauce))
                        else setSelectedSauces([...selectedSauces, sauce])
                      }} style={{
                        padding: '8px 10px', borderRadius: '10px',
                        border: isSelected ? '2px solid #e63946' : '1px solid #e5e7eb',
                        background: isSelected ? '#e63946' : '#f9fafb',
                        color: isSelected ? 'white' : '#374151',
                        fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                        {isSelected ? '✓ ' : ''}{sauce}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Veggies Section */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🥗 Fresh Veggies & Toppings
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'].map(veg => {
                    const isSelected = selectedVeggies.includes(veg)
                    return (
                      <button key={veg} type="button" onClick={() => {
                        if (isSelected) setSelectedVeggies(selectedVeggies.filter(x => x !== veg))
                        else setSelectedVeggies([...selectedVeggies, veg])
                      }} style={{
                        padding: '8px 6px', borderRadius: '10px',
                        border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                        background: isSelected ? '#10b981' : '#f9fafb',
                        color: isSelected ? 'white' : '#374151',
                        fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                        {isSelected ? '✓ ' : ''}{veg}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )
        })()}

          {/* Custom Remarks */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Special Request / Kitchen Note
            </div>
            <input
              type="text"
              placeholder="e.g. Extra Spicy, No Onion, Less Mayo..."
              value={gyroNotes}
              onChange={e => setGyroNotes(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={handleAddStandardGyro} style={{ flex: 1, borderRadius: '12px' }}>
              Standard Item
            </Button>
            <Button variant="primary" onClick={handleAddGyroWithCustomization} style={{ flex: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>
              Add Customized Item • ₹{customizingItem?.price}
            </Button>
          </div>

        </div>
      </Modal>

      {/* Order Success & Manual Re-print Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="🎉 Order Placed Successfully" size="md">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
            Order #{lastPlacedOrder?.orderNumber || lastPlacedOrder?.id}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
            Order sent to kitchen. Choose print option below if you need manual printouts:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => PrintService.printKOTAndBill(lastPlacedOrder, true)}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(230,57,70,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🖨️ Print KOT & Bill (Both)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => PrintService.printKOT(lastPlacedOrder, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                📄 Print KOT Only
              </button>

              <button
                onClick={() => PrintService.printBill(lastPlacedOrder, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                🧾 Print Bill Only
              </button>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                marginTop: '10px',
                padding: '10px',
                background: 'transparent',
                color: '#6b7280',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Done / New Order
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
