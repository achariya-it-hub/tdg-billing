import { useState } from 'react'
import API_BASE from '../lib/apiConfig'

export default function CashfreeCheckout({ orderId, amount, customerName, customerPhone, onError }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/cashfree/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || `tdg_${Date.now()}`,
          amount,
          customerName: customerName || 'Guest',
          customerPhone: customerPhone || '9999999999'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      if (data.paymentSessionId) {
        window.location.href = `https://checkout.cashfree.com/pg?payment_session_id=${data.paymentSessionId}&mode=TEST`
      } else {
        throw new Error('No payment session received')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      onError?.(err.message)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0066ff, #0052cc)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {loading ? 'Redirecting to Cashfree...' : `Pay ₹${amount} via Cashfree`}
      </button>
      {error && (
        <div style={{ marginTop: '8px', padding: '10px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
