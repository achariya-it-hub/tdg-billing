import { useState } from 'react'
import { QrCode, Printer, Table, Check, ExternalLink, Sparkles } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function TableQRGenerator() {
  const [tableCount, setTableCount] = useState(12)
  const [customTableNames, setCustomTableNames] = useState('Table 1, Table 2, Table 3, Table 4, Table 5, Table 6, Table 7, Table 8, Table 9, Table 10, Table 11, Table 12')
  const [mode, setMode] = useState('numeric') // numeric | custom
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://tendengyros.com'

  const getTables = () => {
    if (mode === 'numeric') {
      const list = []
      for (let i = 1; i <= Math.max(1, Math.min(50, tableCount)); i++) {
        list.push({ id: `table_${i}`, name: `Table ${i}`, number: i })
      }
      return list
    } else {
      return customTableNames.split(/[\n,]+/).map((t, idx) => {
        const name = t.trim() || `Table ${idx + 1}`
        return { id: `table_custom_${idx + 1}`, name, number: idx + 1 }
      }).filter(t => t.name)
    }
  }

  const tables = getTables()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hide controls during printing */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          .table-standee { break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px !important; border: 2px solid #000 !important; }
        }
      `}</style>

      {/* Header controls (no-print) */}
      <div className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QrCode size={30} color="#e63946" /> Table QR Standee Generator
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Generate & print QR code acrylic standees for guests to Self-Order & Pay directly from their table!
            </p>
          </div>

          <Button onClick={handlePrint} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 800 }}>
            <Printer size={18} /> Print All Table QR Standees
          </Button>
        </div>
      </div>

      {/* Controls Card (no-print) */}
      <Card className="no-print" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>Configure Tables</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              Number of Restaurant Tables
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[6, 10, 12, 15, 20, 30].map(count => (
                <button
                  key={count}
                  onClick={() => { setTableCount(count); setMode('numeric') }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: tableCount === count && mode === 'numeric' ? '2px solid #e63946' : '1px solid #d1d5db',
                    background: tableCount === count && mode === 'numeric' ? '#fff5f5' : 'white',
                    color: tableCount === count && mode === 'numeric' ? '#e63946' : '#374151',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  {count} Tables
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              Self-Ordering Base Web URL
            </label>
            <input
              type="text"
              readOnly
              value={`${baseUrl}/kiosk?table=`}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #d1d5db', background: '#f8fafc', fontSize: '13px', fontFamily: 'monospace'
              }}
            />
          </div>
        </div>
      </Card>

      {/* Standees Printable Grid */}
      <div className="print-area" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {tables.map(table => {
          const qrTargetUrl = `${baseUrl}/kiosk?table=${encodeURIComponent(table.name)}&mode=dine-in`
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrTargetUrl)}`

          return (
            <div
              key={table.id}
              className="table-standee"
              style={{
                background: 'linear-gradient(180deg, #1a1a2e 0%, #111827 100%)',
                color: 'white',
                borderRadius: '24px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '440px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Brand Header */}
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', color: '#ffffff', marginBottom: '2px' }}>
                  TEN DEN GYROS 🌯
                </div>
                <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Self-Order & Pay from Table
                </div>
              </div>

              {/* Table Pill */}
              <div style={{
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(230,57,70,0.4)',
                marginTop: '12px',
                marginBottom: '14px',
                letterSpacing: '0.5px'
              }}>
                📍 {table.name.toUpperCase()}
              </div>

              {/* QR Code Container */}
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                marginBottom: '14px'
              }}>
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${table.name}`}
                  style={{ width: '170px', height: '170px', display: 'block' }}
                />
              </div>

              {/* Instructions */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }}>
                  1. Scan QR Code & View Menu
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                  2. Select Items & Pay via UPI / Card
                </div>
                <div style={{ fontSize: '10.5px', color: '#9ca3af', opacity: 0.8, fontFamily: 'monospace' }}>
                  {qrTargetUrl}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
