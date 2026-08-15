import { useState } from 'react'
import { QrCode, Printer, Check, Copy, Sparkles, ExternalLink } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function TableQRGenerator() {
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://tendengyros.com'
  const selfOrderUrl = `${baseUrl}/order`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selfOrderUrl)}`
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selfOrderUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          .qr-standee-card { break-inside: avoid; page-break-inside: avoid; border: 3px solid #000 !important; }
        }
      `}</style>

      {/* Header controls (no-print) */}
      <div className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QrCode size={30} color="#e63946" /> Universal Self-Ordering QR Standee
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Print & display this QR Standee at counter & tables so guests can Self-Order & Pay using their Name & Phone Number!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={handleCopyLink} style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 700 }}>
              {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />} {copied ? 'Link Copied!' : 'Copy Self-Order Link'}
            </Button>
            <Button onClick={handlePrint} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 800 }}>
              <Printer size={18} /> Print QR Standee
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions Card (no-print) */}
      <Card className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sparkles size={22} color="#e63946" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>How Guest Self-Ordering Works (No Tables Required)</h3>
        </div>
        <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Guests scan the QR code using their smartphone camera, select their favorite Gyros & Combos, enter their <strong>Full Name & Mobile Phone Number</strong>, pay via UPI (GPay/PhonePe) or at the counter, and receive their <strong>Order Token Number</strong> on screen. The POS and Kitchen display receive the order instantly!
        </p>
      </Card>

      {/* Standee Printable Preview Container */}
      <div className="print-area" style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="qr-standee-card"
            style={{
              width: '360px',
              background: 'linear-gradient(180deg, #1a1a2e 0%, #111827 100%)',
              color: 'white',
              borderRadius: '28px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '480px',
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div>
              <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', color: '#ffffff', marginBottom: '4px' }}>
                TENDENS GYROS 🌯
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                color: 'white',
                padding: '6px 18px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 900,
                display: 'inline-block',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(230,57,70,0.3)',
                marginBottom: '16px'
              }}>
                SCAN TO SELF-ORDER & PAY
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{
              background: 'white',
              padding: '18px',
              borderRadius: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              marginBottom: '16px'
            }}>
              <img
                src={qrImageUrl}
                alt="Tendens Gyros Self Order QR"
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>

            {/* Instructions Steps */}
            <div style={{ width: '100%' }}>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '12px 16px',
                marginBottom: '12px',
                fontSize: '12.5px',
                color: '#f3f4f6',
                lineHeight: 1.6,
                textAlign: 'left'
              }}>
                <div>1️⃣ <strong>Scan QR</strong> with Phone Camera</div>
                <div>2️⃣ <strong>Select Gyros & Combos</strong></div>
                <div>3️⃣ <strong>Enter Name & Mobile Number</strong></div>
                <div>4️⃣ <strong>Pay via UPI</strong> & Get Order Token</div>
              </div>

              <div style={{ fontSize: '11px', color: '#9ca3af', opacity: 0.8, fontFamily: 'monospace' }}>
                {selfOrderUrl}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
