import { useState, useEffect } from 'react'
import { UserPlus, Pencil, Trash2, X, Shield } from 'lucide-react'
import API_BASE from '../lib/apiConfig'

const BILLING_MODULES = [
  { id: 'pos', label: 'POS' },
  { id: 'captain', label: 'Captain' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'billing', label: 'Billing' },
  { id: 'kot', label: 'KOT' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'menu', label: 'Menu' },
  { id: 'hr', label: 'HR' },
  { id: 'loyalty', label: 'Loyalty' },
  { id: 'customers', label: 'Customers' },
  { id: 'reports', label: 'Reports' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'onlineOrders', label: 'Online Orders' },
  { id: 'users', label: 'Users' },
  { id: 'expenses', label: 'Expenses' },
]

const PERM_ACTIONS = ['view', 'create', 'update', 'delete']

function EmptyPermissions() {
  const p = {}
  for (const mod of BILLING_MODULES) {
    p[mod.id] = { view: false, create: false, update: false, delete: false }
  }
  return p
}

export default function Users() {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', pin: '', role: 'cashier', permissions: EmptyPermissions() })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setCurrentUser(JSON.parse(u))
  }, [])

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/billing/users`)
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error('Failed to load users')
    }
  }

  const canManage = currentUser?.permissions?.users?.delete || currentUser?.role === 'admin'

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', pin: '', role: 'cashier', permissions: EmptyPermissions() })
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({ name: user.name, pin: '', role: user.role, permissions: user.permissions || EmptyPermissions() })
    setShowModal(true)
  }

  const togglePerm = (modId, action) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [modId]: { ...(prev.permissions[modId] || { view: false, create: false, update: false, delete: false }), [action]: !prev.permissions[modId]?.[action] }
      }
    }))
  }

  const setAllPerms = (modId, value) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [modId]: { view: value, create: value, update: value, delete: value } }
    }))
  }

  const handleSave = async () => {
    if (!form.name || (!editing && !form.pin)) return
    setSaving(true)
    try {
      if (editing) {
        const body = { name: form.name, role: form.role, permissions: form.permissions }
        if (form.pin) body.pin = form.pin
        await fetch(`${API_BASE}/api/billing/users/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      } else {
        await fetch(`${API_BASE}/api/billing/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      setShowModal(false)
      fetchUsers()
    } catch (e) {
      console.error('Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await fetch(`${API_BASE}/api/billing/users/${id}`, { method: 'DELETE' })
      fetchUsers()
    } catch (e) {
      console.error('Delete failed')
    }
  }

  const permSummary = (perms) => {
    const count = Object.values(perms || {}).reduce((sum, p) => sum + Object.values(p).filter(Boolean).length, 0)
    return `${count} permissions`
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>Billing Users</h2>
        {canManage && (
          <button onClick={openCreate} style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white', border: 'none',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(230,57,70,0.3)'
          }}>
            <UserPlus size={18} /> Add User
          </button>
        )}
      </div>

      <div style={{ ...glassCard, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Name</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Role</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Permissions</th>
              <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1a1a2e' }}>{user.name}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    background: user.role === 'admin' ? 'rgba(239,68,68,0.08)' : user.role === 'manager' ? 'rgba(59,130,246,0.08)' : 'rgba(0,0,0,0.04)',
                    color: user.role === 'admin' ? '#dc2626' : user.role === 'manager' ? '#2563eb' : '#6b7280',
                    textTransform: 'capitalize'
                  }}>{user.role}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{permSummary(user.permissions)}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {canManage && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(user)} style={{ padding: '6px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', background: 'rgba(255,255,255,0.75)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                        <Pencil size={16} color="#6b7280" />
                      </button>
                      {user.role !== 'admin' && user.role !== 'super-admin' && (
                        <button onClick={() => handleDelete(user.id)} style={{ padding: '6px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', background: 'rgba(255,255,255,0.75)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                          <Trash2 size={16} color="#dc2626" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 300 }} onClick={() => setShowModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '640px',
            maxHeight: '90vh', overflow: 'auto', zIndex: 301,
            border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#e63946" /> {editing ? 'Edit User' : 'Add User'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px', border: 'none', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="User name" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>
                  {editing ? 'New PIN (leave blank to keep)' : '4-digit PIN'}
                </label>
                <input value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="0000" type="password" maxLength={4}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Role</label>
                <select value={form.role} onChange={e => {
                  const role = e.target.value
                  setForm({ ...form, role, permissions: editing ? form.permissions : EmptyPermissions() })
                }} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }}>
                  <option value="super-admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '16px' }}>Module Permissions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {BILLING_MODULES.map(mod => {
                  const perms = form.permissions[mod.id] || { view: false, create: false, update: false, delete: false }
                  const allOn = Object.values(perms).every(Boolean)
                  return (
                    <div key={mod.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', minWidth: '140px' }}>{mod.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {PERM_ACTIONS.map(action => (
                          <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                            <input type="checkbox" checked={perms[action] || false}
                              onChange={() => togglePerm(mod.id, action)}
                              style={{ accentColor: '#e63946' }} />
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </label>
                        ))}
                        <button onClick={() => setAllPerms(mod.id, !allOn)}
                          style={{ fontSize: '11px', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                          {allOn ? 'Clear' : 'All'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || !form.name}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
                boxShadow: saving ? 'none' : '0 4px 16px rgba(230,57,70,0.3)'
              }}>
              {saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
