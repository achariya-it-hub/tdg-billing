import { useState, useEffect } from 'react'
import { Plus, Search, TrendingDown, DollarSign, FileText } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const EXPENSE_CATEGORIES = [
  'Vegetables', 'Meat & Proteins', 'Dairy', 'Bakery', 'Beverages',
  'Supplies', 'Utilities', 'Maintenance', 'Labour', 'Marketing', 'Other'
]

export default function Expenses() {
  const toast = useToast()
  const [expenses, setExpenses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({ category: '', amount: '', description: '' })

  const getApiUrl = () =>
    window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin

  const fetchExpenses = async () => {
    try {
      const url = selectedDate
        ? `${getApiUrl()}/api/expenses?date=${selectedDate}`
        : `${getApiUrl()}/api/expenses`
      const res = await fetch(url)
      if (res.ok) setExpenses(await res.json())
    } catch {}
  }

  useEffect(() => { fetchExpenses() }, [selectedDate])

  const totalToday = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handleAdd = async () => {
    if (!form.category || !form.amount) {
      toast.error('Category and amount required')
      return
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          amount: Number(form.amount),
          description: form.description
        })
      })
      if (res.ok) {
        toast.success('Expense added')
        setShowAddModal(false)
        setForm({ category: '', amount: '', description: '' })
        fetchExpenses()
      } else {
        toast.error('Failed to add expense')
      }
    } catch {
      toast.error('Failed to add expense')
    }
  }

  const filtered = expenses.filter(e =>
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todayStr = new Date().toISOString().split('T')[0]

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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Daily Expenses
        </h2>
        <p style={{ color: '#6b7280' }}>Track and manage restaurant expenses</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: <TrendingDown size={24} color="#ef4444" />, value: `₹${totalToday.toFixed(2)}`, label: selectedDate === todayStr ? "Today's Total" : `Total for ${selectedDate}`, iconBg: 'rgba(239,68,68,0.08)' },
          { icon: <FileText size={24} color="#3b82f6" />, value: expenses.length, label: 'Entries', iconBg: 'rgba(59,130,246,0.08)' }
        ].map((stat, i) => (
          <div key={i} style={{ ...glassCard, padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: stat.iconBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...glassCard, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1.5px solid #e5e7eb', width: '240px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button onClick={() => setShowAddModal(true)} style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)', color: 'white',
            border: 'none', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(230,57,70,0.3)'
          }}>
            <Plus size={16} /> Add Expense
          </button>
        </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
              <DollarSign size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>No expenses for this date</p>
            </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: '#f3f4f6',
                        color: '#374151'
                      }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{exp.description || '-'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                      ₹{exp.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#6b7280', fontSize: '13px' }}>
                      {new Date(exp.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>
                  <td style={{ padding: '14px 16px' }}>Total</td>
                  <td></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#ef4444' }}>
                    ₹{filtered.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
              </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Amount <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="0.00"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Optional notes..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Expense</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
