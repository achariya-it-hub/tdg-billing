import { useState, useEffect } from 'react'
import { Users, Plus, Search, UserPlus, Calendar, Clock, CheckCircle, XCircle, Award, Edit, Trash2, ChevronDown, Mail, Phone, Star } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const sampleStaff = [
  { id: '1', name: 'Rajesh Kumar', role: 'manager', email: 'rajesh@tdgbilling.com', phone: '+91 98765 43210', joiningDate: '2022-03-15', salary: 45000, attendance: 95, performance: 4.5 },
  { id: '2', name: 'Priya Sharma', role: 'cashier', email: 'priya@tdgbilling.com', phone: '+91 87654 32109', joiningDate: '2022-06-01', salary: 25000, attendance: 92, performance: 4.2 },
  { id: '3', name: 'Amit Singh', role: 'cashier', email: 'amit@tdgbilling.com', phone: '+91 76543 21098', joiningDate: '2023-01-10', salary: 25000, attendance: 88, performance: 4.0 },
  { id: '4', name: 'Sunita Verma', role: 'kitchen', email: 'sunita@tdgbilling.com', phone: '+91 65432 10987', joiningDate: '2022-09-20', salary: 30000, attendance: 96, performance: 4.8 },
  { id: '5', name: 'Vikram Yadav', role: 'kitchen', email: 'vikram@tdgbilling.com', phone: '+91 54321 09876', joiningDate: '2023-03-05', salary: 28000, attendance: 85, performance: 3.8 },
  { id: '6', name: 'Neha Patel', role: 'cashier', email: 'neha@tdgbilling.com', phone: '+91 43210 98765', joiningDate: '2023-07-15', salary: 22000, attendance: 90, performance: 4.1 },
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
  const [activeTab, setActiveTab] = useState('staff')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const todayPresent = attendance.filter(a => a.status === 'present').length
  const avgAttendance = Math.round(staff.reduce((sum, s) => sum + s.attendance, 0) / staff.length)

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStaff = () => {
    toast.success('Staff member added successfully')
    setShowAddModal(false)
  }

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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'staff', label: 'Staff Directory', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'shifts', label: 'Shift Management', icon: Clock },
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
    </div>
  )
}
