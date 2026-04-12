import { useState, useEffect } from 'react'
import { Users, ChefHat, Check, Clock, AlertCircle, Plus, Minus, Trash2, Send, ShoppingBag, RefreshCw, Bell, X, DollarSign, CreditCard, Smartphone } from 'lucide-react'
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

const sampleTables = [
  { id: 't1', number: 'T1', seats: 2, status: 'occupied', currentOrder: 3 },
  { id: 't2', number: 'T2', seats: 4, status: 'occupied', currentOrder: 5 },
  { id: 't3', number: 'T3', seats: 4, status: 'available', currentOrder: null },
  { id: 't4', number: 'T4', seats: 6, status: 'occupied', currentOrder: 2 },
  { id: 't5', number: 'T5', seats: 2, status: 'reserved', currentOrder: null },
  { id: 't6', number: 'T6', seats: 4, status: 'available', currentOrder: null },
  { id: 't7', number: 'T7', seats: 8, status: 'occupied', currentOrder: 8 },
  { id: 't8', number: 'T8', seats: 2, status: 'available', currentOrder: null },
]

const sampleActiveOrders = [
  { id: 1, table: 'T1', items: ['Zinger Burger x1', 'Pepsi x2'], status: 'preparing', time: '5 min', total: 437 },
  { id: 2, table: 'T2', items: ['Hot Wings x1', 'Fries x2'], status: 'ready', time: '12 min', total: 447 },
  { id: 3, table: 'T4', items: ['Family Bucket x1'], status: 'preparing', time: '3 min', total: 999 },
]

export default function Captain() {
  const toast = useToast()
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()
  const { addItem, updateItemQuantity, removeItem, clearOrder, currentOrder, getSubtotal, getTax, getTotal } = useOrderStore()

  const [activeTab, setActiveTab] = useState('tables')
  const [tables] = useState(sampleTables)
  const [activeOrders] = useState(sampleActiveOrders)
  const [selectedTable, setSelectedTable] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  const availableTables = tables.filter(t => t.status === 'available')
  const occupiedTables = tables.filter(t => t.status === 'occupied')
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing')
  const readyOrders = activeOrders.filter(o => o.status === 'ready')

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'available': return { bg: '#f0fdf4', border: '#10b981', text: '#166534' }
      case 'occupied': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
      case 'reserved': return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }
      default: return { bg: '#f9fafb', border: '#9ca3af', text: '#4b5563' }
    }
  }

  const selectTable = (table) => {
    setSelectedTable(table)
    setOrderItems([])
    setShowOrderModal(true)
  }

  const addToOrder = (item) => {
    const existing = orderItems.find(i => i.menuItemId === item.id)
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.menuItemId === item.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
      ))
    } else {
      setOrderItems([...orderItems, {
        menuItemId: item.id,
        menuItemName: item.name,
        price: item.price,
        quantity: 1,
        total: item.price
      }])
    }
    toast.success(`Added ${item.name}`)
  }

  const updateQty = (menuItemId, delta) => {
    setOrderItems(orderItems.map(i => {
      if (i.menuItemId === menuItemId) {
        const newQty = i.quantity + delta
        if (newQty <= 0) return null
        return { ...i, quantity: newQty, total: newQty * i.price }
      }
      return i
    }).filter(Boolean))
  }

  const removeFromOrder = (menuItemId) => {
    setOrderItems(orderItems.filter(i => i.menuItemId !== menuItemId))
  }

  const sendToKitchen = () => {
    if (orderItems.length === 0) {
      toast.error('Add items first')
      return
    }
    toast.success(`Order sent to kitchen for ${selectedTable?.number}`)
    setShowOrderModal(false)
    setOrderItems([])
    setSelectedTable(null)
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
        color: 'white',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Captain Panel</h1>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>Order Taking</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{readyOrders.length}</div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Ready</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{occupiedTables.length}</div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Occupied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: '80px',
        zIndex: 99
      }}>
        {[
          { id: 'tables', label: 'Tables', icon: Users, count: tables.length },
          { id: 'orders', label: 'Orders', icon: ChefHat, count: activeOrders.length },
          { id: 'ready', label: 'Ready', icon: Bell, count: readyOrders.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px',
              background: activeTab === tab.id ? '#fef2f2' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #e63946' : '2px solid transparent',
              color: activeTab === tab.id ? '#e63946' : '#6b7280',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? '#e63946' : '#6b7280',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <>
            {/* Occupied Tables */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Active Tables ({occupiedTables.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {occupiedTables.map(table => {
                  const status = getTableStatusColor(table.status)
                  return (
                    <button
                      key={table.id}
                      onClick={() => selectTable(table)}
                      style={{
                        padding: '16px',
                        background: status.bg,
                        border: `2px solid ${status.border}`,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: status.text }}>{table.number}</span>
                        <span style={{ fontSize: '11px', color: status.text }}>
                          <Users size={12} /> {table.seats}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: status.text }}>
                        {table.currentOrder ? `${table.currentOrder} items ordered` : 'Ordering...'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Available Tables */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Available Tables ({availableTables.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {availableTables.map(table => {
                  const status = getTableStatusColor('available')
                  return (
                    <button
                      key={table.id}
                      onClick={() => selectTable(table)}
                      style={{
                        padding: '16px',
                        background: status.bg,
                        border: `2px solid ${status.border}`,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 700, color: status.text }}>{table.number}</div>
                      <div style={{ fontSize: '11px', color: status.text }}>{table.seats} seats</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Active Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {preparingOrders.map(order => (
              <div key={order.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{order.table}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                      <Clock size={12} /> {order.time}
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: '#fffbeb',
                    color: '#f59e0b',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    Preparing
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                  {order.items.join(', ')}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                  ₹{order.total}
                </div>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                <ChefHat size={48} style={{ marginBottom: '16px' }} />
                <p>No orders in kitchen</p>
              </div>
            )}
          </div>
        )}

        {/* Ready Orders Tab */}
        {activeTab === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readyOrders.map(order => (
              <div key={order.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '2px solid #10b981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{order.table}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                      Ready to serve!
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: '#f0fdf4',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    <Check size={12} /> Ready
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                  {order.items.join(', ')}
                </div>
                <Button fullWidth>
                  <Check size={16} />
                  Served
                </Button>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                <Bell size={48} style={{ marginBottom: '16px' }} />
                <p>No orders ready</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => { setShowOrderModal(false); setOrderItems([]); setSelectedTable(null) }}
        title={`Order for ${selectedTable?.number}`}
        size="full"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', flexShrink: 0 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: !selectedCategory ? '#e63946' : '#f3f4f6',
                color: !selectedCategory ? 'white' : '#6b7280',
                fontWeight: 600,
                fontSize: '12px',
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
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: selectedCategory === cat.id ? cat.color : '#f3f4f6',
                  color: selectedCategory === cat.id ? 'white' : '#6b7280',
                  fontWeight: 600,
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{categoryIcons[cat.name]?.[0]}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div style={{ flex: 1, overflow: 'auto', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {menuItems
                .filter(item => !selectedCategory || item.categoryId === selectedCategory)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToOrder(item)}
                    style={{
                      padding: 0,
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      height: '60px',
                      background: categories.find(c => c.id === item.categoryId)?.color || '#6b7280',
                      opacity: 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px'
                    }}>
                      {categoryIcons[categories.find(c => c.id === item.categoryId)?.name] || '🍽️'}
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.2, marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                        ₹{item.price}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '16px',
            padding: '16px',
            maxHeight: '200px',
            overflow: 'auto',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Current Order</h4>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{orderItems.length} items</span>
            </div>

            {orderItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Tap items to add</p>
            ) : (
              <>
                {orderItems.map(item => (
                  <div key={item.menuItemId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.menuItemName}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>₹{item.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => updateQty(item.menuItemId, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.menuItemId, 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e63946', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 600 }}>₹{item.total}</span>
                    <button onClick={() => removeFromOrder(item.menuItemId)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Tax (18%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: '#e63946' }}>₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Send Button */}
          <Button fullWidth size="lg" onClick={sendToKitchen} disabled={orderItems.length === 0} style={{ marginTop: '12px' }}>
            <Send size={18} />
            Send to Kitchen
          </Button>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 16px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('tables')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '8px 16px',
            background: activeTab === 'tables' ? '#fef2f2' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: activeTab === 'tables' ? '#e63946' : '#9ca3af',
            cursor: 'pointer'
          }}
        >
          <Users size={22} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Tables</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '8px 16px',
            background: activeTab === 'orders' ? '#fef2f2' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: activeTab === 'orders' ? '#e63946' : '#9ca3af',
            cursor: 'pointer'
          }}
        >
          <ChefHat size={22} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '8px 16px',
            background: activeTab === 'ready' ? '#f0fdf4' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: activeTab === 'ready' ? '#10b981' : '#9ca3af',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {readyOrders.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '12px',
              width: '18px',
              height: '18px',
              background: '#10b981',
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {readyOrders.length}
            </span>
          )}
          <Bell size={22} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>Ready</span>
        </button>
      </nav>
    </div>
  )
}
