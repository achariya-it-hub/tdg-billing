import { useState, useEffect } from 'react'
import { Plus, Minus, Trash2, ShoppingBag, X } from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import { useMenuStore } from '../stores/menuStore'
import { useOrderStore } from '../stores/orderStore'

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
    holdOrder, recallOrder, heldOrders, getSubtotal, getTax, getTotal, placeOrder
  } = useOrderStore()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchCategories(); fetchMenuItems() }, [])
  useEffect(() => { selectedCategory ? fetchMenuItems(selectedCategory) : fetchMenuItems() }, [selectedCategory])

  const handlePlaceOrder = async () => {
    if (!currentOrder.items || currentOrder.items.length === 0) { toast.error('Add items to place order'); return }
    setProcessing(true)
    try { await placeOrder(); toast.success('Order placed successfully!'); setShowCart(false) }
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
    return (
      <div
        onClick={() => item.isAvailable && addItem({ menuItemId: item.id, menuItemName: item.name, unitPrice: item.price, totalPrice: item.price })}
        style={{
          ...menuItemCard,
          opacity: item.isAvailable ? 1 : 0.5,
          cursor: item.isAvailable ? 'pointer' : 'not-allowed'
        }}
        onMouseEnter={(e) => { if (item.isAvailable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div style={{
          height: isMobile ? '60px' : '90px',
          background: `linear-gradient(135deg, ${cat?.color || '#333'}22, ${cat?.color || '#333'}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '28px' : '40px'
        }}>
          {!item.isAvailable && <span style={{ background: '#e63946', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>UNAVAILABLE</span>}
          {item.isAvailable && (categoryIcons[cat?.name] || '🍽️')}
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
        <div style={{ color: '#e63946', fontSize: '12px', fontWeight: 500 }}>₹{item.unitPrice}</div>
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
            {['dine-in', 'takeaway', 'delivery'].map(type => (
              <button key={type} onClick={() => setOrderType(type)} style={orderTypeBtn(currentOrder.type === type)}>
                {type === 'dine-in' ? 'Dine In' : type}
              </button>
            ))}
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
          {['dine-in', 'takeaway', 'delivery'].map(type => (
            <button key={type} onClick={() => setOrderType(type)} style={orderTypeBtn(currentOrder.type === type)}>
              {type === 'dine-in' ? 'Dine In' : type}
            </button>
          ))}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>Subtotal</span><span style={{ fontSize: '13px' }}>₹{getSubtotal().toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>CGST (2.5%)</span><span style={{ fontSize: '13px' }}>₹{(getTax() / 2).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280', fontSize: '13px' }}>SGST (2.5%)</span><span style={{ fontSize: '13px' }}>₹{(getTax() / 2).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, marginBottom: '12px', paddingTop: '8px', borderTop: '2px solid #1a1a2e' }}>
            <span>Total</span><span style={{ color: '#e63946' }}>₹{getTotal().toFixed(2)}</span>
          </div>
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
    </div>
  )
}
