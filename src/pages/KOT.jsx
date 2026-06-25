import { useState, useEffect } from 'react'
import { Check, AlertTriangle, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, Printer, X } from 'lucide-react'
import { getSocket, connectToKitchen } from '../lib/socket'
import PrintService from '../lib/printService'

export default function KOT() {
  const [orders, setOrders] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [connected, setConnected] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelPin, setCancelPin] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelProcessing, setCancelProcessing] = useState(false)

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
      // Demo mode - use local storage orders
      const stored = localStorage.getItem('tdg-orders-storage')
      if (stored) {
        const data = JSON.parse(stored)
        const ordersList = data.state?.orders || []
        setOrders(ordersList.map(o => ({
          ...o,
          orderNumber: `K${o.orderNumber}`,
          items: (o.items || []).map(i => ({ ...i, isCompleted: false }))
        })).filter(o => o.status === 'pending'))
      }
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

  const getApiUrl = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin
  }

  const bumpOrder = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
    // Sync with backend - mark as ready so billing can see it
    try {
      await fetch(`${getApiUrl()}/api/pos/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' })
      })
    } catch (err) {
      console.error('Failed to sync bump:', err)
    }
  }

  const closeCancelModal = () => { setShowCancelModal(false); setCancelPin(''); setCancelError('') }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) { setCancelError('Please enter a cancellation reason'); return }
    if (cancelPin.length < 4) { setCancelError('Please enter a 4-digit PIN'); return }
    setCancelProcessing(true)
    setCancelError('')
    try {
      const res = await fetch(`${getApiUrl()}/api/billing/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cancelPin })
      })
      const data = await res.json()
      if (!res.ok || !data.user) { setCancelError('Invalid PIN'); setCancelProcessing(false); return }
      const role = data.user.role
      if (role !== 'admin' && role !== 'manager' && role !== 'super-admin') { setCancelError('Only Manager, Admin, or Super Admin can cancel KOT'); setCancelProcessing(false); return }
      await fetch(`${getApiUrl()}/api/pos/orders/${currentOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancelReason: cancelReason.trim(), cancelledBy: data.user.name })
      })
      setOrders(prev => prev.filter(o => o.id !== currentOrder.id))
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
      setShowCancelModal(false)
      setCancelPin('')
    } catch { setCancelError('Network error. Try again.'); setCancelProcessing(false) }
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
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
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
              color: '#9ca3af'
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
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {/* Order Header */}
            <div
              style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
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
                    background: item.isCompleted ? 'linear-gradient(135deg, #2a9d8f, #21867a)' : 'rgba(0,0,0,0.03)',
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
                      background: item.isCompleted ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
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
                      color: item.isCompleted ? 'white' : '#1a1a2e',
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
                    background: 'rgba(0,0,0,0.04)',
                    color: '#e63946',
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
                <button
                  onClick={() => { setCancelReason(''); setShowCancelModal(true) }}
                  style={{
                    padding: '24px',
                    fontSize: '14px',
                    fontFamily: 'Bebas Neue',
                    fontWeight: 600,
                    background: 'rgba(239,68,68,0.08)',
                    color: '#dc2626',
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
                  ✕ Cancel
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
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.3)',
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
              borderRadius: '16px',
              background: currentIndex === 0 ? 'rgba(0,0,0,0.03)' : 'linear-gradient(135deg, #e63946, #c1121f)',
              border: 'none',
              color: currentIndex === 0 ? '#9ca3af' : 'white',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: currentIndex === 0 ? 'none' : '0 2px 8px rgba(230,57,70,0.3)'
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', fontWeight: 600 }}>
            {currentIndex + 1} / {orders.length}
          </span>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(orders.length - 1, prev + 1))}
            disabled={currentIndex === orders.length - 1}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: currentIndex === orders.length - 1 ? 'rgba(0,0,0,0.03)' : 'linear-gradient(135deg, #e63946, #c1121f)',
              border: 'none',
              color: currentIndex === orders.length - 1 ? '#9ca3af' : 'white',
              cursor: currentIndex === orders.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: currentIndex === orders.length - 1 ? 'none' : '0 2px 8px rgba(230,57,70,0.3)'
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', borderRadius: '24px', padding: '32px',
            width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Cancel KOT {currentOrder?.orderNumber}
              </h3>
              <button onClick={closeCancelModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>

            <textarea
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{
                width: '100%', minHeight: '100px', padding: '12px',
                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                fontSize: '14px', background: 'white',
                color: '#1a1a2e', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
                fontFamily: 'inherit', marginBottom: '16px'
              }}
            />

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Authorize (Manager / Admin PIN)
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: cancelPin.length > i ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(0,0,0,0.04)',
                    border: `2px solid ${cancelPin.length > i ? '#e63946' : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: cancelPin.length > i ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
                  }}>
                    {cancelPin.length > i && (
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white' }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((key, i) => (
                  key === '' ? <div key={i} /> : (
                    <button
                      key={i}
                      onClick={() => {
                        if (key === '⌫') setCancelPin(p => p.slice(0, -1))
                        else if (cancelPin.length < 4) setCancelPin(p => p + key)
                      }}
                      style={{
                        height: '52px', borderRadius: '12px', border: 'none',
                        background: key === '⌫' ? 'rgba(0,0,0,0.04)' : 'white',
                        color: '#1a1a2e', fontSize: '20px', fontWeight: 600,
                        cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {key === '⌫' ? '⌫' : key}
                    </button>
                  )
                ))}
              </div>
              {cancelError && (
                <div style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>{cancelError}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closeCancelModal}
                style={{
                  flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(0,0,0,0.04)', color: '#4b5563'
                }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelProcessing}
                style={{
                  flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 600, cursor: cancelProcessing ? 'not-allowed' : 'pointer',
                  background: cancelProcessing ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  boxShadow: cancelProcessing ? 'none' : '0 2px 8px rgba(220,38,38,0.3)'
                }}
              >
                {cancelProcessing ? 'Verifying...' : 'Cancel KOT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
