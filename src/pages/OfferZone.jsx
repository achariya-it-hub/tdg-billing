import { useState, useEffect } from 'react'
import {
  Tag, Percent, Plus, Search, Filter, Trash2, Edit, Check, X,
  Sparkles, Gift, AlertCircle, TrendingUp, ShoppingBag, ArrowRight,
  Calendar, Copy, RefreshCw, Layers, CheckCircle2, ChevronRight,
  SlidersHorizontal, UtensilsCrossed, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import API_BASE from '../lib/apiConfig'
import { useMenuStore } from '../stores/menuStore'

// Quick Templates for 1-Click Offer Creation
const QUICK_TEMPLATES = [
  {
    title: 'Buy 2 Get 1 Free Gyro',
    code: 'B2G1',
    type: 'bogo',
    buyQty: 2,
    getQty: 1,
    applicableCategory: 'Gyros',
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    tag: 'B2G1 FREE',
    desc: 'Buy any 2 Gyros and get 1 Gyro completely free! (Cheapest gyro is free)'
  },
  {
    title: 'Weekend 20% Feast',
    code: 'WEEKEND20',
    type: 'percentage',
    value: 20,
    minOrderValue: 299,
    maxDiscount: 200,
    applicableCategory: 'all',
    tag: '20% OFF',
    desc: 'Flat 20% discount on all bills above ₹299 (Max savings ₹200)'
  },
  {
    title: 'Flat ₹50 Super Saver',
    code: 'SAVE50',
    type: 'flat',
    value: 50,
    minOrderValue: 350,
    maxDiscount: 50,
    applicableCategory: 'all',
    tag: 'SAVE ₹50',
    desc: 'Instant ₹50 flat discount on orders of ₹350 or more'
  },
  {
    title: 'Free Garlic Dip with Order',
    code: 'FREEDIP',
    type: 'free_item',
    value: 15,
    minOrderValue: 250,
    maxDiscount: 15,
    freeItemName: 'Garlic Mayo',
    applicableCategory: 'all',
    tag: 'FREE DIP',
    desc: 'Complimentary Garlic Mayo Dip with any order above ₹250'
  },
  {
    title: 'Student Privilege 15%',
    code: 'STUDENT15',
    type: 'percentage',
    value: 15,
    minOrderValue: 199,
    maxDiscount: 150,
    applicableCategory: 'all',
    tag: 'STUDENT 15%',
    desc: 'Special 15% discount for students on presenting college/school ID'
  }
]

export default function OfferZone() {
  const toast = useToast()
  const { categories, fetchMenu } = useMenuStore()

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'percentage' | 'flat' | 'bogo' | 'free_item'
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'inactive'

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  // Delete Confirm State
  const [offerToDelete, setOfferToDelete] = useState(null)

  // Form State
  const [form, setForm] = useState({
    title: '',
    code: '',
    type: 'percentage', // 'percentage' | 'flat' | 'bogo' | 'free_item'
    value: 20,
    minOrderValue: 0,
    maxDiscount: 0,
    buyQty: 2,
    getQty: 1,
    applicableCategory: 'all',
    freeItemName: '',
    tag: '20% OFF',
    desc: '',
    startDate: '',
    endDate: '',
    isActive: true,
    targetChannels: ['pos', 'mobile', 'self_order']
  })

  // Load Offers from Backend
  const loadOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pos-offers`)
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers || [])
      } else {
        toast.error('Failed to load offers from server')
      }
    } catch (e) {
      console.error('Failed to fetch pos offers:', e)
      toast.error('Network error loading offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
    if (!categories || categories.length === 0) {
      fetchMenu().catch(() => {})
    }
  }, [])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingOffer(null)
    setForm({
      title: '',
      code: '',
      type: 'percentage',
      value: 20,
      minOrderValue: 0,
      maxDiscount: 0,
      buyQty: 2,
      getQty: 1,
      applicableCategory: 'all',
      freeItemName: '',
      tag: '20% OFF',
      desc: '',
      startDate: '',
      endDate: '',
      isActive: true,
      targetChannels: ['pos', 'mobile', 'self_order']
    })
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (offer) => {
    setEditingOffer(offer)
    setForm({
      title: offer.title || '',
      code: offer.code || '',
      type: offer.type || 'percentage',
      value: offer.value || 0,
      minOrderValue: offer.minOrderValue || 0,
      maxDiscount: offer.maxDiscount || 0,
      buyQty: offer.buyQty || 2,
      getQty: offer.getQty || 1,
      applicableCategory: offer.applicableCategory || 'all',
      freeItemName: offer.freeItemName || '',
      tag: offer.tag || '',
      desc: offer.desc || '',
      startDate: offer.startDate || '',
      endDate: offer.endDate || '',
      isActive: offer.isActive !== false,
      targetChannels: offer.targetChannels || ['pos', 'mobile', 'self_order']
    })
    setShowModal(true)
  }

  // Apply Quick Template
  const applyTemplate = (template) => {
    setForm(prev => ({
      ...prev,
      ...template
    }))
    toast.success(`Loaded template: "${template.title}"`)
  }

  // Toggle Channel
  const toggleChannel = (ch) => {
    setForm(prev => {
      const current = prev.targetChannels || []
      const next = current.includes(ch) ? current.filter(x => x !== ch) : [...current, ch]
      return { ...prev, targetChannels: next }
    })
  }

  // Save (Create or Update)
  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!form.title || !form.title.trim()) {
      toast.error('Offer Title is required')
      return
    }

    const cleanCode = (form.code || form.title.substring(0, 8))
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '')

    if (!cleanCode) {
      toast.error('Valid Promo Code is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        code: cleanCode,
        value: Number(form.value) || 0,
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        buyQty: Number(form.buyQty) || 2,
        getQty: Number(form.getQty) || 1
      }

      const url = editingOffer
        ? `${API_BASE}/api/pos-offers/${editingOffer.id}`
        : `${API_BASE}/api/pos-offers`
      const method = editingOffer ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(editingOffer ? 'Offer updated successfully!' : 'Offer created in Offer Zone!')
        setShowModal(false)
        loadOffers()
      } else {
        toast.error(data.error || 'Failed to save offer')
      }
    } catch (err) {
      console.error('Save offer error:', err)
      toast.error('Network error saving offer')
    } finally {
      setSaving(false)
    }
  }

  // Toggle Active State
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/pos-offers/${id}/toggle`, {
        method: 'PATCH'
      })
      if (res.ok) {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !currentStatus } : o))
        toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`)
      } else {
        toast.error('Failed to toggle status')
      }
    } catch (e) {
      toast.error('Network error updating status')
    }
  }

  // Delete Offer
  const handleDeleteOffer = async () => {
    if (!offerToDelete) return
    try {
      const res = await fetch(`${API_BASE}/api/pos-offers/${offerToDelete.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== offerToDelete.id))
        toast.success('Offer deleted successfully')
        setOfferToDelete(null)
      } else {
        toast.error('Failed to delete offer')
      }
    } catch (e) {
      toast.error('Network error deleting offer')
    }
  }

  // Copy Promo Code
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    toast.success(`Code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Calculate Metrics
  const activeCount = offers.filter(o => o.isActive !== false).length
  const totalCount = offers.length
  const totalUsage = offers.reduce((sum, o) => sum + (Number(o.usageCount) || 0), 0)
  const totalSavings = offers.reduce((sum, o) => sum + (Number(o.totalSavings) || 0), 0)

  // Filtered list
  const filteredOffers = offers.filter(o => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      (o.title || '').toLowerCase().includes(q) ||
      (o.code || '').toLowerCase().includes(q) ||
      (o.tag || '').toLowerCase().includes(q) ||
      (o.desc || '').toLowerCase().includes(q)

    const matchesType = filterType === 'all' || o.type === filterType
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && o.isActive !== false) ||
      (filterStatus === 'inactive' && o.isActive === false)

    return matchesSearch && matchesType && matchesStatus
  })

  // Menu Category Names
  const categoryNames = ['all', ...(categories ? categories.map(c => c.name || c) : [
    'Gyros', 'Leg & Thigh', 'Wings', 'Strips', 'Fries', 'Beverages',
    'Rice & Salads', 'Meals & Combos', 'Protein Max', 'Shakes', 'Desserts'
  ])]

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1380px',
      margin: '0 auto',
      minHeight: '100vh',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e63946, #b91c1c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 6px 16px rgba(230, 57, 70, 0.3)'
            }}>
              <Tag size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Offer Zone 🏷️
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                Create, customize, and manage cafe promo offers, B2G1 gyro deals, and instant discounts
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={loadOffers}
            title="Refresh Offers"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <Link
            to="/pos"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <ShoppingBag size={15} color="#e63946" /> Go to POS Billing
          </Link>

          <button
            onClick={handleOpenCreate}
            style={{
              padding: '11px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #e63946, #c1121f)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(230, 57, 70, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Create New Offer
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Offers
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
              {activeCount} <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>/ {totalCount} total</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.12)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Redemptions
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
              {totalUsage} <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>bills</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(230, 57, 70, 0.12)',
            color: '#e63946',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Customer Savings
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
              ₹{totalSavings.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Templates
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>5 Ready Presets</span>
              <button
                onClick={handleOpenCreate}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e63946',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                Use Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          flex: '1 1 260px',
          minWidth: '220px'
        }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            placeholder="Search offers by name, promo code, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '9px',
              border: '1.5px solid #e2e8f0',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Type:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'bogo', label: '🎁 BOGO/B2G1' },
            { id: 'percentage', label: '🏷️ Percentage' },
            { id: 'flat', label: '💵 Flat (₹)' },
            { id: 'free_item', label: '🍟 Free Item' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: filterType === t.id ? '1.5px solid #e63946' : '1px solid #e2e8f0',
                background: filterType === t.id ? '#fef2f2' : '#ffffff',
                color: filterType === t.id ? '#b91c1c' : '#475569',
                fontSize: '12px',
                fontWeight: filterType === t.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              fontSize: '12.5px',
              fontWeight: 700,
              background: '#ffffff',
              color: '#334155'
            }}
          >
            <option value="all">All Offers</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#e63946',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600 }}>Loading Offer Zone...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px dashed #cbd5e1',
          padding: '50px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#fef2f2',
            color: '#e63946',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Tag size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
            No Offers Found
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'No offers match your current search or filter criteria.'
              : 'You have not created any custom cafe offers yet. Click below to launch your first promotional offer!'}
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #e63946, #c1121f)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(230, 57, 70, 0.3)'
            }}
          >
            <Plus size={16} /> Create New Offer
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {filteredOffers.map(offer => {
            const isActive = offer.isActive !== false
            return (
              <div
                key={offer.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isActive ? '1.5px solid #e2e8f0' : '1px solid #f1f5f9',
                  boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.05)' : 'none',
                  opacity: isActive ? 1 : 0.65,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s'
                }}
              >
                {/* Card Top Banner */}
                <div style={{
                  padding: '14px 16px',
                  background: isActive
                    ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                    : '#64748b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'rgba(230, 57, 70, 0.9)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.4px'
                    }}>
                      {offer.tag || (offer.type === 'bogo' ? 'BOGO FREE' : `${offer.value}% OFF`)}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase'
                    }}>
                      {offer.type === 'bogo' ? 'Buy X Get Y' : offer.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(offer.id, isActive)}
                    style={{
                      border: 'none',
                      background: isActive ? '#10b981' : '#475569',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'inline-block'
                    }} />
                    {isActive ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {offer.type === 'bogo' && '🎁'}
                      {offer.type === 'percentage' && '🏷️'}
                      {offer.type === 'flat' && '💵'}
                      {offer.type === 'free_item' && '🍟'}
                      {offer.title}
                    </h3>
                    <p style={{
                      fontSize: '12.5px',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {offer.desc || 'Promotional cafe offer applied at checkout.'}
                    </p>
                  </div>

                  {/* Promo Code Box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>
                        PROMO CODE:
                      </span>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '14px',
                        color: '#b91c1c',
                        letterSpacing: '1px'
                      }}>
                        {offer.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      title="Copy code"
                      style={{
                        background: copiedCode === offer.code ? '#10b981' : '#ffffff',
                        color: copiedCode === offer.code ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedCode === offer.code ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === offer.code ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Conditions Chips */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '14px',
                    fontSize: '11.5px'
                  }}>
                    {Number(offer.minOrderValue) > 0 ? (
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Min Order: ₹{offer.minOrderValue}
                      </span>
                    ) : (
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        No Min Order
                      </span>
                    )}

                    {offer.type === 'percentage' && Number(offer.maxDiscount) > 0 && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Max Cap: ₹{offer.maxDiscount}
                      </span>
                    )}

                    {offer.type === 'bogo' && (
                      <span style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}>
                        Buy {offer.buyQty || 2} Get {offer.getQty || 1} Free
                      </span>
                    )}

                    {offer.applicableCategory && offer.applicableCategory !== 'all' && (
                      <span style={{
                        background: '#fdf4ff',
                        color: '#86198f',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        On: {offer.applicableCategory}
                      </span>
                    )}

                    {offer.freeItemName && (
                      <span style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Gift: {offer.freeItemName}
                      </span>
                    )}
                  </div>

                  {/* Redemptions & Savings Stat */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    color: '#475569',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontWeight: 600 }}>
                      🎯 Applied <strong>{offer.usageCount || 0}</strong> times
                    </span>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>
                      ₹{(offer.totalSavings || 0).toLocaleString()} saved
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px'
                  }}>
                    <button
                      onClick={() => handleOpenEdit(offer)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit size={14} /> Edit Offer
                    </button>

                    <button
                      onClick={() => setOfferToDelete(offer)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fff5f5',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa',
              borderRadius: '18px 18px 0 0'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingOffer ? 'Edit Cafe Offer 🏷️' : 'Create New Cafe Offer 🏷️'}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Configure offer details, discount rules, and minimum cart amounts
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Templates Bar (Only when creating) */}
            {!editingOffer && (
              <div style={{
                padding: '12px 22px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ⚡ Quick Presets (1-Click Fill):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {tpl.tag}: {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleSave} style={{ padding: '22px' }}>
              {/* Offer Title & Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Offer Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buy 2 Get 1 Free Gyro"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B2G1"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Offer Type Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Offer Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'bogo', label: 'Buy X Get Y', icon: '🎁', desc: 'B2G1 / Free Item' },
                    { id: 'percentage', label: 'Percentage %', icon: '🏷️', desc: '10%, 20%, 50% off' },
                    { id: 'flat', label: 'Flat Cash ₹', icon: '💵', desc: '₹50, ₹100 off' },
                    { id: 'free_item', label: 'Free Item', icon: '🍟', desc: 'Free Dip / Drink' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        let newTag = form.tag
                        if (t.id === 'bogo') newTag = 'B2G1 FREE'
                        else if (t.id === 'percentage') newTag = `${form.value || 20}% OFF`
                        else if (t.id === 'flat') newTag = `SAVE ₹${form.value || 50}`
                        else if (t.id === 'free_item') newTag = 'FREE ITEM'
                        setForm({ ...form, type: t.id, tag: newTag })
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: form.type === t.id ? '2px solid #e63946' : '1px solid #cbd5e1',
                        background: form.type === t.id ? '#fef2f2' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '2px' }}>{t.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: form.type === t.id ? '#b91c1c' : '#1e293b' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Type-specific fields */}
              {form.type === 'percentage' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.value}
                      onChange={e => setForm({ ...form, value: Number(e.target.value), tag: `${e.target.value}% OFF` })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Maximum Discount Limit (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>(0 = Unlimited)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.maxDiscount}
                      onChange={e => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {form.type === 'flat' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Flat Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.value}
                    onChange={e => setForm({ ...form, value: Number(e.target.value), tag: `SAVE ₹${e.target.value}` })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {form.type === 'bogo' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Buy Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.buyQty}
                      onChange={e => setForm({ ...form, buyQty: Number(e.target.value), tag: `B${e.target.value}G${form.getQty} FREE` })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Free Quantity (Get Free)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.getQty}
                      onChange={e => setForm({ ...form, getQty: Number(e.target.value), tag: `B${form.buyQty}G${e.target.value} FREE` })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {form.type === 'free_item' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Free Complimentary Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Garlic Mayo Dip or Soft Drink"
                    value={form.freeItemName}
                    onChange={e => setForm({ ...form, freeItemName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Minimum Order Value & Applicable Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Minimum Order Amount (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>(0 = None)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 299"
                    value={form.minOrderValue}
                    onChange={e => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Applicable Menu Category
                  </label>
                  <select
                    value={form.applicableCategory}
                    onChange={e => setForm({ ...form, applicableCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">All Menu Categories</option>
                    {categoryNames.filter(c => c !== 'all').map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag / Badge Text & Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF / B2G1"
                    value={form.tag}
                    onChange={e => setForm({ ...form, tag: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Terms / Description (for staff & customer)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valid on all standalone gyros, min 2 items"
                    value={form.desc}
                    onChange={e => setForm({ ...form, desc: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Target Channels */}
              <div style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  🎯 Active Channels (Where can this offer be applied?):
                </label>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'pos', label: '🖥️ POS Billing Counter' },
                    { id: 'mobile', label: '📱 Mobile Web / Customer App' },
                    { id: 'self_order', label: '📲 Self-Order Kiosks' }
                  ].map(ch => {
                    const active = (form.targetChannels || []).includes(ch.id)
                    return (
                      <label
                        key={ch.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: active ? '#1d4ed8' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleChannel(ch.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        {ch.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f1f5f9',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Active Status
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    When active, cashiers can apply this offer directly during billing.
                  </div>
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '12px',
                  color: form.isActive ? '#16a34a' : '#64748b'
                }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                  {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #e63946, #c1121f)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(230, 57, 70, 0.4)',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Save & Publish Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {offerToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Delete Offer?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.4' }}>
              Are you sure you want to delete <strong>"{offerToDelete.title}"</strong> ({offerToDelete.code})? Cashiers will no longer be able to apply this offer in billing.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setOfferToDelete(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOffer}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
