import { useState, useEffect } from 'react'
import { RefreshCw, Check, X, Clock, AlertCircle, Wifi, WifiOff, ChevronRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useOnlineOrderStore } from '../stores/onlineOrderStore'
import { getSocket, connectToOnline } from '../lib/socket'

const aggregatorColors = {
  swiggy: '#ff5200',
  zomato: '#e23744',
  zepto: '#9d2b6b',
  direct: '#4895ef'
}

const statusLabels = {
  received: 'New',
  accepted: 'Preparing',
  preparing: 'Preparing',
  ready: 'Ready',
  'out-for-delivery': 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const statusColors = {
  received: 'var(--accent-warning)',
  accepted: 'var(--accent-info)',
  preparing: 'var(--accent-info)',
  ready: 'var(--accent-success)',
  'out-for-delivery': 'var(--accent-secondary)',
  delivered: 'var(--accent-success)',
  cancelled: 'var(--accent-primary)'
}

export default function OnlineOrders() {
  const {
    onlineOrders, aggregators, loading,
    fetchOnlineOrders, fetchAggregators,
    acceptOrder, updateStatus, toggleAggregatorStatus
  } = useOnlineOrderStore()

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    connectToOnline()
    fetchOnlineOrders()
    fetchAggregators()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('online-order:new', () => {
      fetchOnlineOrders()
    })

    socket.on('online-order:status', () => {
      fetchOnlineOrders()
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('online-order:new')
      socket.off('online-order:status')
    }
  }, [])

  const newOrders = onlineOrders.filter(o => o.platformStatus === 'received')
  const preparingOrders = onlineOrders.filter(o => ['accepted', 'preparing'].includes(o.platformStatus))

  const handleAccept = async (order) => {
    await acceptOrder(order.aggregator, order.id, 30)
  }

  const handleReady = async (order) => {
    await updateStatus(order.aggregator, order.id, 'ready')
  }

  const getTimeElapsed = (createdAt) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    if (mins < 1) return 'Just now'
    return `${mins}m ago`
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 104px)' }}>
      {/* Left Panel - Order Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Aggregator Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            {aggregators.map(a => (
              <div
                key={a.id}
                onClick={() => setShowConfigModal(true)}
                style={{
                  padding: '8px 16px',
                  background: a.isActive ? aggregatorColors[a.name] : 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  opacity: a.isActive ? 1 : 0.5
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.isActive ? 'var(--accent-success)' : 'var(--text-muted)' }} />
                <span style={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>{a.name}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: connected ? 'var(--accent-success)' : 'var(--accent-primary)' }}>
              {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            <Button variant="secondary" onClick={fetchOnlineOrders}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* New Orders */}
        <div>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '12px', color: 'var(--accent-warning)' }}>
            NEW ORDERS ({newOrders.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {newOrders.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px' }}>
                No new orders
              </div>
            ) : (
              newOrders.map(order => (
                <Card
                  key={order.id}
                  padding="none"
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    animation: 'pulse 2s infinite',
                    borderColor: aggregatorColors[order.aggregator]
                  }}
                >
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        background: aggregatorColors[order.aggregator],
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    >
                      {order.aggregator.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px' }}>
                        {order.externalOrderId}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {order.customerName || 'Customer'} • {getTimeElapsed(order.createdAt)}
                      </div>
                    </div>
                    <Button onClick={() => handleAccept(order)}>
                      Accept
                    </Button>
                    <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', marginBottom: '12px' }}>
            IN PROGRESS ({preparingOrders.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {preparingOrders.map(order => (
              <Card
                key={order.id}
                padding="none"
                onClick={() => setSelectedOrder(order)}
                hover
              >
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: aggregatorColors[order.aggregator],
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '10px'
                    }}
                  >
                    {order.aggregator.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px' }}>
                      {order.externalOrderId}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {order.customerName} • Est. {order.estimatedTime}m
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      background: statusColors[order.platformStatus],
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'white'
                    }}
                  >
                    {statusLabels[order.platformStatus]}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Order Details */}
      <div
        style={{
          width: '400px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {selectedOrder ? (
          <>
            <div
              style={{
                padding: '24px',
                background: aggregatorColors[selectedOrder.aggregator],
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'white' }}>
                  {selectedOrder.externalOrderId}
                </div>
                <div style={{ color: 'white', opacity: 0.8, textTransform: 'capitalize' }}>
                  via {selectedOrder.aggregator}
                </div>
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                {statusLabels[selectedOrder.platformStatus]}
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>CUSTOMER</h4>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                {selectedOrder.customerName || 'Not provided'}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {selectedOrder.customerPhone || 'No phone'}
              </div>

              {selectedOrder.customerAddress && (
                <>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '8px' }}>DELIVERY ADDRESS</h4>
                  <div style={{ color: 'var(--text-secondary)' }}>{selectedOrder.customerAddress}</div>
                </>
              )}

              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '8px' }}>ITEMS</h4>
              {selectedOrder.internalOrder?.items?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <span>{item.quantity}x {item.menuItemName}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.totalPrice}</span>
                </div>
              ))}

              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '8px' }}>ORDER VALUE</h4>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent-primary)' }}>
                ₹{selectedOrder.internalOrder?.total || 0}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                {selectedOrder.platformStatus === 'received' && (
                  <Button fullWidth onClick={() => handleAccept(selectedOrder)}>
                    <Check size={20} />
                    Accept Order
                  </Button>
                )}
                {['accepted', 'preparing'].includes(selectedOrder.platformStatus) && (
                  <Button fullWidth variant="success" onClick={() => handleReady(selectedOrder)}>
                    <Check size={20} />
                    Mark Ready
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <AlertCircle size={48} style={{ marginBottom: '16px' }} />
            <span>Select an order to view details</span>
          </div>
        )}
      </div>

      {/* Config Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Aggregator Settings"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {aggregators.map(a => (
            <Card key={a.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: aggregatorColors[a.name],
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  {a.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '18px' }}>{a.displayName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Default prep time: {a.defaultPrepTime}m
                  </div>
                </div>
                <Button
                  variant={a.isActive ? 'success' : 'secondary'}
                  onClick={() => toggleAggregatorStatus(a.id, !a.isActive)}
                >
                  {a.isActive ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}
