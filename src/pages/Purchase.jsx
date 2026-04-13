import { useState, useEffect, useRef } from 'react'
import { Package, Plus, Search, Edit, Trash2, Truck, Phone, Mail, MapPin, ChevronRight, AlertTriangle, CheckCircle, FileText, XCircle, ArrowRight, Upload, Image, X, Loader2, ScanLine } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const sampleSuppliers = [
  { id: '1', name: 'Fresh Poultry Co.', contact: '+91 98765 43210', email: 'orders@freshpoultry.com', address: '123 Market Road, Mumbai', category: 'Proteins', rating: 4.5, defaultInvoiceNo: 'FPC-', invoicePrefix: 'FPC-INV-' },
  { id: '2', name: 'City Bakery', contact: '+91 87654 32109', email: 'supply@citybakery.in', address: '45 Industrial Area, Mumbai', category: 'Bakery', rating: 4.2, defaultInvoiceNo: 'CB-', invoicePrefix: 'CB-INV-' },
  { id: '3', name: 'Food Supplies Inc.', contact: '+91 76543 21098', email: 'bulk@foodsupplies.com', address: '78 Distribution Center, Mumbai', category: 'Groceries', rating: 4.8, defaultInvoiceNo: 'FSI-', invoicePrefix: 'FSI-INV-' },
  { id: '4', name: 'BevCo', contact: '+91 65432 10987', email: 'orders@bevco.in', address: '12 Beverages Lane, Mumbai', category: 'Beverages', rating: 4.0, defaultInvoiceNo: 'BC-', invoicePrefix: 'BC-INV-' },
]

const samplePOItems = [
  { id: 'PI001', poId: 'PO001', name: 'Chicken Breast', quantity: 50, unit: 'kg', rate: 180, received: 0 },
  { id: 'PI002', poId: 'PO001', name: 'Chicken Legs', quantity: 30, unit: 'kg', rate: 120, received: 0 },
  { id: 'PI003', poId: 'PO001', name: 'Chicken Wings', quantity: 25, unit: 'kg', rate: 200, received: 0 },
  { id: 'PI004', poId: 'PO002', name: 'Burger Buns', quantity: 200, unit: 'pcs', rate: 8, received: 200 },
  { id: 'PI005', poId: 'PO002', name: 'Pizza Base', quantity: 100, unit: 'pcs', rate: 15, received: 100 },
  { id: 'PI006', poId: 'PO003', name: 'Fries (Frozen)', quantity: 50, unit: 'kg', rate: 45, received: 50 },
  { id: 'PI007', poId: 'PO003', name: 'Onion Rings', quantity: 30, unit: 'kg', rate: 60, received: 30 },
  { id: 'PI008', poId: 'PO004', name: 'Pepsi Syrup', quantity: 20, unit: 'liters', rate: 350, received: 0 },
]

const sampleGRNs = [
  { id: 'GRN001', poId: 'PO002', supplier: 'City Bakery', date: '2024-01-14', items: 2, totalValue: 3100, status: 'completed', invoiceNo: 'INV-001', invoiceImage: null },
  { id: 'GRN002', poId: 'PO003', supplier: 'Food Supplies Inc.', date: '2024-01-13', items: 2, totalValue: 4050, status: 'completed', invoiceNo: 'INV-002', invoiceImage: null },
]

const samplePurchaseOrders = [
  { id: 'PO001', supplier: 'Fresh Poultry Co.', items: 3, total: 19500, status: 'pending', date: '2024-01-15', expectedDate: '2024-01-17' },
  { id: 'PO002', supplier: 'City Bakery', items: 2, total: 3100, status: 'partial', date: '2024-01-14', expectedDate: '2024-01-15' },
  { id: 'PO003', supplier: 'Food Supplies Inc.', items: 2, total: 4050, status: 'completed', date: '2024-01-13', expectedDate: '2024-01-14' },
  { id: 'PO004', supplier: 'BevCo', items: 1, total: 7000, status: 'pending', date: '2024-01-15', expectedDate: '2024-01-18' },
]

export default function Purchase() {
  const toast = useToast()
  const [suppliers, setSuppliers] = useState(sampleSuppliers)
  const [purchaseOrders, setPurchaseOrders] = useState(samplePurchaseOrders)
  const [poItems, setPoItems] = useState(samplePOItems)
  const [grns, setGrns] = useState(sampleGRNs)
  const [activeTab, setActiveTab] = useState('orders')
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showPOModal, setShowPOModal] = useState(false)
  const [showGRNModal, setShowGRNModal] = useState(false)
  const [showGRNDetailModal, setShowGRNDetailModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [selectedGRN, setSelectedGRN] = useState(null)
  const [grnFormData, setGrnFormData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false)
  const [invoiceItems, setInvoiceItems] = useState([])

  const statusColors = {
    pending: '#f59e0b',
    approved: '#3b82f6',
    ordered: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    partial: '#6366f1',
    completed: '#10b981'
  }

  const mockOCRProcessing = (imageData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const possibleItems = [
          { name: 'Chicken Breast', quantity: 50, rate: 180 },
          { name: 'Chicken Legs', quantity: 30, rate: 120 },
          { name: 'Chicken Wings', quantity: 25, rate: 200 },
          { name: 'Burger Buns', quantity: 200, rate: 8 },
          { name: 'Pizza Base', quantity: 100, rate: 15 },
          { name: 'Fries (Frozen)', quantity: 50, rate: 45 },
          { name: 'Onion Rings', quantity: 30, rate: 60 },
          { name: 'Pepsi Syrup', quantity: 20, rate: 350 },
          { name: 'Cooking Oil', quantity: 40, rate: 120 },
          { name: 'Tomato Ketchup', quantity: 15, rate: 80 },
        ]
        const numItems = Math.floor(Math.random() * 4) + 2
        const shuffled = possibleItems.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, numItems)
        resolve(selected)
      }, 2000)
    })
  }

  const processVendorInvoice = async (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target.result
      setGrnFormData({...grnFormData, invoiceImage: imageData})
      setIsProcessingInvoice(true)
      
      try {
        const extractedItems = await mockOCRProcessing(imageData)
        setInvoiceItems(extractedItems)
        
        const updatedItems = grnFormData.items.map(poItem => {
          const matched = extractedItems.find(inv => 
            inv.name.toLowerCase().includes(poItem.name.toLowerCase()) ||
            poItem.name.toLowerCase().includes(inv.name.toLowerCase())
          )
          if (matched) {
            return {
              ...poItem,
              receivingQty: matched.quantity,
              isValid: matched.quantity > 0 && matched.quantity <= (poItem.quantity - poItem.received),
              fromInvoice: true,
              matchedName: matched.name
            }
          }
          return { ...poItem, fromInvoice: false }
        })
        
        setGrnFormData({...grnFormData, items: updatedItems, invoiceImage: imageData})
        toast.success(`Extracted ${extractedItems.length} items from invoice`)
      } catch (error) {
        toast.error('Failed to process invoice')
      } finally {
        setIsProcessingInvoice(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const getPOItems = (poId) => poItems.filter(item => item.poId === poId)

  const openGRNModal = (po) => {
    setSelectedPO(po)
    const items = getPOItems(po.id)
    const supplier = suppliers.find(s => s.name === po.supplier)
    const invoicePrefix = supplier?.invoicePrefix || 'INV-'
    const randomNum = Math.floor(Math.random() * 9000) + 1000
    const autoInvoiceNo = `${invoicePrefix}${new Date().getFullYear()}-${randomNum}`
    
    setGrnFormData({
      items: items.map(item => ({
        ...item,
        receivingQty: item.quantity - item.received,
        isValid: true,
        notes: '',
        fromInvoice: false,
        matchedName: null
      })),
      invoiceNo: autoInvoiceNo,
      vehicleNo: '',
      invoiceImage: null,
      receivedBy: '',
      remarks: '',
      supplierContact: supplier?.contact || '',
      supplierEmail: supplier?.email || ''
    })
    setInvoiceItems([])
    setShowGRNModal(true)
  }

  const handleGRNSave = () => {
    const receivedItems = grnFormData.items.filter(item => item.receivingQty > 0)
    const totalValue = receivedItems.reduce((sum, item) => sum + (item.receivingQty * item.rate), 0)
    
    const newGRN = {
      id: `GRN00${grns.length + 1}`,
      poId: selectedPO.id,
      supplier: selectedPO.supplier,
      date: new Date().toISOString().split('T')[0],
      items: receivedItems.length,
      totalValue,
      status: 'completed',
      invoiceNo: grnFormData.invoiceNo || '',
      invoiceImage: grnFormData.invoiceImage || null
    }

    const updatedPOItems = poItems.map(item => {
      const grnItem = grnFormData.items.find(i => i.id === item.id)
      if (grnItem && grnItem.receivingQty > 0) {
        return { ...item, received: item.received + grnItem.receivingQty }
      }
      return item
    })

    let newStatus = 'partial'
    const poItemsUpdated = updatedPOItems.filter(i => i.poId === selectedPO.id)
    if (poItemsUpdated.every(i => i.received >= i.quantity)) {
      newStatus = 'completed'
    }

    setGrns([...grns, newGRN])
    setPoItems(updatedPOItems)
    setPurchaseOrders(purchaseOrders.map(po => 
      po.id === selectedPO.id ? { ...po, status: newStatus } : po
    ))

    toast.success(`GRN ${newGRN.id} created successfully! Inventory updated.`)
    setShowGRNModal(false)
  }

  const updateGRNItem = (itemId, field, value) => {
    setGrnFormData({
      ...grnFormData,
      items: grnFormData.items.map(item => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value }
          if (field === 'receivingQty') {
            newItem.isValid = value > 0 && value <= (item.quantity - item.received)
          }
          return newItem
        }
        return item
      })
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Purchase Management
        </h2>
        <p style={{ color: '#6b7280' }}>Manage suppliers and purchase orders</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#e63946" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{purchaseOrders.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Orders</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{purchaseOrders.filter(p => p.status === 'pending').length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Pending</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{purchaseOrders.filter(p => p.status === 'delivered').length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Delivered</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{purchaseOrders.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Value</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'orders', label: 'Purchase Orders', count: purchaseOrders.length },
          { id: 'grn', label: 'GRN/MRN', count: grns.length },
          { id: 'suppliers', label: 'Suppliers', count: suppliers.length },
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
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search..."
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
        <Button onClick={() => {
          if (activeTab === 'orders') setShowPOModal(true)
          else if (activeTab === 'suppliers') setShowSupplierModal(true)
          else if (activeTab === 'grn') toast.info('GRN is created from Purchase Orders using "Receive" button')
        }}>
          <Plus size={18} />
          {activeTab === 'orders' ? 'New Order' : activeTab === 'suppliers' ? 'Add Supplier' : activeTab === 'grn' ? 'How to Create GRN' : ''}
        </Button>
      </div>

      {/* Purchase Orders Table */}
      {activeTab === 'orders' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>PO Number</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Items</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#1a1a2e' }}>{order.id}</td>
                    <td style={{ padding: '16px' }}>{order.supplier}</td>
                    <td style={{ padding: '16px' }}>{order.items}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>₹{order.total.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{order.date}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: `${statusColors[order.status]}15`,
                        color: statusColors[order.status],
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status !== 'completed' && (
                          <button 
                            onClick={() => openGRNModal(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: 'var(--accent-primary)',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Truck size={14} />
                            Receive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* GRN/MRN Table */}
      {activeTab === 'grn' && (
        <Card padding="none">
          {grns.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <FileText size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No GRN Created</h3>
              <p style={{ color: '#6b7280' }}>GRN will appear here when you receive goods against a Purchase Order</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>GRN Number</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>PO Number</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Invoice No.</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Items</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Value</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grns.map(grn => (
                    <tr key={grn.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#e63946' }}>{grn.id}</td>
                      <td style={{ padding: '16px' }}>{grn.poId}</td>
                      <td style={{ padding: '16px' }}>{grn.invoiceNo || '-'}</td>
                      <td style={{ padding: '16px' }}>{grn.supplier}</td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{grn.date}</td>
                      <td style={{ padding: '16px' }}>{grn.items}</td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>₹{grn.totalValue.toLocaleString()}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#f0fdf415',
                          color: '#10b981'
                        }}>
                          {grn.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                          onClick={() => { setSelectedGRN(grn); setShowGRNDetailModal(true) }}
                        >
                          <ChevronRight size={18} color="#6b7280" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Suppliers Grid */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {suppliers.map(supplier => (
            <Card key={supplier.id} hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{supplier.name}</h3>
                  <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>
                    {supplier.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ background: '#eff6ff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Edit size={16} color="#3b82f6" />
                  </button>
                  <button style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <Phone size={16} />
                  {supplier.contact}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <Mail size={16} />
                  {supplier.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                  <MapPin size={16} />
                  {supplier.address}
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#f59e0b' }}>★</span>
                  <span style={{ fontWeight: 600 }}>{supplier.rating}</span>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>/ 5.0</span>
                </div>
                <Button variant="secondary" size="sm">View Orders</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      <Modal isOpen={showSupplierModal} onClose={() => setShowSupplierModal(false)} title="Add Supplier">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier Name</label>
            <input type="text" placeholder="Enter supplier name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Category</label>
            <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <option>Proteins</option>
              <option>Bakery</option>
              <option>Groceries</option>
              <option>Beverages</option>
              <option>Supplies</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Contact Number</label>
            <input type="text" placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Email</label>
            <input type="email" placeholder="supplier@email.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Address</label>
            <textarea placeholder="Full address" rows={3} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }} />
          </div>
          <Button fullWidth onClick={() => { toast.success('Supplier added successfully'); setShowSupplierModal(false) }}>
            Add Supplier
          </Button>
        </div>
      </Modal>

      {/* Purchase Order Modal */}
      <Modal isOpen={showPOModal} onClose={() => setShowPOModal(false)} title="Create Purchase Order" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier</label>
              <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <option>Select Supplier</option>
                {suppliers.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Expected Delivery</label>
              <input type="date" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Items</label>
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', marginBottom: '12px' }}>Add items to this purchase order</p>
              <Button variant="secondary" onClick={() => toast.info('Add items feature coming soon')}>
                <Plus size={18} />
                Add Item
              </Button>
            </div>
          </div>
          <Button fullWidth onClick={() => { toast.success('Purchase order created'); setShowPOModal(false) }}>
            Create Order
          </Button>
        </div>
      </Modal>

      {/* GRN Creation Modal */}
      <Modal isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} title="Create GRN / Receive Goods" size="lg">
        {selectedPO && grnFormData.items && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>PO Number</span>
                <span style={{ fontWeight: 600 }}>{selectedPO.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Supplier</span>
                <span style={{ fontWeight: 600 }}>{selectedPO.supplier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Expected Date</span>
                <span style={{ fontWeight: 600 }}>{selectedPO.expectedDate}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier Invoice Number</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Supplier's Invoice No."
                    value={grnFormData.invoiceNo || ''}
                    onChange={(e) => setGrnFormData({...grnFormData, invoiceNo: e.target.value})}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} 
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9ca3af' }}>Auto-generated</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Vehicle Number</label>
                <input 
                  type="text" 
                  placeholder="e.g., MH-01-AB-1234"
                  value={grnFormData.vehicleNo || ''}
                  onChange={(e) => setGrnFormData({...grnFormData, vehicleNo: e.target.value})}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Vendor Invoice Image</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier Contact</div>
                    <div style={{ fontWeight: 600 }}>{grnFormData.supplierContact || 'N/A'}</div>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier Email</div>
                    <div style={{ fontWeight: 600 }}>{grnFormData.supplierEmail || 'N/A'}</div>
                  </div>
                </div>
                <div 
                  style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: '12px', 
                    padding: '24px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: grnFormData.invoiceImage ? '#f0fdf4' : '#f9fafb'
                  }}
                  onClick={() => document.getElementById('invoiceUpload').click()}
                >
                  {grnFormData.invoiceImage ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={grnFormData.invoiceImage} 
                        alt="Invoice" 
                        style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setGrnFormData({...grnFormData, invoiceImage: null}) }}
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                      <p style={{ color: '#6b7280', marginBottom: '4px' }}>Upload vendor invoice</p>
                      <p style={{ color: '#9ca3af', fontSize: '12px' }}>PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              <input 
                id="invoiceUpload"
                type="file" 
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    processVendorInvoice(file)
                  }
                }}
              />
            </div>

            {isProcessingInvoice && (
              <div style={{ 
                background: '#eff6ff', 
                borderRadius: '12px', 
                padding: '24px', 
                textAlign: 'center',
                border: '1px solid #3b82f6'
              }}>
                <Loader2 size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                <p style={{ color: '#1e40af', fontWeight: 600 }}>Processing Invoice...</p>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Extracting items from vendor invoice</p>
              </div>
            )}

            {invoiceItems.length > 0 && !isProcessingInvoice && (
              <div style={{ 
                background: '#f0fdf4', 
                borderRadius: '12px', 
                padding: '16px',
                border: '1px solid #10b981'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ScanLine size={20} color="#10b981" />
                  <span style={{ fontWeight: 600, color: '#10b981' }}>Extracted {invoiceItems.length} items from invoice</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Items have been auto-filled from vendor invoice. You can adjust quantities if needed.
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Items to Receive</label>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Item</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Ordered</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Received</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Receiving</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnFormData.items.map(item => (
                      <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.unit}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>{item.received}</td>
                        <td style={{ padding: '12px' }}>
                          <input 
                            type="number" 
                            min="0"
                            max={item.quantity - item.received}
                            value={item.receivingQty}
                            onChange={(e) => updateGRNItem(item.id, 'receivingQty', parseFloat(e.target.value) || 0)}
                            style={{ 
                              width: '80px', 
                              padding: '8px', 
                              borderRadius: '8px', 
                              border: item.isValid ? '1px solid var(--border)' : '2px solid #ef4444'
                            }} 
                          />
                        </td>
                        <td style={{ padding: '12px' }}>₹{item.rate}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{(item.receivingQty * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Received By</label>
              <input 
                type="text" 
                placeholder="Name of person receiving goods"
                value={grnFormData.receivedBy || ''}
                onChange={(e) => setGrnFormData({...grnFormData, receivedBy: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Remarks (Optional)</label>
              <textarea 
                placeholder="Any notes or observations..."
                value={grnFormData.remarks || ''}
                onChange={(e) => setGrnFormData({...grnFormData, remarks: e.target.value})}
                rows={2}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <Button variant="secondary" onClick={() => setShowGRNModal(false)}>Cancel</Button>
              <Button onClick={handleGRNSave}>
                <CheckCircle size={18} />
                Create GRN & Update Inventory
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* GRN Detail Modal */}
      <Modal isOpen={showGRNDetailModal} onClose={() => setShowGRNDetailModal(false)} title={`GRN ${selectedGRN?.id || ''}`} size="lg">
        {selectedGRN && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>GRN Number</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#e63946' }}>{selectedGRN.id}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{selectedGRN.date}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>PO Number</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedGRN.poId}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedGRN.supplier}</div>
              </div>
              {selectedGRN.invoiceNo && (
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Invoice Number</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedGRN.invoiceNo}</div>
                </div>
              )}
              {selectedGRN.invoiceImage && (
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Invoice Image</div>
                  <img 
                    src={selectedGRN.invoiceImage} 
                    alt="Invoice" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => window.open(selectedGRN.invoiceImage, '_blank')}
                  />
                </div>
              )}
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Items Received</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{selectedGRN.items}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Value</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>₹{selectedGRN.totalValue.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowGRNDetailModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
