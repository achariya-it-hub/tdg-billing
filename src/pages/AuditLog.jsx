import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Search, ScrollText, ShieldAlert } from 'lucide-react'
import API_BASE from '../lib/apiConfig'

const METHOD_LABEL = { POST: 'Added / Saved', PUT: 'Updated', PATCH: 'Updated', DELETE: 'Deleted' }
const METHOD_COLOR = {
  POST: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
  PUT: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
  PATCH: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
  DELETE: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' }
}

function describeArea(path) {
  if (path.includes('/menu/categories')) return 'Menu category'
  if (path.includes('/menu/items')) return 'Menu item'
  if (path.includes('/menu')) return 'Menu'
  if (path.includes('/recipes')) return 'Recipe mapping'
  if (path.includes('/inventory/categories')) return 'Inventory category'
  if (path.includes('/restock')) return 'Inventory restock'
  if (path.includes('/inventory')) return 'Inventory'
  return 'Data'
}

function summarize(body) {
  try {
    const b = JSON.parse(body)
    const parts = []
    for (const k of ['name', 'menuItemName', 'price', 'currentStock', 'quantity', 'minimumStock', 'costPerUnit', 'unit', 'category', 'isAvailable']) {
      if (b[k] !== undefined && b[k] !== '') parts.push(`${k}: ${typeof b[k] === 'object' ? JSON.stringify(b[k]) : b[k]}`)
    }
    return parts.join(' • ') || (Object.keys(b).length ? `${Object.keys(b).length} fields` : '—')
  } catch {
    return body && body !== '{}' ? String(body).slice(0, 120) : '—'
  }
}

const glassCard = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
}

const th = { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }
const td = { padding: '12px 16px', fontSize: '13px', color: '#374151', verticalAlign: 'top' }

export default function AuditLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [limit, setLimit] = useState(200)

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
  const isSuperAdmin = user?.role === 'super-admin'

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/audit-log?limit=${limit}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load audit log')
      setEntries(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { if (isSuperAdmin) load() }, [limit])

  const users = useMemo(() => [...new Set(entries.map(e => e.user?.name).filter(Boolean))], [entries])

  const filtered = entries.filter(e => {
    if (userFilter !== 'all' && e.user?.name !== userFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return `${e.user?.name} ${e.path} ${e.body} ${describeArea(e.path)}`.toLowerCase().includes(q)
  })

  if (!isSuperAdmin) {
    return (
      <div style={{ ...glassCard, padding: '48px', textAlign: 'center', color: '#6b7280' }}>
        <ShieldAlert size={40} color="#dc2626" style={{ marginBottom: '12px' }} />
        <div style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a2e' }}>Super Admin only</div>
        <div style={{ marginTop: '6px' }}>You don't have access to the audit log.</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScrollText size={22} color="#e63946" /> Audit Log
          </h2>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Every menu, recipe and inventory change — who did it and what was sent.
          </div>
        </div>
        <button id="audit-refresh" onClick={load} style={{
          padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600,
          background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
          display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(230,57,70,0.3)'
        }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input id="audit-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, item, price..."
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
        </div>
        <select id="audit-user-filter" value={userFilter} onChange={e => setUserFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }}>
          <option value="all">All users</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select id="audit-limit" value={limit} onChange={e => setLimit(Number(e.target.value))}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }}>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
          <option value={500}>Last 500</option>
          <option value={1000}>Last 1000</option>
        </select>
      </div>

      <div style={{ ...glassCard, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
              <th style={th}>Time</th>
              <th style={th}>User</th>
              <th style={th}>Action</th>
              <th style={th}>Area</th>
              <th style={th}>Details</th>
              <th style={th}>Result</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading…</td></tr>}
            {!loading && error && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: '40px', color: '#dc2626' }}>{error}</td></tr>}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No changes recorded yet</td></tr>
            )}
            {!loading && !error && filtered.map((e, i) => {
              const c = METHOD_COLOR[e.method] || { bg: 'rgba(0,0,0,0.05)', color: '#6b7280' }
              const ok = e.status >= 200 && e.status < 300
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(e.at).toLocaleString('en-IN')}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{e.user?.name || 'unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>{e.user?.role}</div>
                  </td>
                  <td style={td}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.color }}>
                      {METHOD_LABEL[e.method] || e.method}
                    </span>
                  </td>
                  <td style={td}>{describeArea(e.path)}</td>
                  <td style={{ ...td, maxWidth: '360px', wordBreak: 'break-word' }} title={e.body}>{summarize(e.body)}</td>
                  <td style={td}>
                    <span style={{ fontWeight: 600, color: ok ? '#16a34a' : '#dc2626' }}>{ok ? 'Saved' : `Failed (${e.status})`}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
