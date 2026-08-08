import { useState, useEffect, useRef } from 'react'
import { Plus, Minus, Trash2, ShoppingBag, X, Volume2, VolumeX, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import { useMenuStore } from '../stores/menuStore'
import { useOrderStore } from '../stores/orderStore'
import { getSocket, connectToPOS } from '../lib/socket'
import { playOrderAlertSound, getSoundEnabled, setSoundEnabled } from '../utils/audioAlert'
import PrintService from '../lib/printService'
import API_BASE from '../lib/apiConfig'

const categoryIcons = {
  'Burgers': '🍔',
  'Chicken': '🍗',
  'Sides': '🍟',
  'Beverages': '🥤',
  'Desserts': '🍰',
  'Combos': '📦'
}

const glassCard = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
}

const menuItemCard = {
  ...glassCard,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden'
}

const orderPanel = {
  ...glassCard,
  width: '380px',
  minWidth: '340px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}

const orderTypeBtn = (active) => ({
  flex: 1,
  padding: '6px 4px',
  borderRadius: '8px',
  background: active ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(0,0,0,0.03)',
  color: active ? 'white' : '#6b7280',
  fontWeight: 700,
  fontSize: '11px',
  border: 'none',
  cursor: 'pointer',
  textTransform: 'uppercase',
  transition: 'all 0.2s',
  boxShadow: active ? '0 2px 8px rgba(230,57,70,0.3)' : 'none'
})

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid var(--border)',
  fontSize: '14px',
  background: 'white',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}

const qtyBtn = (color) => ({
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: color,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s',
  boxShadow: color === '#e63946' ? '0 2px 6px rgba(230,57,70,0.3)' : 'none'
})

export default function POS() {
  const toast = useToast()
  const { categories, menuItems, fetchCategories, fetchMenuItems } = useMenuStore()
  const {
    currentOrder, addItem, updateItemQuantity, removeItem,
    setOrderType, setTableNumber, setCustomerName, setCustomerPhone, setCustomer, setCustomerDiscountPct, clearCustomer, setComplimentary, setSpecialRemarks, clearOrder,
    setInaugurationOffer, setSpecialOffer20, setStaffBenefitOffer, setVip50, getDiscount,
    holdOrder, recallOrder, heldOrders, getSubtotal, getTax, getTotal, placeOrder,
    loadCampaigns, campaigns
  } = useOrderStore()

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [processing, setProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCart, setShowCart] = useState(false)
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled())

  // Staff Benefit Promotion State
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const [verifyingStaff, setVerifyingStaff] = useState(false)
  const [staffVerifyResult, setStaffVerifyResult] = useState(null)
  const [staffVerifyError, setStaffVerifyError] = useState(null)

  const handleVerifyStaff = async () => {
    if (!staffSearchQuery || !staffSearchQuery.trim()) {
      setStaffVerifyError('Please enter Employee ID, Name, Mobile, or QR Code')
      return
    }
    setVerifyingStaff(true)
    setStaffVerifyError(null)
    setStaffVerifyResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/staff/verify?query=${encodeURIComponent(staffSearchQuery.trim())}&orderType=${currentOrder.type}`)
      const data = await res.json()

      if (data.eligible) {
        setStaffVerifyResult(data)
      } else {
        setStaffVerifyError(data.message || 'Not eligible for promotion')
      }
    } catch (e) {
      setStaffVerifyError('Network error while verifying staff eligibility')
    }
    setVerifyingStaff(false)
  }

  const handleApplyStaffBenefit = () => {
    if (staffVerifyResult && staffVerifyResult.eligible) {
      setStaffBenefitOffer(staffVerifyResult)
      toast.success(`Applied 50% Benefit for ${staffVerifyResult.familyMember ? staffVerifyResult.familyMember.name : staffVerifyResult.employee.name}!`)
      setShowStaffModal(false)
      setStaffSearchQuery('')
      setStaffVerifyResult(null)
    }
  }

  const handleRemoveStaffBenefit = () => {
    setStaffBenefitOffer(null)
    toast.success('Removed Staff Benefit discount')
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (!itemSearchTerm || !itemSearchTerm.trim()) return true
    const term = itemSearchTerm.toLowerCase().trim()
    const name = (item.name || '').toLowerCase()
    const price = String(item.price || '')
    const cat = categories.find(c => c.id === item.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    return name.includes(term) || catName.includes(term) || price.includes(term)
  })

  // Gyro & Combo Customizer State
  const [customizingItem, setCustomizingItem] = useState(null)
  const [selectedBread, setSelectedBread] = useState('Baked')
  const [selectedProtein, setSelectedProtein] = useState('Chicken')
  const [selectedDrink, setSelectedDrink] = useState('Coca-Cola')
  const [selectedSpread, setSelectedSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion'])
  const [gyroNotes, setGyroNotes] = useState('')
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [vipChecking, setVipChecking] = useState(false)
  const [vipStatus, setVipStatus] = useState('') // '', 'vip', 'notvip'

  // Customer search (by phone or name) with stored discount
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // 2-Gyro Dual Customizer State for Combos (Mega Feast Meal, Duo Gyro Feast, Den's Party Meal, Double Crunch Box, Super 5 Bucket)
  const [selectedGyro1Protein, setSelectedGyro1Protein] = useState('Chicken')
  const [selectedGyro1Bread, setSelectedGyro1Bread] = useState('Baked')
  const [selectedGyro1Flavor, setSelectedGyro1Flavor] = useState('Spicy')
  const [selectedGyro1Sauces, setSelectedGyro1Sauces] = useState(['Garlic Mayo'])
  const [selectedGyro1Veggies, setSelectedGyro1Veggies] = useState(['Lettuce', 'Onion'])

  const [selectedGyro2Protein, setSelectedGyro2Protein] = useState('Paneer')
  const [selectedGyro2Bread, setSelectedGyro2Bread] = useState('Baked')
  const [selectedGyro2Flavor, setSelectedGyro2Flavor] = useState('Spicy')
  const [selectedGyro2Sauces, setSelectedGyro2Sauces] = useState(['Spicy Mayo'])
  const [selectedGyro2Veggies, setSelectedGyro2Veggies] = useState(['Lettuce', 'Onion'])

  const [selectedDrink1, setSelectedDrink1] = useState('Coca-Cola')
  const [selectedDrink2, setSelectedDrink2] = useState('Sprite')
  const [selectedDrink3, setSelectedDrink3] = useState('Fanta')
  const [selectedDrink4, setSelectedDrink4] = useState('Peach Ice Tea')
  const [selectedDrink5, setSelectedDrink5] = useState('Lime Ice Tea')

  const [selectedDip1, setSelectedDip1] = useState('Garlic Mayo Dip')
  const [selectedDip2, setSelectedDip2] = useState('Spicy Mayo Dip')
  const [selectedDip3, setSelectedDip3] = useState('Tzatziki Dip')

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data?.company?.deliveryEnabled !== undefined) {
          setDeliveryEnabled(data.company.deliveryEnabled !== false)
        }
      })
      .catch(() => {})
    loadCampaigns()
  }, [])

  const handlePhoneChange = async (e) => {
    const phone = e.target.value
    await setCustomerPhone(phone)
    const clean = String(phone || '').replace(/\D/g, '')
    if (clean.length >= 10) {
      setVipChecking(true)
      setVipStatus('')
      try {
        const res = await fetch(`${API_BASE}/api/customers/check-discount?phone=${clean}`)
        if (res.ok) {
          const data = await res.json()
          if (data.hasDiscount && Number(data.discountPct || 0) > 0) {
            setVipStatus(Number(data.discountPct) === 50 ? 'vip' : 'discount')
          } else {
            setVipStatus('notvip')
          }
        } else {
          setVipStatus('notvip')
        }
      } catch (err) {
        setVipStatus('notvip')
      } finally {
        setVipChecking(false)
      }
    } else {
      setVipStatus('')
    }
  }

  // Search customers by phone or name (debounced)
  useEffect(() => {
    const q = customerSearch.trim()
    if (q.length < 2) {
      setCustomerResults([])
      setShowCustomerDropdown(false)
      return
    }
    const t = setTimeout(async () => {
      setSearchingCustomer(true)
      try {
        const res = await fetch(`${API_BASE}/api/customers/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          setCustomerResults(data.customers || [])
          setShowCustomerDropdown(true)
        }
      } catch (err) {
        console.warn('Customer search failed', err)
      } finally {
        setSearchingCustomer(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [customerSearch])

  const selectCustomer = (cust) => {
    setCustomer({ ...cust, customerName: cust.customerName, phone: cust.phone, discountPct: cust.discountPct })
    setCustomerSearch('')
    setCustomerResults([])
    setShowCustomerDropdown(false)
    if (cust.discountPct === 50) setVipStatus('vip')
    else if (cust.discountPct > 0) setVipStatus('discount')
    else setVipStatus('notvip')
  }

  const handleSelectOrderType = (type) => {
    if (type === 'delivery' && !deliveryEnabled) {
      toast.error('Delivery service is currently turned OFF by store settings')
      return
    }
    setOrderType(type)
  }

  const isCustomizable = (item) => {
    if (!item) return false
    const cat = categories.find(c => c.id === item.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    const itemName = (item?.name || '').toLowerCase()
    return (
      catName.includes('gyro') || itemName.includes('gyro') ||
      catName.includes('meal') || catName.includes('combo') ||
      itemName.includes('meal') || itemName.includes('box') ||
      itemName.includes('feast') || itemName.includes('bucket') ||
      itemName.includes('rice') || itemName.includes('salad')
    )
  }

  const getMealDrinkCount = (itemName) => {
    const name = (itemName || '').toLowerCase()
    if (name.includes('den\'s party') || name.includes('party meal')) return 3
    if (name.includes('super 5')) return 5
    if (name.includes('double crunch') || name.includes('duo gyro') || name.includes('mega feast')) return 2
    if (name.includes('meal') || name.includes('box') || name.includes('feast') || name.includes('bucket') || name.includes('combo')) return 1
    return 0
  }

  const getMealDipCount = (itemName) => {
    const name = (itemName || '').toLowerCase()
    if (name.includes('mega feast')) return 3
    return 0
  }

  const isDualGyroCombo = (item) => {
    if (!item) return false
    const name = (item.name || '').toLowerCase()
    return (
      name.includes('duo') ||
      name.includes('double crunch') ||
      name.includes('party meal') ||
      name.includes('mega feast') ||
      name.includes('super 5') ||
      name.includes('bucket')
    )
  }

  const handleItemClick = (item) => {
    if (!item || !item.isAvailable) return
    if (isCustomizable(item)) {
      setCustomizingItem(item)
      setSelectedBread('Baked')
      setSelectedProtein('Chicken')
      setSelectedDrink('Coca-Cola')
      setSelectedDrink1('Coca-Cola')
      setSelectedDrink2('Sprite')
      setSelectedDrink3('Fanta')
      setSelectedDrink4('Peach Ice Tea')
      setSelectedDrink5('Lime Ice Tea')

      setSelectedDip1('Garlic Mayo Dip')
      setSelectedDip2('Spicy Mayo Dip')
      setSelectedDip3('Tzatziki Dip')

      setSelectedSpread('Tzatziki')
      setSelectedSauces(['Garlic Mayo'])
      setSelectedVeggies(['Lettuce', 'Onion'])

      setSelectedGyro1Protein('Chicken')
      setSelectedGyro1Bread('Baked')
      setSelectedGyro1Flavor('Spicy')
      setSelectedGyro1Sauces(['Garlic Mayo'])
      setSelectedGyro1Veggies(['Lettuce', 'Onion'])

      setSelectedGyro2Protein('Paneer')
      setSelectedGyro2Bread('Baked')
      setSelectedGyro2Flavor('Spicy')
      setSelectedGyro2Sauces(['Spicy Mayo'])
      setSelectedGyro2Veggies(['Lettuce', 'Onion'])

      setGyroNotes('')
    } else {
      addItem({
        menuItemId: item.id,
        menuItemName: item.name || 'Unnamed Item',
        unitPrice: item.price || 0,
        totalPrice: item.price || 0
      })
    }
  }

  const handleAddGyroWithCustomization = () => {
    if (!customizingItem) return
    const cat = categories.find(c => c.id === customizingItem.categoryId)
    const catName = (cat?.name || '').toLowerCase()
    const itemName = (customizingItem?.name || '').toLowerCase()

    const isDualCombo = isDualGyroCombo(customizingItem)
    const hasGyro = catName.includes('gyro') || itemName.includes('gyro') || itemName.includes('feast') || itemName.includes('box') || itemName.includes('meal')
    const hasRice = itemName.includes('rice')

    const drinkCount = getMealDrinkCount(customizingItem.name)
    const dipCount = getMealDipCount(customizingItem.name)

    let drinkSummary = ''
    if (drinkCount === 1) drinkSummary = selectedDrink1
    else if (drinkCount === 2) drinkSummary = `${selectedDrink1}, ${selectedDrink2}`
    else if (drinkCount === 3) drinkSummary = `${selectedDrink1}, ${selectedDrink2}, ${selectedDrink3}`
    else if (drinkCount === 5) drinkSummary = `${selectedDrink1}, ${selectedDrink2}, ${selectedDrink3}, ${selectedDrink4}, ${selectedDrink5}`

    let dipSummary = ''
    if (dipCount === 3) dipSummary = `${selectedDip1}, ${selectedDip2}, ${selectedDip3}`

    let customization
    if (isDualCombo) {
      customization = {
        gyro1: `Gyro 1: ${selectedGyro1Protein} Gyro (${selectedGyro1Flavor}, ${selectedGyro1Bread} Pita, Sauces: ${selectedGyro1Sauces.join(', ') || 'None'})`,
        gyro2: `Gyro 2: ${selectedGyro2Protein} Gyro (${selectedGyro2Flavor}, ${selectedGyro2Bread} Pita, Sauces: ${selectedGyro2Sauces.join(', ') || 'None'})`,
        ...(drinkSummary ? { drink: drinkSummary } : {}),
        ...(dipSummary ? { dips: dipSummary } : {}),
        notes: gyroNotes
      }
    } else {
      customization = {
        ...(hasGyro ? { bread: selectedBread, spread: selectedSpread, sauces: selectedSauces, veggies: selectedVeggies } : {}),
        ...((hasGyro || hasRice) ? { protein: selectedProtein } : {}),
        ...(drinkSummary ? { drink: drinkSummary } : {}),
        ...(dipSummary ? { dips: dipSummary } : {}),
        notes: gyroNotes
      }
    }

    addItem({
      menuItemId: customizingItem.id,
      menuItemName: customizingItem.name,
      unitPrice: customizingItem.price,
      totalPrice: customizingItem.price,
      customization
    })
    setCustomizingItem(null)
    toast.success(`Added ${customizingItem.name} to order`)
  }

  const handleAddStandardGyro = () => {
    if (!customizingItem) return
    addItem({
      menuItemId: customizingItem.id,
      menuItemName: customizingItem.name,
      unitPrice: customizingItem.price,
      totalPrice: customizingItem.price
    })
    setCustomizingItem(null)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) playOrderAlertSound('new_order')
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchCategories(); fetchMenuItems() }, [])
  useEffect(() => { selectedCategory ? fetchMenuItems(selectedCategory) : fetchMenuItems() }, [selectedCategory])

  // Track printed orders to prevent duplicate printouts (local vs socket event)
  const printedOrderIdsRef = useRef(new Set())

  // Real-time Order Sound Alert Listener
  useEffect(() => {
    const socket = getSocket()
    connectToPOS()

    const handleNewOrder = (order) => {
      if (!order) return
      const orderIdKey = String(order.id || order.orderNumber || '')
      if (printedOrderIdsRef.current.has(orderIdKey) || (order.id && printedOrderIdsRef.current.has(String(order.id)))) {
        console.log('[PRINT DEDUPLICATION] Order already printed locally, skipping duplicate socket print:', orderIdKey)
        return
      }
      printedOrderIdsRef.current.add(orderIdKey)
      if (order.id) printedOrderIdsRef.current.add(String(order.id))

      playOrderAlertSound('new_order')
      const num = order?.orderNumber || order?.id || ''
      const src = order?.source ? order.source.toUpperCase() : (order?.type ? order.type.toUpperCase() : 'WAITER')
      toast.success(`🔔 New ${src} Order #${num} received! Printing KOT...`)

      try {
        PrintService.printKOTAndBill(order, true)
      } catch (pe) {
        console.error('Remote order auto-print failed:', pe)
      }
    }

    const handleOnlineOrder = (order) => {
      if (!order) return
      const orderIdKey = String(order.id || order.orderNumber || '')
      if (printedOrderIdsRef.current.has(orderIdKey) || (order.id && printedOrderIdsRef.current.has(String(order.id)))) {
        return
      }
      printedOrderIdsRef.current.add(orderIdKey)
      if (order.id) printedOrderIdsRef.current.add(String(order.id))

      playOrderAlertSound('online_order')
      const num = order?.orderNumber || order?.id || ''
      toast.success(`🔔 New Online Order #${num} Received! Printing KOT...`)
      try {
        PrintService.printKOTAndBill(order)
      } catch (pe) {
        console.error('Online order auto-print failed:', pe)
      }
    }

    const handleMenuUpdated = () => {
      fetchMenuItems(selectedCategory || undefined)
    }

    socket.on('order:created', handleNewOrder)
    socket.on('online-order:new', handleOnlineOrder)
    socket.on('menu:updated', handleMenuUpdated)

    return () => {
      socket.off('order:created', handleNewOrder)
      socket.off('online-order:new', handleOnlineOrder)
      socket.off('menu:updated', handleMenuUpdated)
    }
  }, [selectedCategory])

  const [lastPlacedOrder, setLastPlacedOrder] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Pay Mode popup state (#2 - settle bill at the moment of raising the order)
  const [showPayModal, setShowPayModal] = useState(false)
  const [splitCash, setSplitCash] = useState('')
  const [splitUpi, setSplitUpi] = useState('')
  const [splitCard, setSplitCard] = useState('')

  const handlePlaceOrder = async () => {
    if (!currentOrder.items || currentOrder.items.length === 0) { toast.error('Add items to place order'); return }
    setProcessing(true)
    try {
      const newOrder = await placeOrder()
      toast.success('Order placed & Bill generated!')
      setShowCart(false)
      if (newOrder) {
        setLastPlacedOrder(newOrder)
        setShowSuccessModal(true)
        if (newOrder.id) printedOrderIdsRef.current.add(String(newOrder.id))
        if (newOrder.orderNumber) printedOrderIdsRef.current.add(String(newOrder.orderNumber))
        PrintService.printKOTAndBill(newOrder, true)
      }
    }
    catch (err) { console.error('Order error:', err); toast.error('Failed: ' + err.message) }
    setProcessing(false)
  }

  const openPayModal = () => {
    if (!currentOrder.items || currentOrder.items.length === 0) { toast.error('Add items to place order'); return }
    setSplitCash('')
    setSplitUpi('')
    setSplitCard('')
    setShowPayModal(true)
  }

  const confirmPay = async (method) => {
    setShowPayModal(false)
    setProcessing(true)
    try {
      let splitPayments
      let finalMethod = method
      if (method === 'split') {
        const c = Number(splitCash) || 0
        const u = Number(splitUpi) || 0
        const cd = Number(splitCard) || 0
        const sum = c + u + cd
        const totalAmt = currentOrder.complimentary ? 0 : Math.round(getTotal())
        if (sum !== totalAmt) {
          toast.error(`Split amounts total ₹${sum} does not match bill total ₹${totalAmt}. Please adjust!`)
          setProcessing(false)
          setShowPayModal(true)
          return
        }
        splitPayments = { cash: c, upi: u, card: cd }
        finalMethod = 'split'
      }
      const settleMethod = currentOrder.complimentary ? 'complimentary' : finalMethod
      const newOrder = await placeOrder(settleMethod, true, splitPayments)
      toast.success(`Order #${newOrder.orderNumber || newOrder.id} settled via ${currentOrder.complimentary ? 'COMPLIMENTARY' : settleMethod.toUpperCase()}!`)
      setShowCart(false)
      if (newOrder) {
        setLastPlacedOrder(newOrder)
        setShowSuccessModal(true)
        if (newOrder.id) printedOrderIdsRef.current.add(String(newOrder.id))
        if (newOrder.orderNumber) printedOrderIdsRef.current.add(String(newOrder.orderNumber))
        PrintService.printKOTAndBill(newOrder, true)
      }
    }
    catch (err) { console.error('Settle error:', err); toast.error('Failed: ' + err.message); setShowPayModal(true) }
    setProcessing(false)
  }
  const handleDirectSettle = async (method) => {
    if (!currentOrder.items || currentOrder.items.length === 0) { toast.error('Add items to place and settle order'); return }
    setProcessing(true)
    try {
      const newOrder = await placeOrder(method, true)
      toast.success(`Order #${newOrder.orderNumber || newOrder.id} settled via ${method.toUpperCase()}!`)
      setShowCart(false)
      if (newOrder) {
        setLastPlacedOrder(newOrder)
        setShowSuccessModal(true)
        if (newOrder.id) printedOrderIdsRef.current.add(String(newOrder.id))
        if (newOrder.orderNumber) printedOrderIdsRef.current.add(String(newOrder.orderNumber))
        PrintService.printKOTAndBill(newOrder, true)
      }
    }
    catch (err) { console.error('Direct settle error:', err); toast.error('Failed: ' + err.message) }
    setProcessing(false)
  }

  const CategoryPills = ({ onSelect }) => (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
      <button onClick={() => setSelectedCategory(null)} style={{
        padding: '10px 18px', borderRadius: '12px',
        background: !selectedCategory ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.7)',
        color: !selectedCategory ? 'white' : '#4b5563', fontWeight: 600, fontSize: '13px',
        whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
        boxShadow: !selectedCategory ? '0 2px 8px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s'
      }}>All</button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
          padding: '10px 18px', borderRadius: '12px',
          background: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.7)',
          color: selectedCategory === cat.id ? 'white' : '#1a1a2e', fontWeight: 600, fontSize: '13px',
          whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: selectedCategory === cat.id ? `0 2px 8px ${cat.color}40` : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s'
        }}>
          <span>{categoryIcons[cat.name]?.[0] || '🍽️'}</span>
          {cat.name}
        </button>
      ))}
    </div>
  )

  const MenuItemCard = ({ item }) => {
    const cat = categories.find(c => c.id === item.categoryId)
    const isGyroItem = isCustomizable(item)
    return (
      <div
        onClick={() => handleItemClick(item)}
        style={{
          ...menuItemCard,
          opacity: item.isAvailable ? 1 : 0.5,
          cursor: item.isAvailable ? 'pointer' : 'not-allowed',
          position: 'relative'
        }}
        onMouseEnter={(e) => { if (item.isAvailable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {isGyroItem && item.isAvailable && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            color: 'white', fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            CUSTOMIZABLE
          </span>
        )}
        <div style={{
          height: isMobile ? '70px' : '100px',
          background: `linear-gradient(135deg, ${cat?.color || '#333'}22, ${cat?.color || '#333'}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '28px' : '40px',
          overflow: 'hidden', padding: '6px'
        }}>
          {!item.isAvailable && <span style={{ background: '#e63946', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>UNAVAILABLE</span>}
          {item.isAvailable && (
            item.image ? (
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              (categoryIcons[cat?.name] || '🍽️')
            )
          )}
        </div>
        <div style={{ padding: isMobile ? '8px 10px' : '12px' }}>
          <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, marginBottom: '2px', lineHeight: 1.2 }}>{item.name}</div>
          <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#e63946' }}>₹{item.price}</div>
        </div>
      </div>
    )
  }

  const OrderItemRow = ({ item, index }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      background: '#ffffff', borderRadius: '12px', marginBottom: '8px',
      border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{item.menuItemName}</div>
        {item.customization && (
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px', fontWeight: 600, lineHeight: 1.3 }}>
            {item.customization.gyro1 && <div>• {item.customization.gyro1}</div>}
            {item.customization.gyro2 && <div>• {item.customization.gyro2}</div>}
            {item.customization.drink && <div>• Drink: {item.customization.drink}</div>}
            {!item.customization.gyro1 && (
              <>
                {item.customization.bread && `${item.customization.bread} bread`}
                {item.customization.spread && ` • ${item.customization.spread} spread`}
                {item.customization.sauces?.length > 0 && ` • Sauces: ${item.customization.sauces.join(', ')}`}
                {item.customization.veggies?.length > 0 && ` • Veggies: ${item.customization.veggies.join(', ')}`}
              </>
            )}
            {item.customization.notes && <div>• Note: {item.customization.notes}</div>}
          </div>
        )}
        <div style={{ color: '#475569', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>₹{item.unitPrice} each</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => updateItemQuantity(index, item.quantity - 1)} style={qtyBtn('#e2e8f0')}>
          <Minus size={14} color="#1e293b" />
        </button>
        <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{item.quantity}</span>
        <button onClick={() => updateItemQuantity(index, item.quantity + 1)} style={qtyBtn('#e63946')}>
          <Plus size={14} />
        </button>
      </div>
      <div style={{ width: '65px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>₹{item.totalPrice}</div>
      <button onClick={() => removeItem(index)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'transparent', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
        <Trash2 size={14} />
      </button>
    </div>
  )

  // Mobile POS Layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
        <CategoryPills />
        {/* Mobile Item Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          margin: '6px 0 10px 0',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          padding: '8px 14px', borderRadius: '12px',
          border: '1.5px solid rgba(230,57,70,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Search size={16} color="#e63946" />
          <input
            type="text"
            value={itemSearchTerm}
            onChange={e => setItemSearchTerm(e.target.value)}
            placeholder="Search items by name..."
            style={{
              width: '100%', border: 'none', background: 'transparent',
              fontSize: '13px', fontWeight: 600, color: '#1f2937', outline: 'none'
            }}
          />
          {itemSearchTerm && (
            <button
              onClick={() => setItemSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredMenuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔍</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>No items match "{itemSearchTerm}"</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {filteredMenuItems.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
        {/* Mobile Cart Button */}
        <div onClick={() => setShowCart(true)} style={{
          marginTop: '12px', padding: '16px 20px',
          background: 'linear-gradient(135deg, #e63946, #c1121f)',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(230,57,70,0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{currentOrder.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
          </div>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>₹{getTotal().toFixed(0)}</span>
        </div>
        {/* Mobile Cart Modal */}
        <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="Your Order" size="full">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['dine-in', 'takeaway', 'delivery'].map(type => {
              const isDisabled = type === 'delivery' && !deliveryEnabled
              return (
                <button key={type} onClick={() => handleSelectOrderType(type)} style={{
                  ...orderTypeBtn(currentOrder.type === type),
                  opacity: isDisabled ? 0.45 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}>
                  {type === 'dine-in' ? 'Dine In' : type === 'delivery' && !deliveryEnabled ? 'Delivery (OFF)' : type}
                </button>
              )
            })}
          </div>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input type="text" placeholder="🔍 Search Customer by Phone or Name (auto discount)" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} style={inputStyle} />
            {showCustomerDropdown && customerResults.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 60, top: '100%', left: 0, right: 0, maxHeight: '170px', overflow: 'auto', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                {customerResults.map((c, idx) => (
                  <button key={idx} onClick={() => selectCustomer(c)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{c.customerName}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: c.discountPct >= 50 ? '#7c3aed' : '#dc2626', background: c.discountPct >= 50 ? '#f5f3ff' : '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>{c.discountPct}% OFF</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {searchingCustomer && <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Searching customers...</div>}
          {currentOrder.customerName && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#1e293b', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
              <span>👤 {currentOrder.customerName}{currentOrder.customerDiscountPct > 0 && <span style={{ color: currentOrder.customerDiscountPct >= 50 ? '#7c3aed' : '#dc2626' }}> — {currentOrder.customerDiscountPct}% OFF</span>}</span>
              <button onClick={clearCustomer} style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          )}
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
            {currentOrder.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No items yet</div>
            ) : currentOrder.items.map((item, index) => <OrderItemRow key={index} item={item} index={index} />)}
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>CGST (2.5%)</span><span>₹{(getTax() / 2).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>SGST (2.5%)</span><span>₹{(getTax() / 2).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 800, marginBottom: '16px', paddingTop: '8px', borderTop: '2px solid #1a1a2e' }}>
              <span>Total</span><span style={{ color: '#e63946' }}>₹{getTotal().toFixed(2)}</span>
            </div>
            <input placeholder="Special remarks for kitchen..." value={currentOrder.specialRemarks || ''} onChange={e => setSpecialRemarks(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['', 'MD', 'Chairman', 'Internal Corporate', 'VIP'].map(type => (
                <button key={type} onClick={() => setComplimentary(type)} style={{
                  padding: '8px 14px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  background: currentOrder.complimentaryType === type ? (type ? '#f59e0b' : 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.04)',
                  color: currentOrder.complimentaryType === type ? 'white' : '#6b7280', transition: 'all 0.2s'
                }}>{type || 'Chargeable'}</button>
              ))}
            </div>
            <button onClick={openPayModal} disabled={processing || currentOrder.items.length === 0} style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
              background: processing ? '#9ca3af' : currentOrder.complimentary ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #e63946, #c1121f)',
              color: 'white', cursor: processing || currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: processing ? 'none' : currentOrder.complimentary ? '0 4px 16px rgba(245,158,11,0.3)' : '0 4px 16px rgba(230,57,70,0.35)',
              marginBottom: '6px'
            }}>
              {processing ? 'Placing...' : currentOrder.complimentary ? `Place & Settle (FREE)` : `⚡ Place & Settle • ₹${getTotal().toFixed(0)}`}
            </button>
            <button onClick={handlePlaceOrder} disabled={processing || currentOrder.items.length === 0} style={{
              width: '100%', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
              background: '#f1f5f9', color: '#64748b', cursor: processing || currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}>
              Place as Pending (Kitchen Only)
            </button>

            {/* Quick Settle & Pay Buttons Mobile */}
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.5px' }}>
                ⚡ QUICK SETTLE & PAY DIRECTLY:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDirectSettle('cash')}
                  disabled={currentOrder.items.length === 0 || processing}
                  style={{
                    padding: '12px 4px', borderRadius: '10px', border: 'none',
                    background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', fontWeight: 800, fontSize: '13px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'center', boxShadow: '0 2px 6px rgba(16,185,129,0.25)'
                  }}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectSettle('upi')}
                  disabled={currentOrder.items.length === 0 || processing}
                  style={{
                    padding: '12px 4px', borderRadius: '10px', border: 'none',
                    background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white', fontWeight: 800, fontSize: '13px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'center', boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                  }}
                >
                  📱 UPI
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectSettle('card')}
                  disabled={currentOrder.items.length === 0 || processing}
                  style={{
                    padding: '12px 4px', borderRadius: '10px', border: 'none',
                    background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: 'white', fontWeight: 800, fontSize: '13px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'center', boxShadow: '0 2px 6px rgba(139,92,246,0.25)'
                  }}
                >
                  💳 Card
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // Desktop POS Layout
  return (
    <div style={{ display: 'flex', gap: '14px', height: 'calc(100vh - 56px)' }}>
      {/* Categories Sidebar */}
      <div style={{ width: '170px', display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'auto' }}>
        <button onClick={toggleSound} style={{
          padding: '10px 14px', borderRadius: '12px',
          background: soundOn ? '#ecfdf5' : '#fef2f2',
          color: soundOn ? '#047857' : '#b91c1c',
          border: `1px solid ${soundOn ? '#10b98140' : '#ef444440'}`,
          fontWeight: 600, fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '4px', transition: 'all 0.2s'
        }}>
          {soundOn ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} color="#ef4444" />}
          {soundOn ? 'Alerts ON' : 'Muted'}
        </button>

        <button onClick={() => setSelectedCategory(null)} style={{
          padding: '12px 16px', borderRadius: '12px',
          background: !selectedCategory ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.7)',
          color: !selectedCategory ? 'white' : '#4b5563', fontWeight: 600, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer',
          backdropFilter: 'blur(10px)', transition: 'all 0.2s',
          boxShadow: !selectedCategory ? '0 2px 8px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '18px' }}>✨</span> All Items
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
            padding: '12px 16px', borderRadius: '12px',
            background: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.7)',
            color: selectedCategory === cat.id ? 'white' : '#1a1a2e', fontWeight: 600, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer',
            backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            boxShadow: selectedCategory === cat.id ? `0 2px 8px ${cat.color}40` : '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '18px' }}>{categoryIcons[cat.name] || '🍽️'}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Live Item Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '12px',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          padding: '10px 16px', borderRadius: '14px',
          border: '1.5px solid rgba(230,57,70,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Search size={18} color="#e63946" />
          <input
            type="text"
            value={itemSearchTerm}
            onChange={e => setItemSearchTerm(e.target.value)}
            placeholder="Type item name to search (e.g. Gyro, Burger, Kunafa, Fries, Drink)..."
            style={{
              width: '100%', border: 'none', background: 'transparent',
              fontSize: '14px', fontWeight: 600, color: '#1f2937', outline: 'none'
            }}
          />
          {itemSearchTerm && (
            <button
              onClick={() => setItemSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingRight: '2px' }}>
          {filteredMenuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#4b5563' }}>No items match "{itemSearchTerm}"</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Try searching another dish name or clear search</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px' }}>
              {filteredMenuItems.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>

      {/* Order Panel */}
      <div style={orderPanel}>
        {/* Order Type Tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          {['dine-in', 'takeaway', 'delivery'].map(type => {
            const isDisabled = type === 'delivery' && !deliveryEnabled
            return (
              <button key={type} onClick={() => handleSelectOrderType(type)} style={{
                ...orderTypeBtn(currentOrder.type === type),
                opacity: isDisabled ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer'
              }}>
                {type === 'dine-in' ? 'Dine In' : type === 'delivery' && !deliveryEnabled ? 'Delivery (OFF)' : type}
              </button>
            )
          })}
        </div>

        {(currentOrder.type === 'dine-in' || currentOrder.type === 'takeaway' || currentOrder.type === 'delivery') && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <input type="text" placeholder="🔍 Search Customer by Phone or Name (auto discount)" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px' }} />
            {showCustomerDropdown && customerResults.length > 0 && (
              <div style={{ marginTop: '4px', maxHeight: '180px', overflow: 'auto', borderRadius: '10px', background: 'white', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', zIndex: 50, position: 'relative' }}>
                {customerResults.map((c, idx) => (
                  <button key={idx} onClick={() => selectCustomer(c)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '9px 10px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>👤 {c.customerName}</span>
                      {c.phone && <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>📱 {c.phone}</span>}
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: c.offerRedeemed ? '#b45309' : (c.discountPct > 0 ? (c.discountPct >= 50 ? '#7c3aed' : '#be123c') : '#047857'), background: c.offerRedeemed ? '#fef3c7' : (c.discountPct > 0 ? (c.discountPct >= 50 ? '#f5f3ff' : '#ffe4e6') : '#ecfdf5'), padding: '3px 8px', borderRadius: '12px' }}>
                      {c.offerRedeemed ? '⚠️ Offer Redeemed (Used)' : (c.discountPct > 0 ? `👑 ${c.discountPct}% OFF` : '✓ Customer')}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchingCustomer && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Searching customers...</div>}
            {currentOrder.customerName && (
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                👤 {currentOrder.customerName}{currentOrder.customerPhone ? ` • ${currentOrder.customerPhone}` : ''}
                {currentOrder.customerDiscountPct > 0 ? (
                  <span style={{ color: currentOrder.customerDiscountPct >= 50 ? '#7c3aed' : '#dc2626' }}> — {currentOrder.customerDiscountPct}% OFF auto-applied</span>
                ) : (
                  currentOrder.customerPhone && <span style={{ color: '#b45309', marginLeft: '6px' }}> (⚠️ Offer Redeemed / Regular Price)</span>
                )}
              </div>
            )}
            {currentOrder.customerName && (
              <button onClick={() => { clearCustomer() }} style={{ fontSize: '10px', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                ✕ Remove customer / discount
              </button>
            )}
            {vipStatus === 'notvip' && !currentOrder.customerName && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>No discount customer found for this entry</div>}
          </div>
        )}
        <div style={{
          padding: '8px 12px', background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            🛒 Bill Items ({currentOrder.items.reduce((s, i) => s + i.quantity, 0)})
          </span>
          {currentOrder.items.length > 0 && (
            <button onClick={clearOrder} style={{
              fontSize: '11px', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'
            }}>
              Clear All
            </button>
          )}
        </div>

        {/* Order Items List - EXPANDED & CLEAR VISIBILITY */}
        <div style={{ flex: 1, minHeight: '220px', overflowY: 'auto', padding: '10px', background: '#f1f5f9' }}>
          {currentOrder.items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '8px', padding: '30px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={24} color="#64748b" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Start adding items to order</span>
            </div>
          ) : (
            currentOrder.items.map((item, index) => <OrderItemRow key={index} item={item} index={index} />)
          )}
        </div>

        {/* Held Orders */}
        {heldOrders.length > 0 && (
          <div style={{ padding: '6px 10px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>HELD ORDERS ({heldOrders.length})</div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {heldOrders.map((order, i) => (
                <button key={i} onClick={() => recallOrder(i)} style={{
                  padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px',
                  border: '1px solid #cbd5e1', color: '#334155', fontSize: '11px', cursor: 'pointer', fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}>#{i + 1} ({order.items.length})</button>
              ))}
            </div>
          </div>
        )}

        {/* Compact Totals & Offers Section */}
        <div style={{ padding: '10px 12px', borderTop: '2px solid #e2e8f0', background: '#ffffff' }}>
          {/* Subtotal & Tax */}
          <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{useOrderStore.getState().getRawSubtotal().toFixed(2)}</span>
            </div>
            {currentOrder.specialOffer20 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 700 }}>
                <span>🔥 Special Offer (20% OFF):</span>
                <span>-₹{getDiscount().toFixed(2)}</span>
              </div>
            )}
            {currentOrder.inaugurationOffer && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span>🎉 Inauguration Offer (50% OFF):</span>
                <span>-₹{getDiscount().toFixed(2)}</span>
              </div>
            )}
            {currentOrder.staffBenefitOffer && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7c3aed', fontWeight: 700 }}>
                <span>🎓 Achariya Staff Benefit (50% OFF):</span>
                <span>-₹{getDiscount().toFixed(2)}</span>
              </div>
            )}
            {currentOrder.vip50 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7c3aed', fontWeight: 700 }}>
                <span>👑 VIP Offer (50% OFF):</span>
                <span>-₹{getDiscount().toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST (5%):</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
          </div>

          {/* Total Pay Box */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px', borderRadius: '10px', background: '#1e293b', color: '#ffffff',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>NET TOTAL</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#f87171' }}>₹{getTotal().toFixed(2)}</span>
          </div>

          {/* Offers Row (20% OFF & Staff Benefit 50%) */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <button
              type="button"
              onClick={() => setSpecialOffer20(!currentOrder.specialOffer20)}
              style={{
                flex: 1, padding: '7px 8px', borderRadius: '8px',
                border: currentOrder.specialOffer20 ? '2px solid #dc2626' : '1px dashed #dc2626',
                background: currentOrder.specialOffer20 ? '#dc2626' : '#fef2f2',
                color: currentOrder.specialOffer20 ? '#ffffff' : '#991b1b',
                fontWeight: 800, fontSize: '11px', cursor: 'pointer', textAlign: 'center',
                boxShadow: currentOrder.specialOffer20 ? '0 2px 8px rgba(220,38,38,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                transition: 'all 0.15s'
              }}
            >
              🔥 {currentOrder.specialOffer20 ? '20% OFF ACTIVE' : '20% OFF Offer'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentOrder.staffBenefitOffer) {
                  handleRemoveStaffBenefit()
                } else {
                  setShowStaffModal(true)
                }
              }}
              style={{
                flex: 1.4, padding: '7px 8px', borderRadius: '8px',
                border: currentOrder.staffBenefitOffer ? '2px solid #7c3aed' : '1px dashed #7c3aed',
                background: currentOrder.staffBenefitOffer ? '#7c3aed' : '#f5f3ff',
                color: currentOrder.staffBenefitOffer ? '#ffffff' : '#5b21b6',
                fontWeight: 800, fontSize: '11px', cursor: 'pointer', textAlign: 'center',
                boxShadow: currentOrder.staffBenefitOffer ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                transition: 'all 0.15s'
              }}
            >
              🎓 {currentOrder.staffBenefitOffer ? `STAFF 50% ACTIVE` : 'Staff Benefit (50%)'}
            </button>
          </div>

          {/* Remarks & Complimentary Compact */}
          <input placeholder="Special remarks for kitchen..." value={currentOrder.specialRemarks || ''} onChange={e => setSpecialRemarks(e.target.value)} style={{ ...inputStyle, fontSize: '11px', padding: '5px 8px', marginBottom: '6px' }} />
          
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', overflowX: 'auto' }}>
            {['', 'MD', 'Chairman', 'Corporate', 'VIP'].map(type => (
              <button key={type} onClick={() => setComplimentary(type)} style={{
                flex: 1, padding: '4px 4px', border: 'none', borderRadius: '6px', fontSize: '9.5px', fontWeight: 700, cursor: 'pointer',
                background: currentOrder.complimentaryType === type ? (type ? '#d97706' : '#cbd5e1') : '#f1f5f9',
                color: currentOrder.complimentaryType === type ? '#ffffff' : '#475569', whiteSpace: 'nowrap'
              }}>{type || 'Billable'}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <Button variant="secondary" size="sm" onClick={holdOrder} style={{ flex: 1, borderRadius: '8px', padding: '6px', fontSize: '12px' }}>Hold</Button>
            <Button variant="secondary" size="sm" onClick={clearOrder} style={{ flex: 1, borderRadius: '8px', padding: '6px', fontSize: '12px' }}>Clear</Button>
          </div>

          {/* Side-by-side Place & Settle and Place as Pending */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <Button onClick={openPayModal} disabled={currentOrder.items.length === 0 || processing}
              variant={currentOrder.complimentary ? 'warning' : 'primary'}
              style={{ flex: 1.2, borderRadius: '10px', padding: '8px 4px', fontSize: '12.5px', fontWeight: 800, boxShadow: '0 3px 10px rgba(230,57,70,0.25)', whiteSpace: 'nowrap' }}
            >
              {processing ? 'Placing...' : currentOrder.complimentary ? `Place & Settle (FREE)` : `⚡ Place & Settle • ₹${getTotal().toFixed(0)}`}
            </Button>

            <Button onClick={handlePlaceOrder} disabled={currentOrder.items.length === 0 || processing}
              variant="secondary"
              style={{ flex: 1, borderRadius: '10px', padding: '8px 4px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', border: '1.5px dashed #cbd5e1', whiteSpace: 'nowrap' }}
            >
              Place as Pending
            </Button>
          </div>
          {/* Quick Direct Settle Buttons */}
          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '10px', border: '1.5px dashed #cbd5e1' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#047857', marginBottom: '6px', textAlign: 'center', letterSpacing: '0.5px' }}>
              ⚡ QUICK SETTLE & PAY DIRECTLY:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleDirectSettle('cash')}
                disabled={currentOrder.items.length === 0 || processing}
                style={{
                  padding: '9px 2px', borderRadius: '8px', border: 'none',
                  background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', fontWeight: 800, fontSize: '11.5px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                  textAlign: 'center', boxShadow: '0 2px 6px rgba(16,185,129,0.25)', transition: 'all 0.15s'
                }}
              >
                💵 Cash Pay
              </button>
              <button
                type="button"
                onClick={() => handleDirectSettle('upi')}
                disabled={currentOrder.items.length === 0 || processing}
                style={{
                  padding: '9px 2px', borderRadius: '8px', border: 'none',
                  background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', fontWeight: 800, fontSize: '11.5px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                  textAlign: 'center', boxShadow: '0 2px 6px rgba(37,99,235,0.25)', transition: 'all 0.15s'
                }}
              >
                📱 UPI Pay
              </button>
              <button
                type="button"
                onClick={() => handleDirectSettle('card')}
                disabled={currentOrder.items.length === 0 || processing}
                style={{
                  padding: '9px 2px', borderRadius: '8px', border: 'none',
                  background: processing || currentOrder.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: 'white', fontWeight: 800, fontSize: '11.5px', cursor: currentOrder.items.length === 0 ? 'not-allowed' : 'pointer',
                  textAlign: 'center', boxShadow: '0 2px 6px rgba(139,92,246,0.25)', transition: 'all 0.15s'
                }}
              >
                💳 Card Pay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customizer Modal for Gyros & Combos */}
      <Modal isOpen={!!customizingItem} onClose={() => setCustomizingItem(null)} title={`🍱 Customize ${customizingItem?.name || 'Item'}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* DUAL GYRO COMBO CUSTOMIZER (Duo Gyro Feast, Double Crunch Box, Den's Party Meal) */}
          {isDualGyroCombo(customizingItem) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* GYRO 1 CUSTOMIZATION */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#e63946', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌯 GYRO 1 CUSTOMIZATION</span>
                  <span style={{ fontSize: '11px', background: '#ffe4e6', color: '#be123c', padding: '2px 8px', borderRadius: '12px' }}>First Gyro</span>
                </div>
                
                {/* Gyro 1 Protein */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>1. Choose Protein</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Chicken', 'Paneer'].map(p => (
                      <button key={p} type="button" onClick={() => setSelectedGyro1Protein(p)} style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: selectedGyro1Protein === p ? '2px solid #e63946' : '1px solid #cbd5e1',
                        background: selectedGyro1Protein === p ? '#fff5f5' : '#ffffff',
                        color: selectedGyro1Protein === p ? '#e63946' : '#334155',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                      }}>
                        {p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gyro 1 Flavor */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>2. Flavor / Style</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Spicy', 'Creamy', 'BBQ', 'Signature'].map(f => (
                      <button key={f} type="button" onClick={() => setSelectedGyro1Flavor(f)} style={{
                        padding: '8px', borderRadius: '8px',
                        border: selectedGyro1Flavor === f ? '2px solid #e63946' : '1px solid #cbd5e1',
                        background: selectedGyro1Flavor === f ? '#e63946' : '#ffffff',
                        color: selectedGyro1Flavor === f ? '#ffffff' : '#334155',
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'center'
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                {/* Gyro 1 Bread */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>3. Pita Bread</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Baked', 'Fried'].map(b => (
                      <button key={b} type="button" onClick={() => setSelectedGyro1Bread(b)} style={{
                        flex: 1, padding: '8px', borderRadius: '8px',
                        border: selectedGyro1Bread === b ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedGyro1Bread === b ? '#eff6ff' : '#ffffff',
                        color: selectedGyro1Bread === b ? '#1e40af' : '#334155',
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                      }}>{b === 'Baked' ? '🫓 Baked Pita' : '🥙 Fried Pita'}</button>
                    ))}
                  </div>
                </div>

                {/* Gyro 1 Sauces (Multiple Choices) */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>4. Sauces (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#ffe4e6', color: '#be123c', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['Garlic Mayo', 'Spicy Mayo', 'Tzatziki', 'Peri Peri', 'Turkish Chili', 'Jalapeno Cheese'].map(s => {
                      const isSel = selectedGyro1Sauces.includes(s)
                      return (
                        <button key={s} type="button" onClick={() => {
                          if (isSel) setSelectedGyro1Sauces(selectedGyro1Sauces.filter(x => x !== s))
                          else setSelectedGyro1Sauces([...selectedGyro1Sauces, s])
                        }} style={{
                          padding: '6px 8px', borderRadius: '8px',
                          border: isSel ? '2px solid #e63946' : '1px solid #cbd5e1',
                          background: isSel ? '#e63946' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155',
                          fontWeight: 600, fontSize: '11.5px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>{isSel ? '✓ ' : ''}{s}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Gyro 1 Veggies (Multiple Choices) */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>5. Fresh Veggies & Toppings (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'].map(v => {
                      const isSel = selectedGyro1Veggies.includes(v)
                      return (
                        <button key={v} type="button" onClick={() => {
                          if (isSel) setSelectedGyro1Veggies(selectedGyro1Veggies.filter(x => x !== v))
                          else setSelectedGyro1Veggies([...selectedGyro1Veggies, v])
                        }} style={{
                          padding: '6px 4px', borderRadius: '8px',
                          border: isSel ? '2px solid #10b981' : '1px solid #cbd5e1',
                          background: isSel ? '#10b981' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155',
                          fontWeight: 600, fontSize: '11px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>{isSel ? '✓ ' : ''}{v}</button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* GYRO 2 CUSTOMIZATION */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌯 GYRO 2 CUSTOMIZATION</span>
                  <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px' }}>Second Gyro</span>
                </div>
                
                {/* Gyro 2 Protein */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>1. Choose Protein</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Chicken', 'Paneer'].map(p => (
                      <button key={p} type="button" onClick={() => setSelectedGyro2Protein(p)} style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: selectedGyro2Protein === p ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedGyro2Protein === p ? '#eff6ff' : '#ffffff',
                        color: selectedGyro2Protein === p ? '#1e40af' : '#334155',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                      }}>
                        {p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gyro 2 Flavor */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>2. Flavor / Style</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Spicy', 'Creamy', 'BBQ', 'Signature'].map(f => (
                      <button key={f} type="button" onClick={() => setSelectedGyro2Flavor(f)} style={{
                        padding: '8px', borderRadius: '8px',
                        border: selectedGyro2Flavor === f ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedGyro2Flavor === f ? '#2563eb' : '#ffffff',
                        color: selectedGyro2Flavor === f ? '#ffffff' : '#334155',
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'center'
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                {/* Gyro 2 Bread */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>3. Pita Bread</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Baked', 'Fried'].map(b => (
                      <button key={b} type="button" onClick={() => setSelectedGyro2Bread(b)} style={{
                        flex: 1, padding: '8px', borderRadius: '8px',
                        border: selectedGyro2Bread === b ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedGyro2Bread === b ? '#eff6ff' : '#ffffff',
                        color: selectedGyro2Bread === b ? '#1e40af' : '#334155',
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                      }}>{b === 'Baked' ? '🫓 Baked Pita' : '🥙 Fried Pita'}</button>
                    ))}
                  </div>
                </div>

                {/* Gyro 2 Sauces (Multiple Choices) */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>4. Sauces (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['Garlic Mayo', 'Spicy Mayo', 'Tzatziki', 'Peri Peri', 'Turkish Chili', 'Jalapeno Cheese'].map(s => {
                      const isSel = selectedGyro2Sauces.includes(s)
                      return (
                        <button key={s} type="button" onClick={() => {
                          if (isSel) setSelectedGyro2Sauces(selectedGyro2Sauces.filter(x => x !== s))
                          else setSelectedGyro2Sauces([...selectedGyro2Sauces, s])
                        }} style={{
                          padding: '6px 8px', borderRadius: '8px',
                          border: isSel ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSel ? '#2563eb' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155',
                          fontWeight: 600, fontSize: '11.5px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>{isSel ? '✓ ' : ''}{s}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Gyro 2 Veggies (Multiple Choices) */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>5. Fresh Veggies & Toppings (Select Multiple)</span>
                    <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>MULTI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'].map(v => {
                      const isSel = selectedGyro2Veggies.includes(v)
                      return (
                        <button key={v} type="button" onClick={() => {
                          if (isSel) setSelectedGyro2Veggies(selectedGyro2Veggies.filter(x => x !== v))
                          else setSelectedGyro2Veggies([...selectedGyro2Veggies, v])
                        }} style={{
                          padding: '6px 4px', borderRadius: '8px',
                          border: isSel ? '2px solid #10b981' : '1px solid #cbd5e1',
                          background: isSel ? '#10b981' : '#ffffff',
                          color: isSel ? '#ffffff' : '#334155',
                          fontWeight: 600, fontSize: '11px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>{isSel ? '✓ ' : ''}{v}</button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Regular Drinks Selection for Combo */}
              {(() => {
                const dCount = getMealDrinkCount(customizingItem?.name)
                if (dCount <= 0) return null
                const drinksArr = [
                  { label: '1st Drink', val: selectedDrink1, set: setSelectedDrink1 },
                  { label: '2nd Drink', val: selectedDrink2, set: setSelectedDrink2 },
                  { label: '3rd Drink', val: selectedDrink3, set: setSelectedDrink3 },
                  { label: '4th Drink', val: selectedDrink4, set: setSelectedDrink4 },
                  { label: '5th Drink', val: selectedDrink5, set: setSelectedDrink5 }
                ].slice(0, dCount)

                return (
                  <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '2px solid #bbf7d0', marginTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🥤 CHOOSE YOUR {dCount} REGULAR DRINK{dCount > 1 ? 'S' : ''} INCLUDED IN {customizingItem?.name?.toUpperCase()}</span>
                    </div>

                    {drinksArr.map((dItem, idx) => (
                      <div key={idx} style={{ marginBottom: idx === drinksArr.length - 1 ? 0 : '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>{idx + 1}. {dItem.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea', 'Water Bottle'].map(d => (
                            <button key={d} type="button" onClick={() => dItem.set(d)} style={{
                              padding: '8px', borderRadius: '8px',
                              border: dItem.val === d ? '2px solid #16a34a' : '1px solid #cbd5e1',
                              background: dItem.val === d ? '#16a34a' : '#ffffff',
                              color: dItem.val === d ? '#ffffff' : '#334155',
                              fontWeight: 700, fontSize: '11.5px', cursor: 'pointer', textAlign: 'center'
                            }}>
                              {dItem.val === d ? '✓ ' : ''}{d}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Dips Selection for Combo (e.g. Mega Feast Meal - 3 Dips) */}
              {(() => {
                const dipCount = getMealDipCount(customizingItem?.name)
                if (dipCount <= 0) return null
                const dipsArr = [
                  { label: '1st Dip', val: selectedDip1, set: setSelectedDip1 },
                  { label: '2nd Dip', val: selectedDip2, set: setSelectedDip2 },
                  { label: '3rd Dip', val: selectedDip3, set: setSelectedDip3 }
                ].slice(0, dipCount)

                return (
                  <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '16px', border: '2px solid #fed7aa', marginTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#c2410c', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🧄 CHOOSE YOUR {dipCount} DIPS INCLUDED IN {customizingItem?.name?.toUpperCase()}</span>
                    </div>

                    {dipsArr.map((dItem, idx) => (
                      <div key={idx} style={{ marginBottom: idx === dipsArr.length - 1 ? 0 : '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>{idx + 1}. {dItem.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {['Garlic Mayo Dip', 'Spicy Mayo Dip', 'Tzatziki Dip', 'Peri Peri Dip', 'Jalapeno Cheese Dip', 'Turkish Chili Dip'].map(dp => (
                            <button key={dp} type="button" onClick={() => dItem.set(dp)} style={{
                              padding: '8px', borderRadius: '8px',
                              border: dItem.val === dp ? '2px solid #ea580c' : '1px solid #cbd5e1',
                              background: dItem.val === dp ? '#ea580c' : '#ffffff',
                              color: dItem.val === dp ? '#ffffff' : '#334155',
                              fontWeight: 700, fontSize: '11.5px', cursor: 'pointer', textAlign: 'center'
                            }}>
                              {dItem.val === dp ? '✓ ' : ''}{dp}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

            </div>
          ) : (
            <>
              {/* Protein Choice Section (Chicken / Paneer) */}
              {(() => {
                const cItemName = (customizingItem?.name || '').toLowerCase()
                const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
                const hasProteinChoice = cItemName.includes('gyro') || cItemName.includes('rice') || cItemName.includes('meal') || cItemName.includes('feast') || cItemName.includes('box') || cCatName.includes('gyro') || cCatName.includes('rice') || cCatName.includes('protein')
                if (!hasProteinChoice) return null
                return (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🍗 / 🧀 Choose Protein
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Chicken', 'Paneer'].map(p => (
                        <button key={p} type="button" onClick={() => setSelectedProtein(p)} style={{
                          flex: 1, padding: '12px 14px', borderRadius: '10px',
                          border: selectedProtein === p ? '2px solid #e63946' : '1px solid #e5e7eb',
                          background: selectedProtein === p ? '#fff5f5' : '#f9fafb',
                          color: selectedProtein === p ? '#e63946' : '#374151',
                          fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
                        }}>
                          {p === 'Chicken' ? '🔴 Non-Veg Chicken' : '🟢 Veg Paneer'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Drink Choice Section */}
              {(() => {
                const dCount = getMealDrinkCount(customizingItem?.name)
                if (dCount <= 0) return null
                return (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🥤 Choose Drink / Beverage
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['Coca-Cola', 'Sprite', 'Fanta', 'Peach Ice Tea', 'Lime Ice Tea', 'Water Bottle'].map(d => (
                        <button key={d} type="button" onClick={() => setSelectedDrink1(d)} style={{
                          padding: '10px', borderRadius: '10px',
                          border: selectedDrink1 === d ? '2px solid #06b6d4' : '1px solid #e5e7eb',
                          background: selectedDrink1 === d ? '#ecfeff' : '#f9fafb',
                          color: selectedDrink1 === d ? '#0891b2' : '#374151',
                          fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>
                          {selectedDrink1 === d ? '✓ ' : ''}{d}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
              {/* Gyro Pita Bread Section */}
              {(() => {
                const cItemName = (customizingItem?.name || '').toLowerCase()
                const cCatName = (categories.find(c => c.id === customizingItem?.categoryId)?.name || '').toLowerCase()
                const hasGyroChoice = cItemName.includes('gyro') || cItemName.includes('meal') || cItemName.includes('feast') || cItemName.includes('box') || cCatName.includes('gyro')
                if (!hasGyroChoice) return null
                return (
                  <>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🥙 Pita Bread Type
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['Baked', 'Fried'].map(b => (
                          <button key={b} type="button" onClick={() => setSelectedBread(b)} style={{
                            flex: 1, padding: '10px 14px', borderRadius: '10px',
                            border: selectedBread === b ? '2px solid #e63946' : '1px solid #e5e7eb',
                            background: selectedBread === b ? '#fff5f5' : '#f9fafb',
                            color: selectedBread === b ? '#e63946' : '#374151',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
                          }}>
                            {b === 'Baked' ? '🫓 Baked Pita' : '🥙 Fried Pita'}
                          </button>
                        ))}
                      </div>
                    </div>

                  {/* Base Spread Section */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🧄 Base Spread
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {['Tzatziki', 'Hummus', 'Cheese', 'Ricotta'].map(s => (
                        <button key={s} type="button" onClick={() => setSelectedSpread(s)} style={{
                          padding: '10px', borderRadius: '10px',
                          border: selectedSpread === s ? '2px solid #e63946' : '1px solid #e5e7eb',
                          background: selectedSpread === s ? '#fff5f5' : '#f9fafb',
                          color: selectedSpread === s ? '#e63946' : '#374151',
                          fontWeight: 600, fontSize: '13px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                        }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sauces Section */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🌶️ Sauces (Select Multiple)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['Garlic Mayo', 'Turkish Chili', 'Jalapeno Cheese', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard'].map(sauce => {
                        const isSelected = selectedSauces.includes(sauce)
                        return (
                          <button key={sauce} type="button" onClick={() => {
                            if (isSelected) setSelectedSauces(selectedSauces.filter(x => x !== sauce))
                            else setSelectedSauces([...selectedSauces, sauce])
                          }} style={{
                            padding: '8px 10px', borderRadius: '10px',
                            border: isSelected ? '2px solid #e63946' : '1px solid #e5e7eb',
                            background: isSelected ? '#e63946' : '#f9fafb',
                            color: isSelected ? 'white' : '#374151',
                            fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                          }}>
                            {isSelected ? '✓ ' : ''}{sauce}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Veggies Section */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🥗 Fresh Veggies & Toppings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'].map(veg => {
                        const isSelected = selectedVeggies.includes(veg)
                        return (
                          <button key={veg} type="button" onClick={() => {
                            if (isSelected) setSelectedVeggies(selectedVeggies.filter(x => x !== veg))
                            else setSelectedVeggies([...selectedVeggies, veg])
                          }} style={{
                            padding: '8px 6px', borderRadius: '10px',
                            border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                            background: isSelected ? '#10b981' : '#f9fafb',
                            color: isSelected ? 'white' : '#374151',
                            fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
                          }}>
                            {isSelected ? '✓ ' : ''}{veg}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })()}
          </>
          )}

          {/* Custom Remarks */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Special Request / Kitchen Note
            </div>
            <input
              type="text"
              placeholder="e.g. Extra Spicy, No Onion, Less Mayo..."
              value={gyroNotes}
              onChange={e => setGyroNotes(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={handleAddStandardGyro} style={{ flex: 1, borderRadius: '12px' }}>
              Standard Item
            </Button>
            <Button variant="primary" onClick={handleAddGyroWithCustomization} style={{ flex: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>
              Add Customized Item • ₹{customizingItem?.price}
            </Button>
          </div>

        </div>
      </Modal>

      {/* Pay Mode Popup (#2) — settle bill immediately */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={currentOrder.complimentary ? '🎁 Confirm Complimentary Order' : '💳 Select Pay Mode & Settle'} size="md">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: '#1e293b', color: '#fff', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Bill Total</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#f87171' }}>{currentOrder.complimentary ? '₹0.00' : `₹${getTotal().toFixed(2)}`}</span>
          </div>
          {currentOrder.complimentary && (
            <div style={{ fontSize: '12px', color: '#92400e', background: '#fffbeb', border: '1px solid #fcd34d', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontWeight: 600 }}>
              🎁 Complimentary ({currentOrder.complimentaryType || 'Complimentary'}) — this bill will be marked free, no payment collected.
            </div>
          )}

          {currentOrder.complimentary ? (
            <button onClick={() => confirmPay('complimentary')} disabled={processing} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 800, fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
              {processing ? 'Placing...' : 'Confirm Free Complimentary Bill'}
            </button>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <button onClick={() => confirmPay('cash')} disabled={processing} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                  💵 Cash
                </button>
                <button onClick={() => confirmPay('upi')} disabled={processing} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  📱 UPI
                </button>
                <button onClick={() => confirmPay('card')} disabled={processing} style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
                  💳 Card
                </button>
                <button onClick={() => confirmPay('split')} disabled={processing} style={{ padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
                  ➗ Split
                </button>
              </div>

              {(() => {
                const ssum = (Number(splitCash) || 0) + (Number(splitUpi) || 0) + (Number(splitCard) || 0)
                const totalAmt = Math.round(getTotal())
                return (
                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>➗ Split Payment (amounts must equal ₹{totalAmt})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                      {[['Cash', 'cash', '#10b981'], ['UPI', 'upi', '#2563eb'], ['Card', 'card', '#8b5cf6']].map(([label, key, color]) => (
                        <div key={key}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color, marginBottom: '4px', textAlign: 'center' }}>{label}</div>
                          <input
                            type="number"
                            placeholder="0"
                            value={key === 'cash' ? splitCash : key === 'upi' ? splitUpi : splitCard}
                            onChange={e => key === 'cash' ? setSplitCash(e.target.value) : key === 'upi' ? setSplitUpi(e.target.value) : setSplitCard(e.target.value)}
                            min="0"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', textAlign: 'center', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: ssum === totalAmt ? '#059669' : '#dc2626', textAlign: 'center' }}>
                      {ssum === totalAmt ? '✓ Matches bill total' : `Total entered: ₹${ssum} (needs ₹${totalAmt})`}
                    </div>
                  </div>
                )
              })()}

              <button onClick={() => confirmPay('split')} disabled={processing}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 800, fontSize: '14px', cursor: processing ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
                ➗ Confirm Split & Settle
              </button>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <button onClick={() => { setShowPayModal(false); handlePlaceOrder() }} disabled={processing}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              Place as Pending (Kitchen Only)
            </button>
            <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Order Success & Manual Re-print Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="🎉 Order Placed Successfully" size="md">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
            Order #{lastPlacedOrder?.orderNumber || lastPlacedOrder?.id}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
            Order sent to kitchen. Choose print option below if you need manual printouts:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => PrintService.printKOTAndBill(lastPlacedOrder, true)}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(230,57,70,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🖨️ Print KOT & Bill (Both)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => PrintService.printKOT(lastPlacedOrder, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                📄 Print KOT Only
              </button>

              <button
                onClick={() => PrintService.printBill(lastPlacedOrder, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f3f4f6',
                  color: '#1f2937',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                🧾 Print Bill Only
              </button>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                marginTop: '10px',
                padding: '10px',
                background: 'transparent',
                color: '#6b7280',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Done / New Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Achariya Staff & Family Benefit Modal */}
      <Modal isOpen={showStaffModal} onClose={() => setShowStaffModal(false)} title="🎓 Achariya Staff & Family Benefit (50% OFF)" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f5f3ff', padding: '14px 16px', borderRadius: '14px', border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#5b21b6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎉 Achariya Family Week 2026</span>
              <span style={{ fontSize: '10px', background: '#7c3aed', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>50% BENEFIT</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6d28d9', lineHeight: 1.4 }}>
              Valid from <strong>04-Aug-2026 00:00</strong> to <strong>09-Aug-2026 23:59</strong> for Active Staff & Family Members. Default 1 bill per customer per day.
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
              Cashier Options (Search Employee ID, Name, Mobile, QR Code, or Family Mobile):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. EMP001, Dr. Achariya, 9876543210..."
                value={staffSearchQuery}
                onChange={e => setStaffSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyStaff()}
                style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #c4b5fd', fontSize: '13px', outline: 'none' }}
              />
              <button
                onClick={handleVerifyStaff}
                disabled={verifyingStaff}
                style={{
                  padding: '12px 20px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white',
                  fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
                }}
              >
                {verifyingStaff ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {staffVerifyError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
              ❌ {staffVerifyError}
            </div>
          )}

          {staffVerifyResult && staffVerifyResult.eligible && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                ✅ {staffVerifyResult.message}
              </div>
              <div style={{ fontSize: '13px', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Employee ID:</strong> {staffVerifyResult.employee.id}</div>
                <div><strong>Employee Name:</strong> {staffVerifyResult.employee.name}</div>
                <div><strong>Department:</strong> {staffVerifyResult.employee.department} ({staffVerifyResult.employee.designation})</div>
                {staffVerifyResult.familyMember && (
                  <div><strong>Family Member:</strong> {staffVerifyResult.familyMember.name} ({staffVerifyResult.familyMember.relationship})</div>
                )}
                <div><strong>Usage Limit Today:</strong> {staffVerifyResult.usageTodayCount} / {staffVerifyResult.maxBillsPerDay} used today</div>
                <div><strong>Offer Discount:</strong> {staffVerifyResult.discountPct}% OFF Gross Amount</div>
              </div>
              <button
                onClick={handleApplyStaffBenefit}
                style={{
                  marginTop: '14px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                  fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                }}
              >
                Apply 50% Staff Benefit Discount
              </button>
            </div>
          )}
        </div>
      </Modal>

    </div>
  )
}
