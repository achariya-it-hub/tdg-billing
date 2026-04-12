import { useState, useEffect } from 'react'
import { Check, Clock, ChefHat, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getSocket, connectToKitchen } from '../lib/socket'

export default function Kitchen() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    connectToKitchen()
    fetchOrders()

    socket.on('kot:created', (kot) => {
      setOrders(prev => [{ ...kot, items: kot.items || [] }, ...prev])
    })

    socket.on('kot:updated', (kot) => {
      setOrders(prev => prev.map(o => o.id === kot.id ? { ...o, ...kot } : o))
    })

    socket.on('order:updated', (order) => {
      if (order.status === 'completed' || order.status === 'cancelled') {
        setOrders(prev => prev.filter(o => o.orderId !== order.id))
      }
    })

    return () => {
      socket.off('kot:created')
      socket.off('kot:updated')
      socket.off('order:updated')
    }
  }, [])

  const fetchOrders = async () => {
    const res = await fetch('/api/orders?status=preparing')
    const data = await res.json()
    setOrders(data.map(o => ({
      ...o,
      orderNumber: `K${o.orderNumber}`,
      items: o.items || []
    })))
  }

  const updateOrderStatus = async (orderId, status) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (status === 'ready' || status === 'completed') {
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    }
  }

  const getTimeElapsed = (createdAt) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    return mins
  }

  const getTimeColor = (mins) => {
    if (mins < 5) return 'var(--accent-success)'
    if (mins < 10) return 'var(--accent-warning)'
    return 'var(--accent-primary)'
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true
    return o.status === filter
  })

  // Mobile Kitchen Layout
  if (isMobile) {
    return (
      <div>
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {['all', 'pending', 'preparing', 'ready'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: 'auto'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Mobile Order Cards */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ChefHat size={64} style={{ marginBottom: '16px' }} />
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px' }}>No Active Orders</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map(order => {
              const mins = getTimeElapsed(order.createdAt)
              const isUrgent = mins >= 10

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    borderLeft: `4px solid ${getTimeColor(mins)}`
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    padding: '16px',
                    background: getTimeColor(mins),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'white' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ textAlign: 'right', color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono' }}>
                        <Clock size={14} />
                        {mins}m
                      </div>
                      {order.type && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>{order.type}</div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '12px' }}>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '10px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: item.status === 'ready' ? 'var(--accent-success)' : 'var(--bg-elevated)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}>
                          {item.status === 'ready' ? <Check size={16} /> : item.quantity}
                        </div>
                        <span style={{ flex: 1, fontWeight: 600, fontSize: '16px' }}>{item.menuItemName}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    {order.status === 'pending' && (
                      <Button fullWidth onClick={() => updateOrderStatus(order.id, 'preparing')}>
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button fullWidth variant="success" onClick={() => updateOrderStatus(order.id, 'ready')}>
                        <CheckCircle size={18} />
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button fullWidth variant="secondary" onClick={() => updateOrderStatus(order.id, 'completed')}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Desktop Kitchen Layout
  return (
    <div style={{ height: 'calc(100vh - 104px)' }}>
      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'preparing', 'ready'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={fetchOrders}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div
          style={{
            height: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            gap: '16px'
          }}
        >
          <ChefHat size={64} />
          <span style={{ fontSize: '24px', fontFamily: 'Bebas Neue' }}>No Active Orders</span>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {filteredOrders.map(order => {
            const mins = getTimeElapsed(order.createdAt)
            const isUrgent = mins >= 10

            return (
              <Card
                key={order.id}
                padding="none"
                style={{
                  overflow: 'hidden',
                  animation: isUrgent ? 'glow 2s infinite' : undefined
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    background: getTimeColor(mins),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Bebas Neue',
                      fontSize: '48px',
                      lineHeight: 1,
                      color: 'white'
                    }}
                  >
                    {order.orderNumber}
                  </span>
                  <div style={{ textAlign: 'right', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                        {mins}m
                      </span>
                    </div>
                    {order.type === 'delivery' && (
                      <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  {order.items.map((item, i) => (
                    <div
                      key={i}
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
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          background: item.status === 'ready' ? 'var(--accent-success)' : 'var(--bg-elevated)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {item.status === 'ready' ? <Check size={14} /> : item.quantity}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{item.menuItemName}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'pending' && (
                      <Button
                        fullWidth
                        size="md"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Start
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        fullWidth
                        variant="success"
                        size="md"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        <Check size={16} />
                        Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        fullWidth
                        variant="secondary"
                        size="md"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
