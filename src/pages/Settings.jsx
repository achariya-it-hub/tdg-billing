import { useState, useEffect, useRef } from 'react'
import { Building2, Database, Printer, Palette, CreditCard, Save, Upload, Download, RotateCcw, X, Plus, Trash2, Key, ShieldCheck, Tag, Image as ImageIcon } from 'lucide-react'
import API_BASE from '../lib/apiConfig'
import { useSettings } from '../lib/settingsContext'
import { clearSettingsCache } from '../lib/getCompanyInfo'

const TABS = [
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
  { id: 'offers', label: 'App Offers Manager', icon: Tag },
  { id: 'images', label: 'App Image Manager', icon: ImageIcon },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'printers', label: 'Printers', icon: Printer },
  { id: 'theme', label: 'Theme', icon: Palette },
]

export default function Settings() {
  const { settings, reloadSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('company')
  const [pin, setPin] = useState('')
  const [showPinModal, setShowPinModal] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [pinError, setPinError] = useState('')

  const handlePinSubmit = () => {
    if (pin.length !== 4) { setPinError('Enter 4-digit PIN'); return }
    setPinError('')
    setAuthenticated(true)
    setShowPinModal(false)
  }

  if (!authenticated) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.3)', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: '8px' }}>Super Admin Access</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>Enter your super admin PIN to access settings</p>
          {pinError && <div style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>{pinError}</div>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: i < pin.length ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }} />
            ))}
          </div>
          <input
            type="password" maxLength={4} autoFocus
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '24px', textAlign: 'center', letterSpacing: '12px', marginBottom: '16px', outline: 'none' }}
          />
          <button onClick={handlePinSubmit} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px',
            cursor: 'pointer', background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
            boxShadow: '0 4px 16px rgba(230,57,70,0.3)'
          }}>Verify PIN</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>Settings</h1>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
              borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.75)',
              color: activeTab === tab.id ? 'white' : '#4b5563',
              backdropFilter: 'blur(10px)', boxShadow: activeTab === tab.id ? '0 4px 16px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s'
            }}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && <CompanyTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'payment' && <PaymentGatewaysTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'offers' && <OffersTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'images' && <ImagesTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'data' && <DataTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'printers' && <PrintersTab pin={pin} settings={settings} onSaved={reloadSettings} />}
      {activeTab === 'theme' && <ThemeTab pin={pin} settings={settings} onSaved={reloadSettings} />}
    </div>
  )
}

function PaymentGatewaysTab({ pin, settings, onSaved }) {
  const ccConfig = settings?.paymentGateways?.ccavenue || {}
  const [form, setForm] = useState({
    merchantId: ccConfig.merchantId || '',
    workingKey: ccConfig.workingKey || '',
    accessCode: ccConfig.accessCode || '',
    isProduction: ccConfig.isProduction || false,
    isEnabled: ccConfig.isEnabled !== false,
    enableAssetOtp: settings?.paymentGateways?.enableAssetOtp !== false
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/payment-gateways`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, ccavenue: form, enableAssetOtp: form.enableAssetOtp })
      })
      const data = await res.json()
      if (data.success) {
        setMsg('Settings Saved!')
        clearSettingsCache()
        onSaved()
      } else {
        setMsg(data.error || 'Failed to save settings')
      }
    } catch (e) {
      setMsg('Network error')
    }
    setSaving(false)
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CreditCard size={22} color="#e63946" /> Payment Gateway & Verification
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        Configure CCAvenue Merchant credentials and toggle phone OTP options.
      </p>

      {msg && (
        <div style={{
          background: msg.includes('Saved') ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          color: msg.includes('Saved') ? '#16a34a' : '#dc2626',
          padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', fontWeight: 600
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Merchant ID (Merchant Code)</label>
          <input
            style={inputStyle}
            placeholder="e.g. 2389401"
            value={form.merchantId}
            onChange={e => setForm({ ...form, merchantId: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Access Code</label>
          <input
            style={inputStyle}
            placeholder="e.g. AVXX00XX00XX"
            value={form.accessCode}
            onChange={e => setForm({ ...form, accessCode: e.target.value })}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Working Key (Encryption Key)</label>
        <input
          type="password"
          style={inputStyle}
          placeholder="e.g. 32-character working key"
          value={form.workingKey}
          onChange={e => setForm({ ...form, workingKey: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={e => setForm({ ...form, isEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#e63946' }}
            />
            Enable CCAvenue Gateway
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={form.isProduction}
              onChange={e => setForm({ ...form, isProduction: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#e63946' }}
            />
            Production Mode (Live URL)
          </label>
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', marginTop: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
            <input
              type="checkbox"
              checked={form.enableAssetOtp}
              onChange={e => setForm({ ...form, enableAssetOtp: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#e63946' }}
            />
            Require Mobile OTP (Firebase SMS) for Adding Assets
          </label>
          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '28px', display: 'block', marginTop: '2px' }}>
            If disabled, new assets (referred friends) are verified and activated instantly without sending SMS validation codes.
          </span>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={btnPrimary}>
        {saving ? 'Saving...' : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  )
}

const glassCard = {
  background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
}
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }
const btnPrimary = { padding: '12px 24px', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white', boxShadow: '0 4px 16px rgba(230,57,70,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }

function CompanyTab({ pin, settings, onSaved }) {
  const [form, setForm] = useState(settings?.company || {})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/company`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, ...form })
      })
      const data = await res.json()
      if (data.success) { setMsg('Saved!'); clearSettingsCache(); onSaved() }
      else setMsg(data.error || 'Failed')
    } catch (e) { setMsg('Network error') }
    setSaving(false)
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Building2 size={20} color="#e63946" /> Company Information
      </h3>
      {msg && <div style={{ background: msg === 'Saved!' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: msg === 'Saved!' ? '#16a34a' : '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Company Name</label>
          <input style={inputStyle} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>GST Number</label>
          <input style={inputStyle} value={form.gst || ''} onChange={e => setForm({ ...form, gst: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Address</label>
        <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
      </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>UPI ID / VPA</label>
          <input style={inputStyle} value={form.upiId || ''} onChange={e => setForm({ ...form, upiId: e.target.value })} placeholder="e.g. merchant@upi" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Logo</label>
        {form.logo && <img src={form.logo} alt="Logo" style={{ height: '60px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ ...btnPrimary, fontSize: '13px', padding: '8px 16px', cursor: 'pointer' }}>
            <Upload size={16} /> Upload Logo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
              const file = e.target.files[0]; if (!file) return
              const formData = new FormData()
              formData.append('file', file)
              const res = await fetch(`${API_BASE}/api/settings/upload-logo?pin=${pin}`, {
                method: 'POST', body: formData
              })
              const data = await res.json()
              if (data.success) { setForm({ ...form, logo: data.logo }); clearSettingsCache(); onSaved() }
            }} />
          </label>
          {form.logo && <button onClick={() => setForm({ ...form, logo: null })} style={{ padding: '8px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', background: 'white', cursor: 'pointer' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : <><Save size={16} /> Save Company Info</>}</button>
    </div>
  )
}

function DataTab({ pin, settings, onSaved }) {
  const [msg, setMsg] = useState('')
  const [importing, setImporting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [resetPin, setResetPin] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetMsg, setResetMsg] = useState('')
  const fileRef = useRef()
  const restoreRef = useRef()

  const handleUploadCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setImporting(true); setMsg('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/api/settings/upload-customers?pin=${pin}`, {
        method: 'POST', body: formData
      })
      const data = await res.json()
      if (data.success) setMsg(`Imported: ${data.imported}, Skipped: ${data.skipped}`)
      else setMsg(data.error || 'Import failed')
    } catch (e) { setMsg('Network error') }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/export-backup?pin=${pin}`)
      if (!res.ok) { const d = await res.json(); alert(d.error); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `tdg-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click(); URL.revokeObjectURL(url)
    } catch (e) { alert('Download failed') }
  }

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (!confirm('This will REPLACE all current data with the backup. Continue?')) return
    setRestoring(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/api/settings/restore-backup?pin=${pin}`, {
        method: 'POST', body: formData
      })
      const data = await res.json()
      if (data.success) { alert('Backup restored! Page will reload.'); window.location.reload() }
      else alert(data.error || 'Restore failed')
    } catch (e) { alert('Restore failed') }
    setRestoring(false)
    if (restoreRef.current) restoreRef.current.value = ''
  }

  const handleReset = async () => {
    if (resetPin.length !== 4) { setResetMsg('Enter 4-digit PIN'); return }
    setResetMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: resetPin })
      })
      const data = await res.json()
      if (data.success) { alert('Data reset! Page will reload.'); window.location.reload() }
      else setResetMsg(data.error || 'Reset failed')
    } catch (e) { setResetMsg('Network error') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Upload Customers */}
      <div style={glassCard}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} color="#4895ef" /> Upload Customer List
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>CSV format: name, phone, email (header row required)</p>
        {msg && <div style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>{msg}</div>}
        <label style={{ ...btnPrimary, fontSize: '13px', padding: '10px 18px', cursor: 'pointer', display: 'inline-flex' }}>
          <Upload size={16} /> {importing ? 'Importing...' : 'Select CSV File'}
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUploadCSV} disabled={importing} />
        </label>
      </div>

      {/* Backup */}
      <div style={glassCard}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={20} color="#2a9d8f" /> Backup & Restore
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadBackup} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #2a9d8f, #21867a)', boxShadow: '0 4px 16px rgba(42,157,143,0.3)' }}>
            <Download size={16} /> Download Backup
          </button>
          <label style={{ ...btnPrimary, background: 'linear-gradient(135deg, #4895ef, #3b82f6)', boxShadow: '0 4px 16px rgba(72,149,239,0.3)', cursor: 'pointer' }}>
            <Upload size={16} /> {restoring ? 'Restoring...' : 'Restore from Backup'}
            <input ref={restoreRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestoreBackup} disabled={restoring} />
          </label>
        </div>
      </div>

      {/* Reset */}
      <div style={{ ...glassCard, border: '1px solid rgba(239,68,68,0.15)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> Reset Operational Data
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Clears all orders, billing, KOTs, POs, GRNs, expenses. A backup is auto-created.</p>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
            <RotateCcw size={16} /> Reset Data
          </button>
        ) : (
          <div>
            {resetMsg && <div style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '12px' }}>{resetMsg}</div>}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="password" maxLength={4} placeholder="PIN" value={resetPin}
                onChange={e => setResetPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={{ ...inputStyle, width: '120px', textAlign: 'center', letterSpacing: '4px' }} />
              <button onClick={handleReset} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>Confirm Reset</button>
              <button onClick={() => { setShowReset(false); setResetPin(''); setResetMsg('') }} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer' }}><X size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PrintersTab({ pin, settings, onSaved }) {
  const [printers, setPrinters] = useState(settings?.printers || [])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const addPrinter = () => {
    setPrinters([...printers, { id: 'p_' + Date.now(), name: '', ip: '', type: 'browser', isDefault: false }])
  }

  const removePrinter = (id) => {
    setPrinters(printers.filter(p => p.id !== id))
  }

  const updatePrinter = (id, field, value) => {
    setPrinters(printers.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/printers`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, printers })
      })
      const data = await res.json()
      if (data.success) { setMsg('Saved!'); clearSettingsCache(); onSaved() }
      else setMsg(data.error || 'Failed')
    } catch (e) { setMsg('Network error') }
    setSaving(false)
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Printer size={20} color="#f4a261" /> Printer Settings
      </h3>
      {msg && <div style={{ background: msg === 'Saved!' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: msg === 'Saved!' ? '#16a34a' : '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>{msg}</div>}
      {printers.map((printer, idx) => (
        <div key={printer.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={printer.name} onChange={e => updatePrinter(printer.id, 'name', e.target.value)} placeholder="e.g. Kitchen Printer" />
          </div>
          <div>
            <label style={labelStyle}>IP Address</label>
            <input style={inputStyle} value={printer.ip} onChange={e => updatePrinter(printer.id, 'ip', e.target.value)} placeholder="192.168.1.100" />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select style={inputStyle} value={printer.type} onChange={e => updatePrinter(printer.id, 'type', e.target.value)}>
              <option value="browser">Browser</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>
          <button onClick={() => removePrinter(printer.id)} style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', background: 'white', cursor: 'pointer' }}>
            <Trash2 size={16} color="#dc2626" />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={addPrinter} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #4895ef, #3b82f6)', boxShadow: '0 4px 16px rgba(72,149,239,0.3)' }}>
          <Plus size={16} /> Add Printer
        </button>
        <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : <><Save size={16} /> Save</>}</button>
      </div>
    </div>
  )
}

function ThemeTab({ pin, settings, onSaved }) {
  const [theme, setTheme] = useState(settings?.theme || { accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/theme`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, ...theme })
      })
      const data = await res.json()
      if (data.success) { setMsg('Saved!'); clearSettingsCache(); onSaved() }
      else setMsg(data.error || 'Failed')
    } catch (e) { setMsg('Network error') }
    setSaving(false)
  }

  const resetDefaults = () => {
    setTheme({ accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' })
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Palette size={20} color="#7c3aed" /> Theme Colors
      </h3>
      {msg && <div style={{ background: msg === 'Saved!' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: msg === 'Saved!' ? '#16a34a' : '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>{msg}</div>}

      {/* Live Preview */}
      <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', background: theme.bgPrimary || '#f5f5f7', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '12px 24px', background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimaryDark})`, color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '14px', boxShadow: `0 4px 16px ${hexToRgba(theme.accentPrimary, 0.3)}` }}>
            Sample Button
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimaryDark})`, boxShadow: `0 4px 12px ${hexToRgba(theme.accentPrimary, 0.25)}` }} />
          <div style={{ padding: '8px 16px', borderRadius: '8px', background: hexToRgba(theme.accentPrimary, 0.1), color: theme.accentPrimary, fontWeight: 600, fontSize: '13px' }}>Badge</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>Primary Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={theme.accentPrimary} onChange={e => setTheme({ ...theme, accentPrimary: e.target.value })} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={theme.accentPrimary} onChange={e => setTheme({ ...theme, accentPrimary: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Dark Accent</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={theme.accentPrimaryDark} onChange={e => setTheme({ ...theme, accentPrimaryDark: e.target.value })} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={theme.accentPrimaryDark} onChange={e => setTheme({ ...theme, accentPrimaryDark: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Background</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={theme.bgPrimary} onChange={e => setTheme({ ...theme, bgPrimary: e.target.value })} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={theme.bgPrimary} onChange={e => setTheme({ ...theme, bgPrimary: e.target.value })} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : <><Save size={16} /> Save Theme</>}</button>
        <button onClick={resetDefaults} style={{ padding: '12px 24px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={16} /> Reset to Default
        </button>
      </div>
    </div>
  )
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(230, 57, 70, ${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function OffersTab({ pin, settings, onSaved }) {
  const [offers, setOffers] = useState(settings?.offers || [])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [newOffer, setNewOffer] = useState({ title: '', desc: '', tag: '', price: '', origPrice: '', image: '' })

  const handleAdd = () => {
    if (!newOffer.title || !newOffer.desc) { setMsg('Title and description are required'); return }
    const item = { ...newOffer, id: Date.now().toString() }
    const updated = [...offers, item]
    setOffers(updated)
    setNewOffer({ title: '', desc: '', tag: '', price: '', origPrice: '', image: '' })
    setMsg('')
  }

  const handleDelete = (id) => {
    const updated = offers.filter(o => o.id !== id)
    setOffers(updated)
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/offers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, offers })
      })
      const data = await res.json()
      if (data.success) {
        setMsg('Offers Saved Successfully!')
        clearSettingsCache()
        onSaved()
      } else {
        setMsg(data.error || 'Failed to save offers')
      }
    } catch (e) {
      setMsg('Network error')
    }
    setSaving(false)
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Tag size={22} color="#e63946" /> App Offers Management
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        Manage custom offers displayed inside the mobile app banner slider.
      </p>

      {msg && (
        <div style={{
          background: msg.includes('Saved') ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          color: msg.includes('Saved') ? '#16a34a' : '#dc2626',
          padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', fontWeight: 600
        }}>
          {msg}
        </div>
      )}

      {/* Add New Offer Panel */}
      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>Create Custom Offer Card</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Offer Title / Promo Name</label>
            <input style={inputStyle} value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} placeholder="e.g. BOGO Feast (Buy 1 Get 1)" />
          </div>
          <div>
            <label style={labelStyle}>Featured Sub-Text / Tag</label>
            <input style={inputStyle} value={newOffer.tag} onChange={e => setNewOffer({ ...newOffer, tag: e.target.value })} placeholder="e.g. 50% OFF / BOGO" />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Short Description of Offer details</label>
          <input style={inputStyle} value={newOffer.desc} onChange={e => setNewOffer({ ...newOffer, desc: e.target.value })} placeholder="e.g. Buy 1 Spicy chicken gyro and get second free" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Promo Price (₹)</label>
            <input style={inputStyle} value={newOffer.price} onChange={e => setNewOffer({ ...newOffer, price: e.target.value })} placeholder="e.g. ₹199" />
          </div>
          <div>
            <label style={labelStyle}>Original Price (₹)</label>
            <input style={inputStyle} value={newOffer.origPrice} onChange={e => setNewOffer({ ...newOffer, origPrice: e.target.value })} placeholder="e.g. ₹398" />
          </div>
          <div>
            <label style={labelStyle}>Predefined Image Path / URL</label>
            <input style={inputStyle} value={newOffer.image} onChange={e => setNewOffer({ ...newOffer, image: e.target.value })} placeholder="e.g. /uploads/menu/m1.jpg" />
          </div>
        </div>

        <button onClick={handleAdd} style={{ padding: '10px 20px', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: 600, fontSize: '13px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Offer to List
        </button>
      </div>

      {/* Offer Cards Table List */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>Current Active Offers</h4>
        {offers.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>No promotional offers configured yet.</p>
        ) : (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Tag / Badge</th>
                  <th style={{ padding: '12px' }}>Title & Description</th>
                  <th style={{ padding: '12px' }}>Price details</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}><span style={{ padding: '3px 8px', background: 'rgba(230,57,70,0.1)', color: '#e63946', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}>{o.tag || 'PROMO'}</span></td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{o.title}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{o.desc}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 700 }}>{o.price}</span>
                      {o.origPrice && <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '6px', fontSize: '11px' }}>{o.origPrice}</span>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(o.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', padding: '6px' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} style={btnPrimary}>
        {saving ? 'Saving...' : <><Save size={16} /> Save and Sync Banners</>}
      </button>
    </div>
  )
}

function ImagesTab({ pin, settings, onSaved }) {
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [selectedSlideName, setSelectedSlideName] = useState('hero_gyro')

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setMsg('File size must be under 5MB'); return }

    setUploading(true)
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/settings/upload-mobile-image?pin=${pin}&name=${selectedSlideName}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
      })
      const data = await res.json()
      if (data.success) {
        setMsg(`Image '${selectedSlideName}' uploaded successfully! Changes will sync to clients.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        onSaved()
      } else {
        setMsg(data.error || 'Failed to upload image')
      }
    } catch (e) {
      setMsg('Network upload error')
    }
    setUploading(false)
  }

  return (
    <div style={glassCard}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ImageIcon size={22} color="#e63946" /> Mobile Carousel Image Uploader
      </h3>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
        Upload or replace specific looping carousel images rendered in the Mobile Client App home screen.
      </p>

      {msg && (
        <div style={{
          background: msg.includes('successfully') ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          color: msg.includes('successfully') ? '#16a34a' : '#dc2626',
          padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', fontWeight: 600
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <label style={labelStyle}>Target Carousel Slide Placement</label>
          <select style={{ ...inputStyle, padding: '12px 14px' }} value={selectedSlideName} onChange={e => setSelectedSlideName(e.target.value)}>
            <option value="hero_gyro">Slide 1 (hero_gyro.png)</option>
            <option value="gyro">Slide 2 (gyro.png)</option>
            <option value="Lebanese rice bowl">Slide 3 (Lebanese rice bowl.png)</option>
            <option value="fries">Slide 4 (fries.png)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Upload New Slide Image File</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={btnPrimary}>
            {uploading ? 'Uploading...' : <><Upload size={16} /> Choose & Upload Image</>}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>Important Upload Guidelines</h4>
        <ul style={{ fontSize: '12px', color: '#6b7280', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Recommended dimensions: Aspect ratio 1:1 or 4:3 (e.g. 800x800 px).</li>
          <li>Accepted formats: PNG, JPG, JPEG, WEBP files up to 5MB.</li>
          <li>This action overwrites the existing slide file assets instantly. Mobile apps will reload newer assets upon next launch.</li>
        </ul>
      </div>
    </div>
  )
}
