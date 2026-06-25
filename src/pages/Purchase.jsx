import { useState, useEffect, useRef } from 'react'
import { Package, Plus, Search, Edit, Trash2, Truck, Phone, Mail, MapPin, ChevronRight, AlertTriangle, CheckCircle, FileText, XCircle, ArrowRight, Upload, Image, X, Loader2, ScanLine, Printer } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const API = () => window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin

const fallbackSuppliers = [
  { id: '1', name: 'Fresh Poultry Co.', contact: '+91 98765 43210', email: 'orders@freshpoultry.com', address: '123 Market Road, Mumbai', category: 'Proteins', rating: 4.5, defaultInvoiceNo: 'FPC-', invoicePrefix: 'FPC-INV-' },
  { id: '2', name: 'City Bakery', contact: '+91 87654 32109', email: 'supply@citybakery.in', address: '45 Industrial Area, Mumbai', category: 'Bakery', rating: 4.2, defaultInvoiceNo: 'CB-', invoicePrefix: 'CB-INV-' },
  { id: '3', name: 'Food Supplies Inc.', contact: '+91 76543 21098', email: 'bulk@foodsupplies.com', address: '78 Distribution Center, Mumbai', category: 'Groceries', rating: 4.8, defaultInvoiceNo: 'FSI-', invoicePrefix: 'FSI-INV-' },
  { id: '4', name: 'BevCo', contact: '+91 65432 10987', email: 'orders@bevco.in', address: '12 Beverages Lane, Mumbai', category: 'Beverages', rating: 4.0, defaultInvoiceNo: 'BC-', invoicePrefix: 'BC-INV-' },
]

export default function Purchase() {
  const toast = useToast()
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [poItems, setPoItems] = useState([])
  const [grns, setGrns] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showPOModal, setShowPOModal] = useState(false)
  const [showGRNModal, setShowGRNModal] = useState(false)
  const [showGRNDetailModal, setShowGRNDetailModal] = useState(false)
  const [showSupplierOrdersModal, setShowSupplierOrdersModal] = useState(false)
  const [selectedSupplierOrders, setSelectedSupplierOrders] = useState(null)
  const [selectedPO, setSelectedPO] = useState(null)
  const [selectedGRN, setSelectedGRN] = useState(null)
  const [supplierForm, setSupplierForm] = useState({ name: '', category: 'Proteins', contact: '', email: '', address: '' })
  const [grnFormData, setGrnFormData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false)
  const [invoiceItems, setInvoiceItems] = useState([])
  const [globalInventory, setGlobalInventory] = useState([])
  const [poForm, setPoForm] = useState({ supplier: '', expectedDate: '', items: [] })
  const [showPOItemModal, setShowPOItemModal] = useState(false)
  const [poItemForm, setPoItemForm] = useState({ name: '', quantity: '', unit: 'kg', rate: '' })

  useEffect(() => {
    Promise.all([
      fetch(`${API()}/api/admin/suppliers`).then(r => r.json()).catch(() => fallbackSuppliers),
      fetch(`${API()}/api/admin/purchase-orders`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/admin/po-items`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/admin/grns`).then(r => r.json()).catch(() => []),
      fetch(`${API()}/api/inventory`).then(r => r.json()).catch(() => []),
    ]).then(([s, po, poi, g, inv]) => {
      if (s?.length) setSuppliers(s); else setSuppliers(fallbackSuppliers)
      if (po?.length) setPurchaseOrders(po)
      if (poi?.length) setPoItems(poi)
      if (g?.length) setGrns(g)
      if (inv?.length) setGlobalInventory(inv)
    })
  }, [])

  const printPO = (order) => {
    const win = window.open('', '_blank')
    if (!win) { alert('Please allow pop-ups for printing'); return }
    const lineItems = poItems.filter(i => i.poId === order.id)
    const dateStr = new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const html = `
      <!DOCTYPE html><html><head><title>PO ${order.id}</title>
      <style>
        @page { margin: 8mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; color: #1a1a2e; padding: 24px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #e63946; margin-bottom: 20px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand img { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; }
        .brand-info h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #e63946; margin-bottom: 1px; }
        .brand-info .addr { font-size: 10px; color: #6b7280; line-height: 1.4; }
        .doc-title { text-align: right; }
        .doc-title h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .doc-title p { font-size: 11px; color: #6b7280; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .info-box { background: #f9fafb; border-radius: 8px; padding: 12px; }
        .info-box .label { font-size: 11px; color: #6b7280; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .info-box .value { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .amount { text-align: right; font-weight: 600; }
        .total-row td { border-top: 2px solid #1a1a2e; font-weight: 700; font-size: 15px; padding: 12px; border-bottom: none; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature div { text-align: center; width: 200px; }
        .signature .line { border-top: 1px solid #1a1a2e; margin-bottom: 6px; padding-top: 8px; font-size: 12px; color: #6b7280; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; background: #fef3c7; color: #d97706; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style></head><body>
      <div class="header">
        <div class="brand">
          <img src="https://raw.githubusercontent.com/tdg-in/tdg/main/public/TDG%20LOGO.png" onerror="this.src='/TDG LOGO.png'" />
          <div class="brand-info">
            <h1>TDG</h1>
            <div class="addr">Mumbai, Maharashtra, India<br>Contact: +91 98765 43210 | orders@tdg.com</div>
          </div>
        </div>
        <div class="doc-title">
          <h2>PURCHASE ORDER</h2>
          <p>#${order.id}</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-box">
          <div class="label">Supplier</div>
          <div class="value">${order.supplier}</div>
        </div>
        <div class="info-box">
          <div class="label">Order Date</div>
          <div class="value">${dateStr}</div>
        </div>
        <div class="info-box">
          <div class="label">Expected Delivery</div>
          <div class="value">${order.expectedDate || 'N/A'}</div>
        </div>
        <div class="info-box">
          <div class="label">Status</div>
          <div class="value"><span class="badge">${order.status}</span></div>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>Rate</th><th class="amount">Amount</th></tr></thead>
        <tbody>
          ${lineItems.length > 0 ? lineItems.map((item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${item.name}</td>
              <td>${item.quantity || '-'}</td>
              <td>${item.unit || '-'}</td>
              <td class="amount">₹${(item.rate || 0).toLocaleString()}</td>
              <td class="amount">₹${((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
            </tr>
          `).join('') : `<tr><td colspan="6" style="text-align:center;color:#6b7280;">No items listed</td></tr>`}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;">
        <div style="width:250px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;"><span>Subtotal</span><span class="amount">₹${order.total.toLocaleString()}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#6b7280;"><span>Tax</span><span class="amount">Incl.</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #1a1a2e;font-weight:700;font-size:18px;"><span>Total</span><span style="color:#e63946;" class="amount">₹${order.total.toLocaleString()}</span></div>
        </div>
      </div>
      <div class="footer">
        <div>${order.supplier}</div>
        <div>TDG &bull; Mumbai, Maharashtra &bull; ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
      <div class="signature">
        <div><div class="line">Prepared By</div></div>
        <div><div class="line">Approved By</div></div>
        <div><div class="line">Received By</div></div>
      </div>
      <div class="no-print" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:12px 32px;background:#e63946;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Print</button></div>
    </body></html>`
    win.document.write(html)
    win.document.close()
  }

  const printGRN = (grn) => {
    const win = window.open('', '_blank')
    if (!win) { alert('Please allow pop-ups for printing'); return }
    const dateStr = new Date(grn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const html = `
      <!DOCTYPE html><html><head><title>GRN ${grn.id}</title>
      <style>
        @page { margin: 8mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; color: #1a1a2e; padding: 24px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #2a9d8f; margin-bottom: 20px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand img { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; }
        .brand-info h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #e63946; margin-bottom: 1px; }
        .brand-info .addr { font-size: 10px; color: #6b7280; line-height: 1.4; }
        .doc-title { text-align: right; }
        .doc-title h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .doc-title p { font-size: 11px; color: #6b7280; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .info-box { background: #f9fafb; border-radius: 8px; padding: 12px; }
        .info-box .label { font-size: 11px; color: #6b7280; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .info-box .value { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        .summary { background: #f0fdf4; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .summary .stat { text-align: center; }
        .summary .stat .num { font-size: 28px; font-weight: 700; color: #10b981; }
        .summary .stat .lbl { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .remarks { background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
        .remarks .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px; }
        .remarks .text { font-size: 14px; color: #1a1a2e; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
        .signature { margin-top: 40px; display: flex; justify-content: space-around; }
        .signature div { text-align: center; width: 180px; }
        .signature .line { border-top: 1px solid #1a1a2e; margin-bottom: 6px; padding-top: 8px; font-size: 12px; color: #6b7280; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style></head><body>
      <div class="header">
        <div class="brand">
          <img src="https://raw.githubusercontent.com/tdg-in/tdg/main/public/TDG%20LOGO.png" onerror="this.src='/TDG LOGO.png'" />
          <div class="brand-info">
            <h1>TDG</h1>
            <div class="addr">Mumbai, Maharashtra, India<br>Contact: +91 98765 43210 | orders@tdg.com</div>
          </div>
        </div>
        <div class="doc-title">
          <h2>GOODS RECEIPT NOTE</h2>
          <p>#${grn.id}</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-box"><div class="label">PO Number</div><div class="value">${grn.poId || 'N/A'}</div></div>
        <div class="info-box"><div class="label">Supplier</div><div class="value">${grn.supplier}</div></div>
        <div class="info-box"><div class="label">Date</div><div class="value">${dateStr}</div></div>
        <div class="info-box"><div class="label">Invoice No.</div><div class="value">${grn.invoiceNo || 'N/A'}</div></div>
        <div class="info-box"><div class="label">Vehicle No.</div><div class="value">${grn.vehicleNo || 'N/A'}</div></div>
        <div class="info-box"><div class="label">Received By</div><div class="value">${grn.receivedBy || 'N/A'}</div></div>
      </div>
      <div class="summary">
        <div class="stat"><div class="num">${grn.items}</div><div class="lbl">Items Received</div></div>
        <div class="stat"><div class="num">₹${(grn.totalValue || 0).toLocaleString()}</div><div class="lbl">Total Value</div></div>
        <div class="stat"><div class="lbl" style="font-size:11px;color:#10b981;font-weight:600;">Status</div><div style="font-size:16px;font-weight:600;color:#10b981;text-transform:capitalize;">${grn.status || 'completed'}</div></div>
      </div>
      ${grn.remarks ? `<div class="remarks"><div class="label">Remarks</div><div class="text">${grn.remarks}</div></div>` : ''}
      <div style="margin-top:16px;padding:12px;background:#fefce8;border-radius:8px;font-size:12px;color:#92400e;text-align:center;">
        This GRN certifies that the above items have been received in good condition and verified against PO #${grn.poId || 'N/A'}.
      </div>
      <div class="signature">
        <div><div class="line">Received By</div></div>
        <div><div class="line">Verified By</div></div>
        <div><div class="line">Store In-charge</div></div>
      </div>
      <div class="footer">
        <p>TDG &bull; Mumbai, Maharashtra, India &bull; Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
      <div class="no-print" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:12px 32px;background:#2a9d8f;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Print GRN</button></div>
    </body></html>`
    win.document.write(html)
    win.document.close()
  }

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

  const handleGRNSave = async () => {
    const receivedItems = grnFormData.items.filter(item => item.receivingQty > 0)
    const totalValue = receivedItems.reduce((sum, item) => sum + (item.receivingQty * item.rate), 0)

    const updatedPOItems = poItems.map(item => {
      const grnItem = grnFormData.items.find(i => i.id === item.id)
      if (grnItem && grnItem.receivingQty > 0) {
        return { ...item, received: item.received + grnItem.receivingQty }
      }
      return item
    })

    let newStatus = 'partial'
    const poItemsUpdated = updatedPOItems.filter(i => i.poId === selectedPO.id)
    if (poItemsUpdated.every(i => i.received >= i.quantity)) newStatus = 'completed'

    try {
      const r = await fetch(`${API()}/api/admin/grns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId: selectedPO.id, supplier: selectedPO.supplier, items: receivedItems.length, totalValue, invoiceNo: grnFormData.invoiceNo || '', invoiceImage: grnFormData.invoiceImage || null, receivedBy: grnFormData.receivedBy || '', remarks: grnFormData.remarks || '', vehicleNo: grnFormData.vehicleNo || '' })
      })
      if (!r.ok) throw Error()
      const newGRN = await r.json()
      // Update PO status
      await fetch(`${API()}/api/admin/purchase-orders/${selectedPO.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      setGrns(prev => [...prev, newGRN])
      setPoItems(updatedPOItems)
      setPurchaseOrders(prev => prev.map(po => po.id === selectedPO.id ? { ...po, status: newStatus } : po))
      toast.success(`GRN ${newGRN.id} created successfully!`)
    } catch { toast.error('Failed to save GRN') }
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
                        <button 
                          onClick={() => printPO(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#f3f4f6',
                            color: '#4b5563',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer size={14} />
                          Print
                        </button>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => printGRN(grn)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: '#f0fdf4',
                              color: '#10b981',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                            onClick={() => { setSelectedGRN(grn); setShowGRNDetailModal(true) }}
                          >
                            <ChevronRight size={18} color="#6b7280" />
                          </button>
                        </div>
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
                <Button variant="secondary" size="sm" onClick={() => {
                  const orders = purchaseOrders.filter(p => p.supplier === supplier.name)
                  setSelectedSupplierOrders({ supplier: supplier.name, orders })
                  setShowSupplierOrdersModal(true)
                }}>View Orders</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      <Modal isOpen={showSupplierModal} onClose={() => { setShowSupplierModal(false); setSupplierForm({ name: '', category: 'Proteins', contact: '', email: '', address: '' }) }} title="Add Supplier">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier Name</label>
            <input type="text" value={supplierForm.name} onChange={e => setSupplierForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter supplier name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Category</label>
            <select value={supplierForm.category} onChange={e => setSupplierForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <option value="Proteins">Proteins</option>
              <option value="Bakery">Bakery</option>
              <option value="Groceries">Groceries</option>
              <option value="Beverages">Beverages</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Contact Number</label>
            <input type="text" value={supplierForm.contact} onChange={e => setSupplierForm(p => ({ ...p, contact: e.target.value }))} placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Email</label>
            <input type="email" value={supplierForm.email} onChange={e => setSupplierForm(p => ({ ...p, email: e.target.value }))} placeholder="supplier@email.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Address</label>
            <textarea value={supplierForm.address} onChange={e => setSupplierForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" rows={3} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }} />
          </div>
          <Button fullWidth onClick={async () => {
            if (!supplierForm.name.trim()) { toast.error('Supplier name required'); return }
            try {
              const r = await fetch(`${API()}/api/admin/suppliers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: supplierForm.name.trim(), category: supplierForm.category, contact: supplierForm.contact, email: supplierForm.email, address: supplierForm.address }) })
              if (!r.ok) throw Error()
              const saved = await r.json()
              setSuppliers(prev => [...prev, saved])
              toast.success(`Supplier "${supplierForm.name}" added`)
            } catch { toast.error('Failed to save supplier') }
            setShowSupplierModal(false)
            setSupplierForm({ name: '', category: 'Proteins', contact: '', email: '', address: '' })
          }}>
            Add Supplier
          </Button>
        </div>
      </Modal>

      {/* Supplier Orders Modal */}
      <Modal isOpen={showSupplierOrdersModal} onClose={() => setShowSupplierOrdersModal(false)} title={`Orders from ${selectedSupplierOrders?.supplier || ''}`} size="lg">
        {selectedSupplierOrders && (
          <div>
            {selectedSupplierOrders.orders.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <Package size={40} color="#9ca3af" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#6b7280' }}>No orders from this supplier yet</p>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>PO Number</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Items</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSupplierOrders.orders.map(order => (
                      <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{order.id}</td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>{order.date}</td>
                        <td style={{ padding: '12px' }}>{order.items}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{order.total.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${statusColors[order.status]}15`, color: statusColors[order.status], textTransform: 'capitalize' }}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Purchase Order Modal */}
      <Modal isOpen={showPOModal} onClose={() => { setShowPOModal(false); setPoForm({ supplier: '', expectedDate: '', items: [] }) }} title="Create Purchase Order" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier</label>
              <select value={poForm.supplier} onChange={e => setPoForm(p => ({ ...p, supplier: e.target.value }))} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Expected Delivery</label>
              <input type="date" value={poForm.expectedDate} onChange={e => setPoForm(p => ({ ...p, expectedDate: e.target.value }))} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Items ({poForm.items.length})</label>
              <Button size="sm" variant="secondary" onClick={() => { setPoItemForm({ name: '', quantity: '', unit: 'kg', rate: '' }); setShowPOItemModal(true) }}>
                <Plus size={16} />
                Add Item
              </Button>
            </div>
            {poForm.items.length === 0 ? (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                <Package size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#6b7280' }}>No items added yet</p>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Item</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Unit</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {poForm.items.map((item, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '12px' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>{item.unit}</td>
                        <td style={{ padding: '12px' }}>₹{item.rate}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{(item.quantity * item.rate).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => setPoForm(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={16} color="#ef4444" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f9fafb' }}>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Total:</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#e63946' }}>
                        ₹{poForm.items.reduce((s, i) => s + i.quantity * i.rate, 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <Button fullWidth disabled={!poForm.supplier || poForm.items.length === 0} onClick={async () => {
            try {
              const body = { supplier: poForm.supplier, items: poForm.items, total: poForm.items.reduce((s, i) => s + i.quantity * i.rate, 0), expectedDate: poForm.expectedDate }
              const r = await fetch(`${API()}/api/admin/purchase-orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
              if (!r.ok) throw Error()
              const { po, items: newItems } = await r.json()
              setPurchaseOrders(prev => [...prev, po])
              setPoItems(prev => [...prev, ...newItems])
              toast.success(`Purchase order ${po.id} created with ${poForm.items.length} items`)
            } catch { toast.error('Failed to create purchase order') }
            setShowPOModal(false)
            setPoForm({ supplier: '', expectedDate: '', items: [] })
          }}>
            <Plus size={18} />
            Create Order
          </Button>
        </div>
      </Modal>

      {/* Add PO Item Modal */}
      <Modal isOpen={showPOItemModal} onClose={() => setShowPOItemModal(false)} title="Add Item to Purchase Order" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Item Name</label>
              <input value={poItemForm.name} onChange={e => setPoItemForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter item name" list="inv-items" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
              <datalist id="inv-items">
                {globalInventory.map(inv => <option key={inv.id} value={inv.name} />)}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Quantity</label>
              <input type="number" value={poItemForm.quantity} onChange={e => setPoItemForm(p => ({ ...p, quantity: Number(e.target.value) }))} placeholder="0" min="1" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Unit</label>
              <select value={poItemForm.unit} onChange={e => setPoItemForm(p => ({ ...p, unit: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}>
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="liters">liters</option>
                <option value="boxes">boxes</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Rate (₹)</label>
              <input type="number" value={poItemForm.rate} onChange={e => setPoItemForm(p => ({ ...p, rate: Number(e.target.value) }))} placeholder="0" min="0" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <Button fullWidth disabled={!poItemForm.name || !poItemForm.quantity || !poItemForm.rate} onClick={() => {
            setPoForm(p => ({ ...p, items: [...p.items, { ...poItemForm, name: poItemForm.name, quantity: Number(poItemForm.quantity), rate: Number(poItemForm.rate) }] }))
            setShowPOItemModal(false)
          }}>
            <Plus size={18} />
            Add to Order
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
