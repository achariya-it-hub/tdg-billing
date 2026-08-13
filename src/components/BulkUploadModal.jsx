import { useState, useRef } from 'react'
import { Upload, FileText, Download, Check, AlertCircle, Trash2, Users, UserPlus, X, RefreshCw } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import API_BASE from '../lib/apiConfig'

export default function BulkUploadModal({ isOpen, onClose, defaultType = 'customers', onSuccess }) {
  const [entityType, setEntityType] = useState(defaultType) // 'customers' | 'staff'
  const [activeMode, setActiveMode] = useState('csv') // 'csv' | 'text'
  const [pastedText, setPastedText] = useState('')
  const [discountPct, setDiscountPct] = useState(50)
  const [offerName, setOfferName] = useState('VIP Special Offer')
  const [parsedRows, setParsedRows] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  const resetState = () => {
    setPastedText('')
    setParsedRows([])
    setUploadResult(null)
    setErrorMsg('')
  }

  const handleEntityChange = (type) => {
    setEntityType(type)
    resetState()
  }

  const handleDownloadSampleCsv = () => {
    let csvContent = ''
    let filename = ''
    if (entityType === 'customers') {
      csvContent = 'Mobile Number,Full Name,Email Address,Referral Code,Discount Percent\n9876543210,Ramesh Kumar,ramesh@example.com,TDG1234,50\n8765432109,Anita Sharma,anita@example.com,TDG5678,20\n9123456789,Vikram Singh,vikram@example.com,,30'
      filename = 'customers_bulk_sample.csv'
    } else {
      csvContent = 'Employee ID,Full Name,Department,Designation,Mobile Number,Email Address,Status\nEMP101,Rajesh Kumar,Teaching,Professor,9876543210,rajesh@achariya.in,Active\nEMP102,Priya Sharma,Admin,Manager,8765432109,priya@achariya.in,Active\nEMP103,Amit Verma,Billing,Cashier,9123456789,amit@achariya.in,Active'
      filename = 'achariya_staff_bulk_sample.csv'
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCsvText = (text) => {
    if (!text || !text.trim()) return []
    const lines = text.trim().split(/[\n\r]+/)
    const rows = []

    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return

      // Ignore header row if present
      if (idx === 0 && (trimmed.toLowerCase().includes('mobile') || trimmed.toLowerCase().includes('employee') || trimmed.toLowerCase().includes('full name'))) {
        return
      }

      const cols = trimmed.split(/[,;\t]+/).map(c => c.replace(/^["']|["']$/g, '').trim())
      if (entityType === 'customers') {
        const phone = (cols[0] || '').replace(/\D/g, '')
        const name = cols[1] || 'VIP Customer'
        const email = cols[2] || ''
        const partnerCode = cols[3] || ''
        const disc = Number(cols[4]) || discountPct

        if (phone.length >= 8) {
          rows.push({ phone, name, email, partnerCode, discountPct: disc, status: 'valid' })
        } else if (cols[0]) {
          rows.push({ phone: cols[0], name, email, partnerCode, discountPct: disc, status: 'invalid_phone' })
        }
      } else {
        const id = (cols[0] || '').toUpperCase()
        const name = cols[1] || ''
        const department = cols[2] || 'General'
        const designation = cols[3] || 'Staff'
        const mobile = (cols[4] || '').replace(/\D/g, '')
        const email = cols[5] || ''
        const statusVal = cols[6] || 'Active'

        if (id && name) {
          rows.push({ id, name, department, designation, mobile, email, statusVal, status: 'valid' })
        } else {
          rows.push({ id: cols[0] || 'N/A', name: cols[1] || 'N/A', department: 'General', designation: 'Staff', mobile: '', email: '', statusVal: 'Active', status: 'missing_info' })
        }
      }
    })

    return rows
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        const parsed = parseCsvText(text)
        setParsedRows(parsed)
        if (parsed.length === 0) {
          setErrorMsg('No valid rows found in file. Please download the sample template.')
        } else {
          setErrorMsg('')
        }
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleTextParse = () => {
    const parsed = parseCsvText(pastedText)
    setParsedRows(parsed)
    if (parsed.length === 0) {
      setErrorMsg('No valid rows parsed from text. Please enter phone numbers or employee details line by line.')
    } else {
      setErrorMsg('')
    }
  }

  const handleRemoveRow = (index) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitBulk = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid')
    if (validRows.length === 0) {
      setErrorMsg('No valid rows to upload.')
      return
    }

    setIsProcessing(true)
    setErrorMsg('')
    setUploadResult(null)

    try {
      const endpoint = entityType === 'customers'
        ? `${API_BASE}/api/admin/bulk-upload/customers`
        : `${API_BASE}/api/admin/bulk-upload/staff`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validRows,
          discountPct,
          offerName
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setUploadResult(data)
        setParsedRows([])
        setPastedText('')
        if (onSuccess) onSuccess(data)
      } else {
        setErrorMsg(data.error || 'Bulk upload failed')
      }
    } catch (e) {
      setErrorMsg('Network error connecting to backend')
    }
    setIsProcessing(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📂 Universal Bulk Upload Center" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '78vh', overflowY: 'auto' }}>
        
        {/* Top Entity Selector & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleEntityChange('customers')}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                background: entityType === 'customers' ? '#e63946' : '#ffffff',
                color: entityType === 'customers' ? '#ffffff' : '#475569',
                fontWeight: 700, fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <UserPlus size={16} /> Customers & Loyalty Members
            </button>
            <button
              type="button"
              onClick={() => handleEntityChange('staff')}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                background: entityType === 'staff' ? '#2563eb' : '#ffffff',
                color: entityType === 'staff' ? '#ffffff' : '#475569',
                fontWeight: 700, fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Users size={16} /> Achariya Staff Master
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            style={{
              padding: '8px 14px', borderRadius: '10px', background: '#f0fdf4',
              color: '#16a34a', border: '1.5px solid #bbf7d0', fontWeight: 700,
              fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Download size={15} /> Download Sample CSV Template
          </button>
        </div>

        {/* Input Mode Selector: File Drop vs Plain Text */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveMode('csv')}
            style={{
              padding: '8px 16px', border: 'none', background: 'none',
              borderBottom: activeMode === 'csv' ? '3px solid #e63946' : '3px solid transparent',
              color: activeMode === 'csv' ? '#e63946' : '#64748b', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Upload size={16} /> 1. Upload CSV / Excel File
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            style={{
              padding: '8px 16px', border: 'none', background: 'none',
              borderBottom: activeMode === 'text' ? '3px solid #e63946' : '3px solid transparent',
              color: activeMode === 'text' ? '#e63946' : '#64748b', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <FileText size={16} /> 2. Paste Plain Text List
          </button>
        </div>

        {/* Success Alert */}
        {uploadResult && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '16px', color: '#166534' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px', marginBottom: '4px' }}>
              <Check size={20} /> Success! {uploadResult.imported + uploadResult.updated} Records Processed Live
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              • <strong>{uploadResult.imported}</strong> new records inserted.<br />
              • <strong>{uploadResult.updated}</strong> existing records updated.<br />
              • Database updated live and synchronized with POS terminals!
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Option Settings (Discount Pct & Campaign Name for Customers) */}
        {entityType === 'customers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>DEFAULT DISCOUNT VALUE</label>
              <select
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              >
                <option value={15}>15% OFF (Standard Referral)</option>
                <option value={20}>20% OFF (VIP Special)</option>
                <option value={30}>30% OFF (Primary Member)</option>
                <option value={50}>50% OFF (Achariya Special)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>CAMPAIGN / OFFER NAME</label>
              <input
                type="text"
                value={offerName}
                onChange={e => setOfferName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                placeholder="e.g. VIP Bulk Import Campaign"
              />
            </div>
          </div>
        )}

        {/* Input Mode 1: File Drop Zone */}
        {activeMode === 'csv' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2.5px dashed #cbd5e1', borderRadius: '16px', padding: '30px 20px',
              textAlign: 'center', background: '#fafafa', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={26} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                Click to browse or Drag & Drop your .CSV file here
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Supports standard CSV files for {entityType === 'customers' ? 'Customers (Mobile, Name, Email, Discount)' : 'Staff (EMP ID, Name, Department, Mobile)'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Input Mode 2: Plain Text Paste Area */}
        {activeMode === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Paste your list below (One contact/employee per line):
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={
                entityType === 'customers'
                  ? '9876543210, Ramesh Kumar, ramesh@example.com\n8765432109, Anita Sharma\n9123456789'
                  : 'EMP101, Rajesh Kumar, Teaching, Professor, 9876543210\nEMP102, Priya Sharma, Admin, Manager, 8765432109'
              }
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1.5px solid #cbd5e1', fontFamily: 'monospace', fontSize: '13px',
                lineHeight: 1.5, resize: 'vertical'
              }}
            />
            <Button onClick={handleTextParse} variant="secondary" size="sm" style={{ alignSelf: 'flex-start' }}>
              <RefreshCw size={14} /> Parse Raw Text
            </Button>
          </div>
        )}

        {/* Parsed Rows Interactive Preview Table */}
        {parsedRows.length > 0 && (
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                Preview Parsed Records ({parsedRows.length} Total • {parsedRows.filter(r => r.status === 'valid').length} Valid)
              </div>
              <button
                type="button"
                onClick={() => setParsedRows([])}
                style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear Preview
              </button>
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>#</th>
                    {entityType === 'customers' ? (
                      <>
                        <th style={{ padding: '8px 12px' }}>Mobile Number</th>
                        <th style={{ padding: '8px 12px' }}>Customer Name</th>
                        <th style={{ padding: '8px 12px' }}>Email</th>
                        <th style={{ padding: '8px 12px' }}>Discount %</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '8px 12px' }}>EMP ID</th>
                        <th style={{ padding: '8px 12px' }}>Employee Name</th>
                        <th style={{ padding: '8px 12px' }}>Department</th>
                        <th style={{ padding: '8px 12px' }}>Mobile</th>
                      </>
                    )}
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: row.status === 'valid' ? '#ffffff' : '#fef2f2' }}>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{idx + 1}</td>
                      {entityType === 'customers' ? (
                        <>
                          <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace' }}>{row.phone}</td>
                          <td style={{ padding: '8px 12px' }}>{row.name}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.email || '-'}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#e63946' }}>{row.discountPct}% OFF</td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>{row.id}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{row.name}</td>
                          <td style={{ padding: '8px 12px' }}>{row.department}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{row.mobile || '-'}</td>
                        </>
                      )}
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800,
                          background: row.status === 'valid' ? '#dcfce7' : '#fee2e2',
                          color: row.status === 'valid' ? '#15803d' : '#b91c1c'
                        }}>
                          {row.status === 'valid' ? '✓ Valid' : '✗ Invalid'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Action Button */}
        {parsedRows.filter(r => r.status === 'valid').length > 0 && (
          <Button
            onClick={handleSubmitBulk}
            loading={isProcessing}
            fullWidth
            style={{ padding: '14px', fontSize: '15px', fontWeight: 800, marginTop: '8px' }}
          >
            <Check size={18} /> Confirm & Upload {parsedRows.filter(r => r.status === 'valid').length} {entityType === 'customers' ? 'Customers' : 'Staff Members'}
          </Button>
        )}

      </div>
    </Modal>
  )
}
