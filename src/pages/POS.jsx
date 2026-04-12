import { useState, useEffect } from 'react'
import { Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Wallet, ShoppingBag, X, ChevronDown, ChevronUp } from 'lucide-react'
import Card from '../components/ui/Card'
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

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  wallet: Wallet
}

export default function POS() {
  const toast = useToast()
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()
  const {
    currentOrder, addItem, updateItemQuantity, removeItem,
    setOrderType, setTableNumber, setCustomerName, clearOrder,
    holdOrder, recallOrder, heldOrders, getSubtotal, getTax, getTotal, placeOrder
  } = useOrderStore()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchMenuItems(selectedCategory)
    } else {
      fetchMenuItems()
    }
  }, [selectedCategory])

  const handlePlaceOrder = async (paymentMethod) => {
    if (!currentOrder.items || currentOrder.items.length === 0) {
      toast.error('Add items to place order')
      return
    }
    setProcessing(true)
    try {
      const result = await placeOrder(paymentMethod)
      console.log('Order result:', result)
      toast.success('Order placed successfully!')
      setShowPaymentModal(false)
      setShowCart(false)
    } catch (err) {
      console.error('Order error:', err)
      toast.error('Failed to place order: ' + err.message)
    }
    setProcessing(false)
  }

  // Mobile POS Layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              background: !selectedCategory ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: !selectedCategory ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                background: selectedCategory === cat.id ? cat.color : 'var(--bg-card)',
                color: selectedCategory === cat.id ? 'white' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{categoryIcons[cat.name]?.[0] || '🍽️'}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px'
            }}
          >
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.isAvailable && addItem({
                  menuItemId: item.id,
                  menuItemName: item.name,
                  unitPrice: item.price,
                  totalPrice: item.price
                })}
                style={{
                  padding: 0,
                  border: 'none',
                  borderRadius: '12px',
                  background: 'var(--bg-card)',
                  cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                  opacity: item.isAvailable ? 1 : 0.5,
                  textAlign: 'left',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '70px',
                    background: categories.find(c => c.id === item.categoryId)?.color || '#333',
                    opacity: 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px'
                  }}
                >
                  {!item.isAvailable && (
                    <span style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      OUT
                    </span>
                  )}
                  {item.isAvailable && (categoryIcons[categories.find(c => c.id === item.categoryId)?.name] || '🍽️')}
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px', lineHeight: 1.2 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    ₹{item.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Cart Summary */}
        <div
          onClick={() => setShowCart(true)}
          style={{
            marginTop: '12px',
            padding: '16px',
            background: 'var(--accent-primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingBag size={24} color="white" />
            <span style={{ color: 'white', fontWeight: 600 }}>
              {currentOrder.items.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>
            ₹{getTotal().toFixed(0)}
          </span>
        </div>

        {/* Mobile Cart Modal */}
        <Modal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          title="Your Order"
          size="full"
        >
          {/* Order Type */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['dine-in', 'takeaway', 'delivery'].map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: currentOrder.type === type ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: currentOrder.type === type ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {type === 'dine-in' ? 'Dine In' : type}
              </button>
            ))}
          </div>

          {currentOrder.type === 'dine-in' && (
            <input
              type="text"
              placeholder="Table Number"
              value={currentOrder.tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '12px',
                fontSize: '14px'
              }}
            />
          )}

          {/* Items */}
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
            {currentOrder.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No items yet
              </div>
            ) : (
              currentOrder.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-card)',
                    borderRadius: '10px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.menuItemName}</div>
                    <div style={{ color: 'var(--accent-secondary)', fontSize: '13px' }}>₹{item.unitPrice}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateItemQuantity(index, item.quantity - 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(index, item.quantity + 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div style={{ width: '60px', textAlign: 'right', fontWeight: 600 }}>
                    ₹{item.totalPrice}
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>₹{getSubtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax (18%)</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-primary)' }}>₹{getTotal().toFixed(2)}</span>
            </div>

            {/* Payment Methods */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.entries(paymentIcons).map(([method, Icon]) => (
                <button
                  key={method}
                  onClick={() => handlePlaceOrder(method)}
                  disabled={processing || currentOrder.items.length === 0}
                  style={{
                    padding: '16px',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    opacity: processing || currentOrder.items.length === 0 ? 0.5 : 1
                  }}
                >
                  <Icon size={28} />
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{method}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <Button variant="secondary" fullWidth onClick={clearOrder}>
                Clear
              </Button>
              {heldOrders.length > 0 && (
                <Button variant="secondary" fullWidth onClick={() => recallOrder(0)}>
                  Recall ({heldOrders.length})
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // Desktop POS Layout
  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 104px)' }}>
      {/* Categories Sidebar */}
      <div
        style={{
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: !selectedCategory ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: !selectedCategory ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          All Items
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: selectedCategory === cat.id ? cat.color : 'var(--bg-card)',
              color: selectedCategory === cat.id ? 'white' : 'var(--text-primary)',
              fontWeight: 600,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>{categoryIcons[cat.name] || '🍽️'}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px'
          }}
        >
          {menuItems.map(item => (
            <Card
              key={item.id}
              padding="none"
              hover
              onClick={() => item.isAvailable && addItem({
                menuItemId: item.id,
                menuItemName: item.name,
                unitPrice: item.price,
                totalPrice: item.price
              })}
              style={{
                opacity: item.isAvailable ? 1 : 0.5,
                cursor: item.isAvailable ? 'pointer' : 'not-allowed'
              }}
            >
              <div
                style={{
                  height: '100px',
                  background: `linear-gradient(135deg, ${categories.find(c => c.id === item.categoryId)?.color || '#333'}33, var(--bg-elevated))`,
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}
              >
                {!item.isAvailable && (
                  <span style={{
                    position: 'absolute',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    UNAVAILABLE
                  </span>
                )}
                {categoryIcons[categories.find(c => c.id === item.categoryId)?.name] || '🍽️'}
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  ₹{item.price}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Panel */}
      <div
        style={{
          width: '340px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Order Type Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            padding: '8px'
          }}
        >
          {['dine-in', 'takeaway', 'delivery'].map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: currentOrder.type === type ? 'var(--accent-primary)' : 'transparent',
                color: currentOrder.type === type ? 'white' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {type === 'dine-in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
            </button>
          ))}
        </div>

        {currentOrder.type === 'dine-in' && (
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="Table Number"
              value={currentOrder.tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {/* Order Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {currentOrder.items.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '12px'
              }}
            >
              <ShoppingBag size={48} />
              <span>Start adding items</span>
            </div>
          ) : (
            currentOrder.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.menuItemName}</div>
                  <div style={{ color: 'var(--accent-secondary)', fontSize: '13px' }}>₹{item.unitPrice}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'var(--bg-elevated)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ width: '70px', textAlign: 'right', fontWeight: 600 }}>
                  ₹{item.totalPrice}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Held Orders */}
        {heldOrders.length > 0 && (
          <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Held Orders ({heldOrders.length})
            </div>
            <div style={{ display: 'flex', gap: '8px', overflow: 'auto' }}>
              {heldOrders.map((order, i) => (
                <button
                  key={i}
                  onClick={() => recallOrder(i)}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  #{i + 1} ({order.items.length} items)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{getSubtotal().toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tax (18% GST)</span>
            <span>₹{getTax().toFixed(2)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '16px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border)'
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-primary)' }}>₹{getTotal().toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="md" onClick={holdOrder} style={{ flex: 1 }}>
              Hold
            </Button>
            <Button variant="secondary" size="md" onClick={clearOrder} style={{ flex: 1 }}>
              Clear
            </Button>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() => setShowPaymentModal(true)}
            disabled={currentOrder.items.length === 0}
            style={{ marginTop: '8px' }}
          >
            Pay ₹{getTotal().toFixed(2)}
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Method"
        size="sm"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {Object.entries(paymentIcons).map(([method, Icon]) => (
            <button
              key={method}
              onClick={() => handlePlaceOrder(method)}
              disabled={processing}
              style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={32} />
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{method}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
