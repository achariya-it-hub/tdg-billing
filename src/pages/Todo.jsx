import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, Plus, Trash2, ChevronLeft, ChevronRight, Check, AlertTriangle, Clock, Filter, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const API = () => window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  background: 'white'
}

export default function Todo() {
  const toast = useToast()

  // Calendar & To-Do State
  const [todos, setTodos] = useState([])
  const [dueBills, setDueBills] = useState([])
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0])
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())
  const [showAddTodoModal, setShowAddTodoModal] = useState(false)
  const [todoFilter, setTodoFilter] = useState('all')
  const [todoForm, setTodoForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    category: 'General',
    notes: ''
  })

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API()}/api/accounts/todos`)
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      } else {
        const local = localStorage.getItem('tdg_todos')
        if (local) setTodos(JSON.parse(local))
      }
    } catch {
      const local = localStorage.getItem('tdg_todos')
      if (local) setTodos(JSON.parse(local))
    }
  }

  const fetchDueBills = async () => {
    try {
      const res = await fetch(`${API()}/api/accounts/due-bills`)
      if (res.ok) {
        const data = await res.json()
        setDueBills(data)
      }
    } catch {}
  }

  const handleSaveTodo = async () => {
    if (!todoForm.title.trim()) {
      toast.error('Task title is required')
      return
    }
    const newTodo = {
      id: 'todo_' + Date.now(),
      title: todoForm.title.trim(),
      date: todoForm.date || selectedCalendarDate,
      priority: todoForm.priority || 'Medium',
      category: todoForm.category || 'General',
      notes: todoForm.notes || '',
      isCompleted: false,
      createdAt: new Date().toISOString()
    }
    const updated = [newTodo, ...todos]
    setTodos(updated)
    try {
      localStorage.setItem('tdg_todos', JSON.stringify(updated))
      await fetch(`${API()}/api/accounts/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })
      toast.success('Task added successfully!')
    } catch {
      toast.success('Task saved locally!')
    }
    setShowAddTodoModal(false)
    setTodoForm({ title: '', date: selectedCalendarDate, priority: 'Medium', category: 'General', notes: '' })
  }

  const toggleTodoComplete = async (todo) => {
    const updated = todos.map(t => t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t)
    setTodos(updated)
    try {
      localStorage.setItem('tdg_todos', JSON.stringify(updated))
      await fetch(`${API()}/api/accounts/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !todo.isCompleted })
      })
    } catch {}
  }

  const handleDeleteTodo = async (todoId) => {
    const updated = todos.filter(t => t.id !== todoId)
    setTodos(updated)
    try {
      localStorage.setItem('tdg_todos', JSON.stringify(updated))
      await fetch(`${API()}/api/accounts/todos/${todoId}`, { method: 'DELETE' })
      toast.success('Task deleted')
    } catch {}
  }

  useEffect(() => {
    fetchTodos()
    fetchDueBills()
  }, [])

  const pendingCount = todos.filter(t => !t.isCompleted).length
  const completedCount = todos.filter(t => t.isCompleted).length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTasksCount = todos.filter(t => t.date === todayStr && !t.isCompleted).length

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>
            Calendar & TODO Tasks
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Organize daily tasks, vendor payment schedules, and operational reminders
          </p>
        </div>
        <Button onClick={() => {
          setTodoForm(p => ({ ...p, date: selectedCalendarDate }))
          setShowAddTodoModal(true)
        }}>
          <Plus size={18} /> Add New Task
        </Button>
      </div>

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>{todayTasksCount}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Tasks Due Today</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>{pendingCount}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Pending Tasks</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>{completedCount}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Completed Tasks</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>{dueBills.length}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Upcoming Due Bills</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Calendar + Task Manager */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Calendar Grid Card */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={24} color="#e63946" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e' }}>
                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}>
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {
                const now = new Date()
                setCurrentMonthDate(now)
                setSelectedCalendarDate(now.toISOString().split('T')[0])
              }}>
                Today
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}>
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', padding: '8px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {(() => {
              const year = currentMonthDate.getFullYear()
              const month = currentMonthDate.getMonth()
              const firstDay = new Date(year, month, 1).getDay()
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const cells = []

              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`pad-${i}`} style={{ height: '75px', background: '#f9fafb', borderRadius: '10px', opacity: 0.3 }} />)
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dStr === todayStr
                const isSelected = dStr === selectedCalendarDate
                const dayTodos = todos.filter(t => t.date === dStr)
                const dayBills = dueBills.filter(b => b.date === dStr)

                cells.push(
                  <div
                    key={day}
                    onClick={() => setSelectedCalendarDate(dStr)}
                    style={{
                      height: '75px',
                      padding: '8px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #e63946' : isToday ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      background: isSelected ? '#fef2f2' : isToday ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(230,57,70,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: isToday || isSelected ? 800 : 600, color: isSelected ? '#e63946' : isToday ? '#2563eb' : '#1a1a2e' }}>
                        {day}
                      </span>
                      {isToday && <span style={{ fontSize: '9px', background: '#2563eb', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Today</span>}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: 'auto' }}>
                      {dayTodos.map(t => (
                        <span key={t.id} style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: t.isCompleted ? '#10b981' : t.priority === 'High' ? '#ef4444' : '#f59e0b'
                        }} title={t.title} />
                      ))}
                      {dayBills.length > 0 && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} title={`${dayBills.length} Due Bills`} />
                      )}
                    </div>
                  </div>
                )
              }

              return cells
            })()}
          </div>
        </Card>

        {/* To-Do's Task List Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>Tasks & Reminders</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  {selectedCalendarDate ? `For Date: ${selectedCalendarDate}` : 'All Scheduled Tasks'}
                </p>
              </div>
              <Button size="sm" onClick={() => {
                setTodoForm(p => ({ ...p, date: selectedCalendarDate }))
                setShowAddTodoModal(true)
              }}>
                <Plus size={16} /> Add Task
              </Button>
            </div>

            {/* Todo Filters */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {['all', 'pending', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setTodoFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: todoFilter === f ? '#1a1a2e' : '#f3f4f6',
                    color: todoFilter === f ? 'white' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
              {selectedCalendarDate && (
                <button
                  onClick={() => setSelectedCalendarDate('')}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#e63946',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Show All Dates
                </button>
              )}
            </div>

            {/* Task Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto' }}>
              {(() => {
                let filteredTodos = todos.filter(t => !selectedCalendarDate || t.date === selectedCalendarDate)
                if (todoFilter === 'pending') filteredTodos = filteredTodos.filter(t => !t.isCompleted)
                if (todoFilter === 'completed') filteredTodos = filteredTodos.filter(t => t.isCompleted)

                if (filteredTodos.length === 0) {
                  return (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '12px' }}>
                      <CheckSquare size={36} style={{ marginBottom: '8px', opacity: 0.3 }} />
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>No tasks found</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>Click "Add Task" to create a new reminder for this date.</p>
                    </div>
                  )
                }

                return filteredTodos.map(todo => (
                  <div
                    key={todo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: todo.isCompleted ? '#f0fdf4' : '#f9fafb',
                      border: todo.isCompleted ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={!!todo.isCompleted}
                        onChange={() => toggleTodoComplete(todo)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                      />
                      <div>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: todo.isCompleted ? '#166534' : '#1a1a2e',
                          textDecoration: todo.isCompleted ? 'line-through' : 'none'
                        }}>
                          {todo.title}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: todo.priority === 'High' ? '#fef2f2' : todo.priority === 'Medium' ? '#fffbeb' : '#f0fdf4',
                            color: todo.priority === 'High' ? '#dc2626' : todo.priority === 'Medium' ? '#d97706' : '#10b981'
                          }}>
                            {todo.priority}
                          </span>
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {todo.category}
                          </span>
                          {todo.date && (
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              • {todo.date}
                            </span>
                          )}
                        </div>
                        {todo.notes && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                            {todo.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <button onClick={() => handleDeleteTodo(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                ))
              })()}
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== ADD TO-DO TASK MODAL ==================== */}
      <Modal isOpen={showAddTodoModal} onClose={() => setShowAddTodoModal(false)} title="Add To-Do / Task" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Task Title *</label>
            <input
              type="text"
              value={todoForm.title}
              onChange={e => setTodoForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Pay poultry vendor bill, Restock buns..."
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Date</label>
              <input
                type="date"
                value={todoForm.date}
                onChange={e => setTodoForm(p => ({ ...p, date: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Priority</label>
              <select
                value={todoForm.priority}
                onChange={e => setTodoForm(p => ({ ...p, priority: e.target.value }))}
                style={inputStyle}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Category</label>
            <select
              value={todoForm.category}
              onChange={e => setTodoForm(p => ({ ...p, category: e.target.value }))}
              style={inputStyle}
            >
              <option value="General">General</option>
              <option value="Payment">Vendor Payment</option>
              <option value="Inventory">Inventory Stock</option>
              <option value="Staff">Staff / HR</option>
              <option value="Bills">Due Bills</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' }}>Notes</label>
            <textarea
              value={todoForm.notes}
              onChange={e => setTodoForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Additional task notes..."
              rows={2}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
          <Button fullWidth onClick={handleSaveTodo}>
            <Plus size={18} /> Add Task
          </Button>
        </div>
      </Modal>
    </div>
  )
}
