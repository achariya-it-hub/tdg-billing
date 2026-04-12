import { useState, useEffect } from 'react'
import { Check, AlertTriangle, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import { getSocket, connectToKitchen } from '../lib/socket'
import PrintService from '../lib/printService'

export default function KOT() {
  const [orders, setOrders] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    connectToKitchen()
    fetchOrders()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('kot:created', (kot) => {
      setOrders(prev => [{
        ...kot,
        items: (kot.items || []).map(i => ({ ...i, isCompleted: false }))
      }, ...prev])
      
      // Auto-print new KOT
      PrintService.printKOT(kot)
    })

    socket.on('kot:updated', (kot) => {
      setOrders(prev => prev.map(o => o.id === kot.id ? { ...o, ...kot } : o))
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('kot:created')
      socket.off('kot:updated')
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?status=preparing')
      const data = await res.json()
      setOrders(data.map(o => ({
        ...o,
        orderNumber: `K${o.orderNumber}`,
        items: (o.items || []).map(i => ({ ...i, isCompleted: false }))
      })))
    } catch (err) {
      console.error('Failed to fetch orders')
    }
  }

  const toggleItem = (orderIndex, itemIndex) => {
    setOrders(prev => prev.map((order, oi) => {
      if (oi !== orderIndex) return order
      return {
        ...order,
        items: order.items.map((item, ii) => {
          if (ii !== itemIndex) return item
          return { ...item, isCompleted: !item.isCompleted }
        })
      }
    }))
  }

  const bumpOrder = async (orderId) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ready' })
    })
    setOrders(prev => prev.filter(o => o.id !== orderId))
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const currentOrder = orders[currentIndex]
  const completedCount = currentOrder?.items.filter(i => i.isCompleted).length || 0
  const allCompleted = currentOrder?.items.every(i => i.isCompleted) || false

  return (
    <div
      style={{
        height: 'calc(100vh - 104px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)'
      }}
    >
      {/* Status Bar */}
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: connected ? 'var(--accent-success)' : 'var(--accent-primary)',
              animation: connected ? undefined : 'pulse 1s infinite'
            }}
          />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {orders.length} active orders
        </span>
        <button
          onClick={fetchOrders}
          style={{
            background: 'var(--bg-secondary)',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Order Display */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍽️</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px' }}>No Active Orders</div>
          </div>
        ) : currentOrder ? (
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'var(--bg-card)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px var(--shadow)'
            }}
          >
            {/* Order Header */}
            <div
              style={{
                padding: '32px',
                background: 'var(--accent-primary)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '72px', lineHeight: 1, color: 'white' }}>
                {currentOrder.orderNumber}
              </div>
              <div style={{ color: 'white', opacity: 0.8, marginTop: '8px' }}>
                {currentOrder.type === 'dine-in' ? `Table ${currentOrder.tableNumber}` : currentOrder.type}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '4px', background: 'var(--bg-secondary)' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--accent-success)',
                  width: `${(completedCount / currentOrder.items.length) * 100}%`,
                  transition: 'width 0.3s'
                }}
              />
            </div>

            {/* Items */}
            <div style={{ padding: '24px' }}>
              {currentOrder.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => toggleItem(currentIndex, index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    marginBottom: '12px',
                    background: item.isCompleted ? 'var(--accent-success)' : 'var(--bg-secondary)',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: item.isCompleted ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '20px'
                    }}
                  >
                    {item.isCompleted ? '✓' : item.quantity}
                  </div>
                  <span
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: 'white',
                      textDecoration: item.isCompleted ? 'line-through' : 'none',
                      opacity: item.isCompleted ? 0.7 : 1
                    }}
                  >
                    {item.menuItemName}
                  </span>
                </button>
              ))}
            </div>

{/* Action Buttons */}
             <div style={{ padding: '24px', paddingTop: 0, display: 'flex', gap: '12px' }}>
               <button
                 onClick={() => bumpOrder(currentOrder.id)}
                 disabled={!allCompleted}
                 style={{
                   flex: 1,
                   padding: '24px',
                   fontSize: '20px',
                   fontFamily: 'Bebas Neue',
                   fontWeight: 700,
                   background: allCompleted ? 'var(--accent-success)' : 'var(--bg-secondary)',
                   color: allCompleted ? 'white' : 'var(--text-muted)',
                   border: 'none',
                   borderRadius: '16px',
                   cursor: allCompleted ? 'pointer' : 'not-allowed',
                   letterSpacing: '1px',
                   transition: 'all 0.2s'
                 }}
               >
                 {allCompleted ? '✓ BUMP ORDER' : `${completedCount}/${currentOrder.items.length} ITEMS READY`}
               </button>
               <button
                 onClick={() => PrintService.printKOT(currentOrder)}
                 style={{
                   flex: 1,
                   padding: '24px',
                   fontSize: '16px',
                   fontFamily: 'Bebas Neue',
                   fontWeight: 600,
                   background: 'var(--bg-secondary)',
                   color: 'var(--accent-primary)',
                   border: 'none',
                   borderRadius: '16px',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px',
                   transition: 'all 0.2s'
                 }}
               >
                 <Printer size={20} />
                 Print
               </button>
             </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      {orders.length > 1 && (
        <div
          style={{
            padding: '24px',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
          }}
        >
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: 'none',
              color: currentIndex === 0 ? 'var(--text-muted)' : 'white',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '18px' }}>
            {currentIndex + 1} / {orders.length}
          </span>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(orders.length - 1, prev + 1))}
            disabled={currentIndex === orders.length - 1}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: 'none',
              color: currentIndex === orders.length - 1 ? 'var(--text-muted)' : 'white',
              cursor: currentIndex === orders.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  )
}
