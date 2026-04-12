import { useState, useEffect } from 'react'
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Box, RefreshCw, Edit, History } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'

const sampleInventory = [
  { id: '1', name: 'Chicken Breast', category: 'Proteins', unit: 'kg', currentStock: 50, minimumStock: 20, costPerUnit: 180, supplier: 'Fresh Poultry Co.', lastRestocked: '2024-01-10' },
  { id: '2', name: 'Burger Buns', category: 'Bakery', unit: 'pcs', currentStock: 200, minimumStock: 50, costPerUnit: 8, supplier: 'City Bakery', lastRestocked: '2024-01-12' },
  { id: '3', name: 'Fries (Frozen)', category: 'Sides', unit: 'kg', currentStock: 30, minimumStock: 10, costPerUnit: 45, supplier: 'Food Supplies Inc.', lastRestocked: '2024-01-08' },
  { id: '4', name: 'Cooking Oil', category: 'Supplies', unit: 'liters', currentStock: 40, minimumStock: 15, costPerUnit: 120, supplier: 'Oil Mart', lastRestocked: '2024-01-05' },
  { id: '5', name: 'Pepsi Syrup', category: 'Beverages', unit: 'liters', currentStock: 5, minimumStock: 5, costPerUnit: 350, supplier: 'BevCo', lastRestocked: '2024-01-01' },
  { id: '6', name: 'Packaging Boxes', category: 'Supplies', unit: 'pcs', currentStock: 80, minimumStock: 100, costPerUnit: 5, supplier: 'PackPro', lastRestocked: '2024-01-14' },
  { id: '7', name: 'Napkins', category: 'Supplies', unit: 'pcs', currentStock: 1000, minimumStock: 200, costPerUnit: 0.5, supplier: 'CleanSupply', lastRestocked: '2024-01-11' },
  { id: '8', name: 'Tomato Ketchup', category: 'Sauces', unit: 'kg', currentStock: 15, minimumStock: 5, costPerUnit: 80, supplier: 'Food Supplies Inc.', lastRestocked: '2024-01-09' },
]

export default function Inventory() {
  const toast = useToast()
  const [inventory, setInventory] = useState(sampleInventory)
  const [activeTab, setActiveTab] = useState('stock')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock)
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)

  const getStockStatus = (current, minimum) => {
    if (current <= minimum * 0.5) return { color: '#ef4444', label: 'Critical', bg: '#fef2f2' }
    if (current <= minimum) return { color: '#f59e0b', label: 'Low', bg: '#fffbeb' }
    return { color: '#10b981', label: 'Good', bg: '#f0fdf4' }
  }

  const getStockPercentage = (current, minimum) => {
    return Math.min((current / (minimum * 2)) * 100, 100)
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestock = (item) => {
    setSelectedItem(item)
    setShowRestockModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Inventory Management
        </h2>
        <p style={{ color: '#6b7280' }}>Track stock levels and manage inventory</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{inventory.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Items</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{lowStockItems.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Low Stock</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{totalValue.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Stock Value</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={24} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{inventory.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Categories</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'stock', label: 'Stock Levels' },
          { id: 'alerts', label: 'Low Stock Alerts', count: lowStockItems.length },
          { id: 'history', label: 'Transaction History' },
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
            {tab.count !== undefined && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#fef2f2',
                color: activeTab === tab.id ? 'white' : '#ef4444',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search inventory..."
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
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      {/* Stock Levels */}
      {(activeTab === 'stock') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {filteredInventory.map(item => {
            const status = getStockStatus(item.currentStock, item.minimumStock)
            const percentage = getStockPercentage(item.currentStock, item.minimumStock)
            
            return (
              <Card key={item.id} hover>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{item.name}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>
                      {item.category}
                    </span>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: status.bg,
                    color: status.color
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Stock Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Stock Level</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.currentStock} {item.unit}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: status.color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Min: {item.minimumStock}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Max: {item.minimumStock * 2}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Cost/Unit</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>₹{item.costPerUnit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total Value</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>₹{(item.currentStock * item.costPerUnit).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => handleRestock(item)}>
                    <RefreshCw size={14} />
                    Restock
                  </Button>
                  <Button variant="ghost" size="sm">
                    <History size={14} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit size={14} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Low Stock Alerts */}
      {activeTab === 'alerts' && (
        <Card padding="none">
          {lowStockItems.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Package size={48} color="#10b981" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>All Stock Levels Good!</h3>
              <p style={{ color: '#6b7280' }}>No items are running low on stock</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Current</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Minimum</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Shortage</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.category}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{item.currentStock} {item.unit}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{item.minimumStock} {item.unit}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{Math.max(0, item.minimumStock - item.currentStock)} {item.unit}</span>
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{item.supplier}</td>
                      <td style={{ padding: '16px' }}>
                        <Button size="sm" onClick={() => handleRestock(item)}>
                          <RefreshCw size={14} />
                          Restock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Transaction History */}
      {activeTab === 'history' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>By</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Jan 14, 2024</td>
                  <td style={{ padding: '16px' }}>Packaging Boxes</td>
                  <td style={{ padding: '16px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>Stock In</span></td>
                  <td style={{ padding: '16px', color: '#10b981', fontWeight: 600 }}>+500 pcs</td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Purchase Order</td>
                  <td style={{ padding: '16px' }}>Admin</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Jan 12, 2024</td>
                  <td style={{ padding: '16px' }}>Burger Buns</td>
                  <td style={{ padding: '16px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>Stock In</span></td>
                  <td style={{ padding: '16px', color: '#10b981', fontWeight: 600 }}>+100 pcs</td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Daily Delivery</td>
                  <td style={{ padding: '16px' }}>Admin</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Jan 11, 2024</td>
                  <td style={{ padding: '16px' }}>Napkins</td>
                  <td style={{ padding: '16px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>Stock In</span></td>
                  <td style={{ padding: '16px', color: '#10b981', fontWeight: 600 }}>+1000 pcs</td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>Bulk Order</td>
                  <td style={{ padding: '16px' }}>Admin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Item Name</label>
            <input type="text" placeholder="Enter item name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Category</label>
              <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <option>Proteins</option>
                <option>Bakery</option>
                <option>Sides</option>
                <option>Beverages</option>
                <option>Supplies</option>
                <option>Sauces</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Unit</label>
              <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <option>pcs</option>
                <option>kg</option>
                <option>liters</option>
                <option>boxes</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Current Stock</label>
              <input type="number" placeholder="0" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Min Stock</label>
              <input type="number" placeholder="0" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Cost/Unit</label>
              <input type="number" placeholder="0" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Supplier</label>
            <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <option>Select Supplier</option>
            </select>
          </div>
          <Button fullWidth onClick={() => { toast.success('Item added successfully'); setShowAddModal(false) }}>
            Add Item
          </Button>
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal isOpen={showRestockModal} onClose={() => setShowRestockModal(false)} title={`Restock ${selectedItem?.name || ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Current Stock</span>
              <span style={{ fontWeight: 600 }}>{selectedItem?.currentStock} {selectedItem?.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Minimum</span>
              <span style={{ fontWeight: 600 }}>{selectedItem?.minimumStock} {selectedItem?.unit}</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Quantity to Add</label>
            <input type="number" placeholder="Enter quantity" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>Reason</label>
            <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <option>Purchase Order</option>
              <option>Return</option>
              <option>Transfer</option>
              <option>Adjustment</option>
            </select>
          </div>
          <Button fullWidth onClick={() => { toast.success('Stock updated successfully'); setShowRestockModal(false) }}>
            Update Stock
          </Button>
        </div>
      </Modal>
    </div>
  )
}
