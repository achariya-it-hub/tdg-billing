import { useState, useEffect, useRef } from 'react'
import { Users, Plus, Search, UserPlus, Calendar, Clock, CheckCircle, XCircle, Award, Edit, Trash2, ChevronDown, Mail, Phone, Star, Target, Flag, TrendingUp, ListChecks, ShieldCheck, Download, Upload, QrCode, UserCheck, HeartHandshake } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import BulkUploadModal from '../components/BulkUploadModal'
import { useToast } from '../components/ui/Toaster'
import API_BASE from '../lib/apiConfig'

const sampleStaff = [
  { id: '1', name: 'Rajesh Kumar', role: 'manager', department: 'Management', email: 'rajesh@tdgbilling.com', phone: '+91 98765 43210', joiningDate: '2022-03-15', salary: 45000, attendance: 95, performance: 4.5 },
  { id: '2', name: 'Priya Sharma', role: 'cashier', department: 'Billing', email: 'priya@tdgbilling.com', phone: '+91 87654 32109', joiningDate: '2022-06-01', salary: 25000, attendance: 92, performance: 4.2 },
  { id: '3', name: 'Amit Singh', role: 'cashier', department: 'Billing', email: 'amit@tdgbilling.com', phone: '+91 76543 21098', joiningDate: '2023-01-10', salary: 25000, attendance: 88, performance: 4.0 },
  { id: '4', name: 'Sunita Verma', role: 'kitchen', department: 'Kitchen', email: 'sunita@tdgbilling.com', phone: '+91 65432 10987', joiningDate: '2022-09-20', salary: 30000, attendance: 96, performance: 4.8 },
  { id: '5', name: 'Vikram Yadav', role: 'kitchen', department: 'Kitchen', email: 'vikram@tdgbilling.com', phone: '+91 54321 09876', joiningDate: '2023-03-05', salary: 28000, attendance: 85, performance: 3.8 },
  { id: '6', name: 'Neha Patel', role: 'cashier', department: 'Billing', email: 'neha@tdgbilling.com', phone: '+91 43210 98765', joiningDate: '2023-07-15', salary: 22000, attendance: 90, performance: 4.1 },
]

const sampleTasks = [
  { id: '1', title: 'Complete daily inventory count', description: 'Count all inventory items in kitchen and billing', assigneeId: '4', assigneeName: 'Sunita Verma', department: 'Kitchen', dueDate: '2024-01-16', status: 'pending', priority: 'high', milestone: 'Daily Operations' },
  { id: '2', title: 'Train new cashier on POS system', description: 'Complete onboarding training for new POS features', assigneeId: '1', assigneeName: 'Rajesh Kumar', department: 'Management', dueDate: '2024-01-20', status: 'in-progress', priority: 'medium', milestone: 'Staff Training' },
  { id: '3', title: 'Monthly sales report', description: 'Generate and submit monthly sales analytics', assigneeId: '2', assigneeName: 'Priya Sharma', department: 'Billing', dueDate: '2024-01-25', status: 'pending', priority: 'high', milestone: 'Monthly Reports' },
]

const sampleTargets = [
  { id: '1', title: 'Daily Sales Target', description: 'Achieve daily sales of ₹50,000', department: 'Billing', targetValue: 50000, currentValue: 42000, deadline: '2024-01-16', type: 'daily' },
  { id: '2', title: 'Customer Satisfaction', description: 'Maintain 90%+ customer satisfaction rating', department: 'All', targetValue: 90, currentValue: 88, deadline: '2024-01-31', type: 'monthly' },
  { id: '3', title: 'Kitchen Efficiency', description: 'Complete all orders within 15 minutes', department: 'Kitchen', targetValue: 100, currentValue: 92, deadline: '2024-01-31', type: 'monthly' },
]

const sampleMilestones = [
  { id: '1', title: 'Q1 Revenue Target', description: 'Achieve ₹50 Lakhs revenue in Q1', targetValue: 5000000, currentValue: 3200000, deadline: '2024-03-31', status: 'in-progress' },
  { id: '2', title: 'New Branch Setup', description: 'Open new outlet in Andheri', targetValue: 100, currentValue: 35, deadline: '2024-06-30', status: 'in-progress' },
  { id: '3', title: 'Staff Expansion', description: 'Hire 10 new employees', targetValue: 10, currentValue: 6, deadline: '2024-02-28', status: 'in-progress' },
]

const sampleAttendance = [
  { id: '1', name: 'Rajesh Kumar', date: '2024-01-15', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: '2', name: 'Priya Sharma', date: '2024-01-15', checkIn: '10:00', checkOut: '19:00', status: 'present' },
  { id: '3', name: 'Amit Singh', date: '2024-01-15', checkIn: '09:30', checkOut: '-', status: 'present' },
  { id: '4', name: 'Sunita Verma', date: '2024-01-15', checkIn: '08:00', checkOut: '17:00', status: 'present' },
  { id: '5', name: 'Vikram Yadav', date: '2024-01-15', checkIn: '-', checkOut: '-', status: 'absent' },
  { id: '6', name: 'Neha Patel', date: '2024-01-15', checkIn: '10:15', checkOut: '19:15', status: 'present' },
]

const shifts = [
  { id: '1', name: 'Morning', startTime: '06:00', endTime: '14:00', staffCount: 3 },
  { id: '2', name: 'Afternoon', startTime: '14:00', endTime: '22:00', staffCount: 4 },
  { id: '3', name: 'Night', startTime: '22:00', endTime: '06:00', staffCount: 2 },
]

const roleColors = {
  admin: { bg: '#fef2f2', color: '#dc2626' },
  manager: { bg: '#eff6ff', color: '#2563eb' },
  cashier: { bg: '#f0fdf4', color: '#16a34a' },
  kitchen: { bg: '#fffbeb', color: '#d97706' },
}

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  kitchen: 'Kitchen Staff',
}

export default function HR() {
  const toast = useToast()
  const [staff, setStaff] = useState(sampleStaff)
  const [attendance, setAttendance] = useState(sampleAttendance)
  const [activeTab, setActiveTab] = useState('achariya-staff')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Achariya Staff & Family Master State
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [showAchariyaModal, setShowAchariyaModal] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [selectedQrEmp, setSelectedQrEmp] = useState(null)
  const importFileRef = useRef(null)

  const [empForm, setEmpForm] = useState({
    id: '', name: '', department: 'Teaching', designation: 'Professor',
    mobile: '', email: '', status: 'Active', joiningDate: new Date().toISOString().slice(0, 10),
    qrCode: '', familyMembers: []
  })

  const fetchEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const res = await fetch(`${API_BASE}/api/staff/employees`)
      const data = await res.json()
      if (Array.isArray(data)) setEmployees(data)
    } catch (e) {
      console.error('Error fetching employees:', e)
    }
    setLoadingEmployees(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleOpenAddEmployee = () => {
    setEditingEmp(null)
    setEmpForm({
      id: 'EMP' + (100 + employees.length + 1),
      name: '', department: 'Teaching', designation: 'Professor',
      mobile: '', email: '', status: 'Active', joiningDate: new Date().toISOString().slice(0, 10),
      qrCode: '', familyMembers: []
    })
    setShowAchariyaModal(true)
  }

  const handleOpenEditEmployee = (emp) => {
    setEditingEmp(emp)
    setEmpForm({
      id: emp.id,
      name: emp.name,
      department: emp.department || 'Teaching',
      designation: emp.designation || 'Staff',
      mobile: emp.mobile || '',
      email: emp.email || '',
      status: emp.status || 'Active',
      joiningDate: emp.joiningDate || new Date().toISOString().slice(0, 10),
      qrCode: emp.qrCode || emp.id,
      familyMembers: emp.familyMembers ? [...emp.familyMembers] : []
    })
    setShowAchariyaModal(true)
  }

  const handleSaveEmployee = async () => {
    if (!empForm.id || !empForm.name) {
      toast.error('Employee ID and Name are required')
      return
    }

    try {
      const isEdit = !!editingEmp
      const url = isEdit ? `${API_BASE}/api/staff/employees/${editingEmp.id}` : `${API_BASE}/api/staff/employees`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empForm, qrCode: empForm.qrCode || empForm.id })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(isEdit ? 'Employee updated successfully!' : 'Employee created successfully!')
        setShowAchariyaModal(false)
        fetchEmployees()
      } else {
        toast.error(data.error || 'Failed to save employee')
      }
    } catch (e) {
      toast.error('Network error saving employee')
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (!confirm(`Are you sure you want to delete Employee ID ${id}?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/staff/employees/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Employee deleted successfully')
        fetchEmployees()
      } else {
        toast.error('Failed to delete employee')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  const handleAddFamilyMemberRow = () => {
    const newFam = {
      id: 'FAM_' + Date.now() + '_' + Math.floor(Math.random() * 100),
      employeeId: empForm.id,
      name: '',
      relationship: 'Spouse',
      mobile: '',
      status: 'Active'
    }
    setEmpForm({ ...empForm, familyMembers: [...empForm.familyMembers, newFam] })
  }

  const handleRemoveFamilyMemberRow = (idx) => {
    const updated = empForm.familyMembers.filter((_, i) => i !== idx)
    setEmpForm({ ...empForm, familyMembers: updated })
  }

  const handleUpdateFamilyMemberRow = (idx, field, value) => {
    const updated = [...empForm.familyMembers]
    updated[idx] = { ...updated[idx], [field]: value }
    setEmpForm({ ...empForm, familyMembers: updated })
  }

  const handleExportEmployeesCsv = () => {
    if (employees.length === 0) { toast.error('No employees to export'); return }
    let csv = 'Employee ID,Employee Name,Department,Designation,Mobile,Email,Status,Joining Date,QR Code,Family Name,Relationship,Family Mobile,Family Status\n'
    employees.forEach(emp => {
      if (emp.familyMembers && emp.familyMembers.length > 0) {
        emp.familyMembers.forEach(fam => {
          csv += `"${emp.id}","${emp.name}","${emp.department || ''}","${emp.designation || ''}","${emp.mobile || ''}","${emp.email || ''}","${emp.status}","${emp.joiningDate || ''}","${emp.qrCode || ''}","${fam.name || ''}","${fam.relationship || ''}","${fam.mobile || ''}","${fam.status || ''}"\n`
        })
      } else {
        csv += `"${emp.id}","${emp.name}","${emp.department || ''}","${emp.designation || ''}","${emp.mobile || ''}","${emp.email || ''}","${emp.status}","${emp.joiningDate || ''}","${emp.qrCode || ''}","","","",""\n`
      }
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `achariya-employees-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success('Exported Employees & Family Master CSV')
  }

  const handleImportEmployeesCsv = async (e) => {
    const file = e.target.files[0]; if (!file) return
    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) { toast.error('CSV must have header + at least 1 row'); return }

      const empMap = {}
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
        if (!row[0] || !row[1]) continue
        const empId = row[0].toUpperCase()
        if (!empMap[empId]) {
          empMap[empId] = {
            id: empId,
            name: row[1],
            department: row[2] || 'General',
            designation: row[3] || 'Staff',
            mobile: row[4] || '',
            email: row[5] || '',
            status: row[6] || 'Active',
            joiningDate: row[7] || new Date().toISOString().slice(0, 10),
            qrCode: row[8] || empId,
            familyMembers: []
          }
        }
        if (row[9]) {
          empMap[empId].familyMembers.push({
            id: 'FAM_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            employeeId: empId,
            name: row[9],
            relationship: row[10] || 'Other',
            mobile: row[11] || '',
            status: row[12] || 'Active'
          })
        }
      }

      const items = Object.values(empMap)
      const res = await fetch(`${API_BASE}/api/staff/employees/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Imported ${data.imported} new, updated ${data.updated} employees!`)
        fetchEmployees()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch (err) {
      toast.error('Failed to parse CSV file: ' + err.message)
    }
    if (importFileRef.current) importFileRef.current.value = ''
  }

  const todayPresent = attendance.filter(a => a.status === 'present').length
  const avgAttendance = Math.round(staff.reduce((sum, s) => sum + s.attendance, 0) / staff.length)

  const [tasks, setTasks] = useState(sampleTasks)
  const [targets, setTargets] = useState(sampleTargets)
  const [milestones, setMilestones] = useState(sampleMilestones)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', department: '', dueDate: '', priority: 'medium', milestone: '' })
  const [targetForm, setTargetForm] = useState({ title: '', description: '', department: '', targetValue: '', deadline: '', type: 'monthly' })

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStaff = () => {
    toast.success('Staff member added successfully')
    setShowAddModal(false)
  }

  const handleCreateTask = () => {
    const newTask = {
      id: `${tasks.length + 1}`,
      ...taskForm,
      status: 'pending',
      assigneeName: staff.find(s => s.id === taskForm.assigneeId)?.name || ''
    }
    setTasks([newTask, ...tasks])
    setShowTaskModal(false)
    setTaskForm({ title: '', description: '', assigneeId: '', department: '', dueDate: '', priority: 'medium', milestone: '' })
    toast.success('Task created successfully')
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    toast.success(`Task marked as ${newStatus}`)
  }

  const handleCreateTarget = () => {
    const newTarget = {
      id: `${targets.length + 1}`,
      ...targetForm,
      currentValue: 0
    }
    setTargets([...targets, newTarget])
    setShowTargetModal(false)
    setTargetForm({ title: '', description: '', department: '', targetValue: '', deadline: '', type: 'monthly' })
    toast.success('Target created successfully')
  }

  const getTaskStats = () => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  })

  const taskStats = getTaskStats()

  const handleAttendanceMark = (id, status) => {
    setAttendance(attendance.map(a => a.id === id ? { ...a, status } : a))
    toast.success(`Attendance marked as ${status}`)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Human Resources
        </h2>
        <p style={{ color: '#6b7280' }}>Manage staff, attendance, and shifts</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{staff.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Staff</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{todayPresent}/{attendance.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Present Today</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{avgAttendance}%</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Avg Attendance</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>3</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Active Shifts</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'achariya-staff', label: '🎓 Achariya Employee & Family Master', icon: Users },
          { id: 'staff', label: 'Staff Directory', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'shifts', label: 'Shift Management', icon: Clock },
          { id: 'tasks', label: 'Tasks', icon: ListChecks },
          { id: 'targets', label: 'Targets & Milestones', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: activeTab === tab.id ? '#e63946' : 'white',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        <Button onClick={() => activeTab === 'staff' ? setShowAddModal(true) : setShowShiftModal(true)}>
          <Plus size={18} />
          {activeTab === 'staff' ? 'Add Staff' : activeTab === 'shifts' ? 'Add Shift' : 'Mark Attendance'}
        </Button>
      </div>

      {/* Achariya Staff & Family Master Tab */}
      {activeTab === 'achariya-staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search by Employee ID, Name, Department, Mobile, or Family Member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button onClick={handleExportEmployeesCsv} variant="secondary" size="sm">
                <Download size={16} /> Export CSV
              </Button>
              <Button onClick={() => setShowBulkModal(true)} size="sm">
                <Upload size={16} /> Bulk Upload (CSV/Text)
              </Button>
              <Button onClick={handleOpenAddEmployee} size="sm">
                <Plus size={16} /> Add New Employee
              </Button>
            </div>
          </div>

          {/* Employee List Table */}
          <Card padding="none">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>Employee & Family Master</h3>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>{employees.length} Total Registered Achariya Staff Members</p>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#f5f3ff', color: '#7c3aed', fontWeight: 700, fontSize: '12px' }}>
                Achariya Family Week Active
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: '#f8fafc' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Emp ID</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Employee Name</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Dept / Designation</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Contact</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Family Members</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter(emp => {
                      if (!searchTerm) return true
                      const q = searchTerm.toLowerCase().trim()
                      return (
                        emp.id.toLowerCase().includes(q) ||
                        emp.name.toLowerCase().includes(q) ||
                        (emp.department || '').toLowerCase().includes(q) ||
                        (emp.mobile || '').includes(q) ||
                        (emp.familyMembers || []).some(f => f.name.toLowerCase().includes(q) || (f.mobile || '').includes(q))
                      )
                    })
                    .map(emp => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', background: '#eff6ff',
                            color: '#1d4ed8', fontWeight: 800, fontSize: '12.5px', fontFamily: 'monospace'
                          }}>
                            {emp.id}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '14px' }}>{emp.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Joined {emp.joiningDate || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>{emp.department || 'General'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{emp.designation || 'Staff'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>📱 {emp.mobile || 'No Mobile'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>✉️ {emp.email || 'No Email'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                            background: emp.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                            color: emp.status === 'Active' ? '#16a34a' : '#dc2626'
                          }}>
                            {emp.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {emp.familyMembers && emp.familyMembers.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {emp.familyMembers.map((fam, fIdx) => (
                                <div key={fIdx} style={{ fontSize: '12px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{fam.name}</span>
                                  <span style={{ color: '#64748b', fontSize: '10.5px' }}>({fam.relationship})</span>
                                  {fam.mobile && <span style={{ color: '#2563eb', fontSize: '10.5px' }}>📱 {fam.mobile}</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>None added</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => { setSelectedQrEmp(emp); setShowQrModal(true) }}
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Show QR Code"
                            >
                              <QrCode size={14} /> QR
                            </button>
                            <button
                              onClick={() => handleOpenEditEmployee(emp)}
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add / Edit Employee & Family Master Modal */}
      <Modal isOpen={showAchariyaModal} onClose={() => setShowAchariyaModal(false)} title={editingEmp ? `Edit Employee (${editingEmp.id})` : 'Add New Employee'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Employee ID *</label>
              <input
                type="text"
                disabled={!!editingEmp}
                placeholder="e.g. EMP001"
                value={empForm.id}
                onChange={e => setEmpForm({ ...empForm, id: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px', background: editingEmp ? '#f3f4f6' : 'white' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Employee Name *</label>
              <input
                type="text"
                placeholder="Full Name"
                value={empForm.name}
                onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Department</label>
              <select
                value={empForm.department}
                onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              >
                <option value="Teaching">Teaching</option>
                <option value="Admin">Admin</option>
                <option value="Billing">Billing</option>
                <option value="Management">Management</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Designation</label>
              <input
                type="text"
                placeholder="e.g. Professor, Manager"
                value={empForm.designation}
                onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Status</label>
              <select
                value={empForm.status}
                onChange={e => setEmpForm({ ...empForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Mobile Number</label>
              <input
                type="text"
                placeholder="10-digit mobile"
                value={empForm.mobile}
                onChange={e => setEmpForm({ ...empForm, mobile: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Email Address</label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={empForm.email}
                onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' }}>Joining Date</label>
              <input
                type="date"
                value={empForm.joiningDate}
                onChange={e => setEmpForm({ ...empForm, joiningDate: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* FAMILY MASTER SUB-SECTION */}
          <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>👨‍👩‍👧‍👦 Family Master ({empForm.familyMembers.length})</h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Family members eligible for 50% Benefit promotion</p>
              </div>
              <Button onClick={handleAddFamilyMemberRow} size="sm" variant="secondary">
                <Plus size={14} /> Add Family Member
              </Button>
            </div>

            {empForm.familyMembers.length === 0 ? (
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
                No family members added yet. Click "Add Family Member" above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {empForm.familyMembers.map((fam, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 100px auto', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Family Member Name"
                      value={fam.name}
                      onChange={e => handleUpdateFamilyMemberRow(idx, 'name', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                    <select
                      value={fam.relationship}
                      onChange={e => handleUpdateFamilyMemberRow(idx, 'relationship', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={fam.mobile}
                      onChange={e => handleUpdateFamilyMemberRow(idx, 'mobile', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                    <select
                      value={fam.status}
                      onChange={e => handleUpdateFamilyMemberRow(idx, 'status', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <button
                      onClick={() => handleRemoveFamilyMemberRow(idx)}
                      style={{ padding: '8px', border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button fullWidth onClick={handleSaveEmployee} style={{ marginTop: '12px' }}>
            <ShieldCheck size={18} /> {editingEmp ? 'Save Employee Changes' : 'Create Employee Record'}
          </Button>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title={`📱 Employee QR Code - ${selectedQrEmp?.name || ''}`} size="sm">
        {selectedQrEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px' }}>
            <div style={{
              width: '180px', height: '180px', background: '#1e293b', borderRadius: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white', border: '4px solid #7c3aed', boxShadow: '0 8px 24px rgba(124,58,237,0.25)'
            }}>
              <QrCode size={96} color="#c4b5fd" />
              <span style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>{selectedQrEmp.id}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{selectedQrEmp.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedQrEmp.department} - {selectedQrEmp.designation}</div>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>✓ Active 50% Benefit Eligible</div>
            </div>
            <Button onClick={() => window.print()} fullWidth variant="secondary">
              Print Badge / QR Code
            </Button>
          </div>
        )}
      </Modal>

      {/* Staff Directory */}
      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {filteredStaff.map(member => (
            <Card key={member.id} hover>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${roleColors[member.role].bg} 0%, ${roleColors[member.role].color}30 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: roleColors[member.role].color
                }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{member.name}</h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: roleColors[member.role].bg,
                    color: roleColors[member.role].color
                  }}>
                    {roleLabels[member.role]}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <Mail size={16} />
                  {member.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <Phone size={16} />
                  {member.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <Calendar size={16} />
                  Joined {member.joiningDate}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{member.attendance}%</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Attendance</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
                    <Star size={14} style={{ display: 'inline' }} /> {member.performance}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>₹{(member.salary / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Salary</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button variant="secondary" size="sm" style={{ flex: 1 }}>
                  <Edit size={14} />
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={14} color="#ef4444" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance */}
      {activeTab === 'attendance' && (
        <Card padding="none">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Today's Attendance</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>January 15, 2024</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                Present: {todayPresent}
              </span>
              <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                Absent: {attendance.length - todayPresent}
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Staff</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Check In</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Check Out</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => {
                  const staffMember = staff.find(s => s.name === record.name)
                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: roleColors[staffMember?.role]?.bg || '#f3f4f6',
                          color: roleColors[staffMember?.role]?.color || '#6b7280'
                        }}>
                          {roleLabels[staffMember?.role] || 'Staff'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontFamily: 'JetBrains Mono' }}>{record.checkIn}</td>
                      <td style={{ padding: '16px', fontFamily: 'JetBrains Mono' }}>{record.checkOut}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: record.status === 'present' ? '#f0fdf4' : '#fef2f2',
                          color: record.status === 'present' ? '#10b981' : '#ef4444',
                          textTransform: 'capitalize'
                        }}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {record.status === 'present' ? (
                          <Button variant="secondary" size="sm" onClick={() => handleAttendanceMark(record.id, 'absent')}>
                            <XCircle size={14} />
                            Mark Absent
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleAttendanceMark(record.id, 'present')}>
                            <CheckCircle size={14} />
                            Mark Present
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Shifts */}
      {activeTab === 'shifts' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {shifts.map(shift => (
              <Card key={shift.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{shift.name}</h3>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{shift.staffCount} staff assigned</span>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px' }}>
                    <Clock size={20} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Start Time</span>
                    <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{shift.startTime}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>End Time</span>
                    <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{shift.endTime}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="sm" style={{ flex: 1 }}>
                    <Edit size={14} />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Users size={14} />
                    Assign
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Weekly Schedule */}
          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Weekly Schedule</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Staff</th>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <th key={day} style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.slice(0, 4).map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{roleLabels[member.role]}</div>
                      </td>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <td key={day} style={{ padding: '8px', textAlign: 'center' }}>
                          {i < 5 ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: i < 3 ? '#eff6ff' : '#fef3c7',
                              color: i < 3 ? '#3b82f6' : '#d97706'
                            }}>
                              {i < 3 ? 'Morning' : 'Afternoon'}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Off</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Staff Member" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Full Name</label>
            <input type="text" placeholder="Enter full name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Role</label>
              <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <option>Manager</option>
                <option>Cashier</option>
                <option>Kitchen Staff</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Phone</label>
              <input type="text" placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Email</label>
            <input type="email" placeholder="staff@email.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Joining Date</label>
              <input type="date" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Monthly Salary</label>
              <input type="number" placeholder="₹" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <Button fullWidth onClick={handleAddStaff}>
            <UserPlus size={18} />
            Add Staff Member
          </Button>
        </div>
      </Modal>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          {/* Task Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>{taskStats.total}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Tasks</div>
            </Card>
            <Card>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{taskStats.pending}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Pending</div>
            </Card>
            <Card>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{taskStats.inProgress}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>In Progress</div>
            </Card>
            <Card>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{taskStats.completed}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Completed</div>
            </Card>
          </div>

          {/* Tasks List */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employee Tasks</h3>
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus size={18} />
                New Task
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  background: task.status === 'completed' ? '#f0fdf4' : 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>{task.title}</h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{task.description}</p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#16a34a'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                    <span>👤 {task.assigneeName}</span>
                    <span>📁 {task.department}</span>
                    <span>📅 Due: {task.dueDate}</span>
                    <span>🎯 {task.milestone}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    {task.status === 'pending' && (
                      <Button size="sm" onClick={() => handleTaskStatusChange(task.id, 'in-progress')}>Start</Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button size="sm" onClick={() => handleTaskStatusChange(task.id, 'completed')}>Complete</Button>
                    )}
                    {task.status === 'completed' && (
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Targets & Milestones Tab */}
      {activeTab === 'targets' && (
        <div>
          {/* Targets */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Department Targets</h3>
              <Button onClick={() => setShowTargetModal(true)}>
                <Plus size={18} />
                New Target
              </Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {targets.map(target => (
                <Card key={target.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>{target.title}</h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{target.description}</p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>
                      {target.type}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 600 }}>{Math.round((target.currentValue / target.targetValue) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min((target.currentValue / target.targetValue) * 100, 100)}%`,
                        background: target.currentValue >= target.targetValue ? '#10b981' : '#e63946',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    <span>₹{target.currentValue.toLocaleString()} / ₹{target.targetValue.toLocaleString()}</span>
                    <span>Due: {target.deadline}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Company Milestones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {milestones.map(milestone => (
                <Card key={milestone.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>{milestone.title}</h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{milestone.description}</p>
                    </div>
                    <Flag size={20} color="#e63946" />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 600 }}>{Math.round((milestone.currentValue / milestone.targetValue) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min((milestone.currentValue / milestone.targetValue) * 100, 100)}%`,
                        background: '#8b5cf6',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    <span>{milestone.currentValue} / {milestone.targetValue}</span>
                    <span>Due: {milestone.deadline}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Task Title</label>
            <input 
              type="text" 
              placeholder="Enter task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea 
              placeholder="Task description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Assign To</label>
              <select 
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm({...taskForm, assigneeId: e.target.value, department: staff.find(s => s.id === e.target.value)?.department || ''})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                <option value="">Select Employee</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Milestone</label>
              <select 
                value={taskForm.milestone}
                onChange={(e) => setTaskForm({...taskForm, milestone: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                <option value="">Select Milestone</option>
                <option value="Daily Operations">Daily Operations</option>
                <option value="Staff Training">Staff Training</option>
                <option value="Monthly Reports">Monthly Reports</option>
                <option value="Q1 Target">Q1 Target</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Due Date</label>
              <input 
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Priority</label>
              <select 
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Button fullWidth onClick={handleCreateTask}>
            <Target size={18} />
            Create Task
          </Button>
        </div>
      </Modal>

      {/* Create Target Modal */}
      <Modal isOpen={showTargetModal} onClose={() => setShowTargetModal(false)} title="Create New Target" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Target Title</label>
            <input 
              type="text" 
              placeholder="Enter target title"
              value={targetForm.title}
              onChange={(e) => setTargetForm({...targetForm, title: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea 
              placeholder="Target description"
              value={targetForm.description}
              onChange={(e) => setTargetForm({...targetForm, description: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Department</label>
              <select 
                value={targetForm.department}
                onChange={(e) => setTargetForm({...targetForm, department: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                <option value="">Select Department</option>
                <option value="All">All Departments</option>
                <option value="Management">Management</option>
                <option value="Billing">Billing</option>
                <option value="Kitchen">Kitchen</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Target Type</label>
              <select 
                value={targetForm.type}
                onChange={(e) => setTargetForm({...targetForm, type: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Target Value (₹)</label>
              <input 
                type="number"
                placeholder="Enter target amount"
                value={targetForm.targetValue}
                onChange={(e) => setTargetForm({...targetForm, targetValue: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Deadline</label>
              <input 
                type="date"
                value={targetForm.deadline}
                onChange={(e) => setTargetForm({...targetForm, deadline: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          <Button fullWidth onClick={handleCreateTarget}>
            <TrendingUp size={18} />
            Create Target
          </Button>
        </div>
      </Modal>

      <BulkUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        defaultType="staff"
        onSuccess={() => fetchEmployees()}
      />
    </div>
  )
}
