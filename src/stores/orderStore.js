import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const IST_DATE_STR = () => {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).split('-')
    return `${parts[0]}-${parts[1]}-${parts[2]}`
  } catch (e) {
    return new Date().toISOString().slice(0, 10)
  }
}

const DEFAULT_CAMPAIGNS = {
  inauguration: { active: true, date: '2026-07-27', pct: 50, label: 'Inauguration Offer 50%' },
  special20: { active: true, pct: 20, label: 'Special Offer 20%' },
  vip50: { active: true, pct: 50, label: 'VIP 50% OFF' }
}

function campaignWindowActive(cfg) {
  if (!cfg || !cfg.active) return false
  const today = IST_DATE_STR()
  if (cfg.date) return today === cfg.date
  if (cfg.from && cfg.to) return today >= cfg.from && today <= cfg.to
  return true
}

export const useOrderStore = create(
  persist(
    (set, get) => ({
  currentOrder: {
    items: [],
    type: 'dine-in',
    tableNumber: '',
    customerName: '',
    customerPhone: '',
    customerDiscountPct: 0,
    notes: '',
    complimentary: false,
    complimentaryType: '',
    specialRemarks: '',
    inaugurationOffer: false,
    specialOffer20: false,
    vip50: false,
    staffBenefitOffer: false,
    employeeId: null,
    employeeName: null,
    employeeDept: null,
    familyMemberId: null,
    familyMemberName: null,
    offerName: null,
    offerType: null
  },
  orders: [],
  heldOrders: [],
  campaigns: DEFAULT_CAMPAIGNS,

  loadCampaigns: async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
      const res = await fetch(`${apiUrl}/api/settings`)
      if (res.ok) {
        const settings = await res.json()
        if (settings && settings.campaigns) {
          set({ campaigns: { ...DEFAULT_CAMPAIGNS, ...settings.campaigns } })
          get().refreshActiveOffers()
        }
      }
    } catch (e) {
      console.warn('Campaign config fetch failed, using defaults', e)
    }
  },

  refreshActiveOffers: () => {
    const order = get().currentOrder
    const c = get().campaigns || DEFAULT_CAMPAIGNS
    const inaActive = campaignWindowActive(c.inauguration)
    const s20Active = campaignWindowActive(c.special20)
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        inaugurationOffer: order.inaugurationOffer && inaActive,
        specialOffer20: order.specialOffer20 && s20Active
      }
    }))
  },

  addItem: (item) => {
    set(state => {
      const existingIndex = state.currentOrder.items.findIndex(
        i => i.menuItemId === item.menuItemId &&
             i.variantId === item.variantId &&
             JSON.stringify(i.customization || null) === JSON.stringify(item.customization || null)
      )
      
      if (existingIndex >= 0) {
        const newItems = [...state.currentOrder.items]
        newItems[existingIndex].quantity += 1
        newItems[existingIndex].totalPrice = newItems[existingIndex].unitPrice * newItems[existingIndex].quantity
        return { currentOrder: { ...state.currentOrder, items: newItems } }
      }
      
      return {
        currentOrder: {
          ...state.currentOrder,
          items: [...state.currentOrder.items, { ...item, quantity: 1 }]
        }
      }
    })
  },
  
  updateItemQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index)
      return
    }
    set(state => {
      const newItems = [...state.currentOrder.items]
      newItems[index].quantity = quantity
      newItems[index].totalPrice = newItems[index].unitPrice * quantity
      return { currentOrder: { ...state.currentOrder, items: newItems } }
    })
  },
  
  removeItem: (index) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.filter((_, i) => i !== index)
      }
    }))
  },
  
  setOrderType: (type) => {
    set(state => ({ currentOrder: { ...state.currentOrder, type } }))
  },
  
  setTableNumber: (tableNumber) => {
    set(state => ({ currentOrder: { ...state.currentOrder, tableNumber } }))
  },
  
  setCustomerName: (customerName) => {
    set(state => ({ currentOrder: { ...state.currentOrder, customerName } }))
  },

  setCustomer: (customer) => {
    set(state => {
      const fetchedName = customer ? (customer.customerName || customer.name || customer.fullName || customer.userName || customer.guestName || customer.contactName || '') : ''
      const isGeneric = (str) => {
        if (!str) return true
        const s = String(str).trim().toLowerCase()
        return !s || ['customer', 'vip customer', 'vip 50% customer', 'mobile app user', 'den member', 'new customer', 'guest', 'user'].includes(s)
      }

      const existingName = state.currentOrder.customerName
      const finalName = !isGeneric(fetchedName) ? fetchedName : (!isGeneric(existingName) ? existingName : 'Customer')
      const disc = customer ? Math.min(90, Math.round(Number(customer.discountPct) || 0)) : 0

      return {
        currentOrder: {
          ...state.currentOrder,
          customerName: finalName,
          customerPhone: (customer && customer.phone) || state.currentOrder.customerPhone,
          customerDiscountPct: disc,
          customerDiscountReason: customer ? (customer.discountReason || customer.tier || '') : ''
        }
      }
    })
  },

  setCustomerPhone: async (customerPhone) => {
    const clean = String(customerPhone || '').replace(/\D/g, '')
    set(state => {
      const isGeneric = (str) => {
        if (!str) return true
        const s = String(str).trim().toLowerCase()
        return !s || ['customer', 'vip customer', 'vip 50% customer', 'mobile app user', 'den member', 'new customer', 'guest', 'user'].includes(s)
      }
      return {
        currentOrder: {
          ...state.currentOrder,
          customerPhone: clean || customerPhone,
          customerName: !isGeneric(state.currentOrder.customerName) ? state.currentOrder.customerName : 'Customer'
        }
      }
    })
    if (clean.length >= 8) {
      try {
        const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
        const res = await fetch(`${apiUrl}/api/customers/check-discount?phone=${clean}`)
        if (res.ok) {
          const data = await res.json()
          get().setCustomer({
            customerName: data.customerName || '',
            phone: data.phone || clean,
            discountPct: Number(data.discountPct) || 0,
            tier: data.tier,
            discountReason: data.discountReason,
            discountName: data.discountReason
          })
        }
      } catch (e) {
        console.warn('Customer discount check failed', e)
      }
    }
  },

  setCustomerDiscountPct: (pct) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        customerDiscountPct: Math.min(90, Math.max(0, Math.round(Number(pct) || 0)))
      }
    }))
  },

  clearCustomer: () => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        customerName: '',
        customerPhone: '',
        customerDiscountPct: 0
      }
    }))
  },

  setVip50: (enabled) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        vip50: !!enabled,
        inaugurationOffer: false,
        specialOffer20: false,
        staffBenefitOffer: false
      }
    }))
  },
  
  setNotes: (notes) => {
    set(state => ({ currentOrder: { ...state.currentOrder, notes } }))
  },

  setComplimentary: (complimentaryType) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        complimentary: !!complimentaryType,
        complimentaryType
      }
    }))
  },

  setSpecialRemarks: (specialRemarks) => {
    set(state => ({ currentOrder: { ...state.currentOrder, specialRemarks } }))
  },

  clearOrder: () => {
    set({
      currentOrder: {
        items: [],
        type: 'dine-in',
        tableNumber: '',
        customerName: '',
        customerPhone: '',
        customerDiscountPct: 0,
        notes: '',
        complimentary: false,
        complimentaryType: '',
        specialRemarks: '',
        inaugurationOffer: false,
        specialOffer20: false,
        vip50: false,
        staffBenefitOffer: false,
        employeeId: null,
        employeeName: null,
        employeeDept: null,
        familyMemberId: null,
        familyMemberName: null,
        offerName: null,
        offerType: null
      }
    })
  },
  
  holdOrder: () => {
    const order = get().currentOrder
    if (order.items.length === 0) return
    set(state => ({
      heldOrders: [...state.heldOrders, { ...order, id: Date.now() }]
    }))
    get().clearOrder()
  },
  
  recallOrder: (index) => {
    const order = get().heldOrders[index]
    if (!order) return
    set(state => ({
      currentOrder: order,
      heldOrders: state.heldOrders.filter((_, i) => i !== index)
    }))
  },

  setInaugurationOffer: (enabled) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        inaugurationOffer: !!enabled,
        specialOffer20: enabled ? false : state.currentOrder.specialOffer20,
        staffBenefitOffer: enabled ? false : state.currentOrder.staffBenefitOffer,
        vip50: enabled ? false : state.currentOrder.vip50
      }
    }))
  },

  setSpecialOffer20: (enabled) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        specialOffer20: !!enabled,
        inaugurationOffer: enabled ? false : state.currentOrder.inaugurationOffer,
        staffBenefitOffer: enabled ? false : state.currentOrder.staffBenefitOffer,
        vip50: enabled ? false : state.currentOrder.vip50
      }
    }))
  },

  setStaffBenefitOffer: (data) => {
    if (!data || !data.eligible) {
      set(state => ({
        currentOrder: {
          ...state.currentOrder,
          staffBenefitOffer: false,
          employeeId: null,
          employeeName: null,
          employeeDept: null,
          familyMemberId: null,
          familyMemberName: null,
          offerName: null,
          offerType: null
        }
      }))
      return
    }

    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        staffBenefitOffer: true,
        inaugurationOffer: false,
        specialOffer20: false,
        vip50: false,
        employeeId: data.employee?.id || null,
        employeeName: data.employee?.name || null,
        employeeDept: data.employee?.department || null,
        familyMemberId: data.familyMember?.id || null,
        familyMemberName: data.familyMember?.name || null,
        offerName: data.offerName || 'Achariya Family Week 2026',
        offerType: 'staff_family',
        discountPct: data.discountPct || 50,
        discountName: `${data.offerName || 'Achariya Family Week 2026'} (50% OFF)`
      }
    }))
  },

  getRawSubtotal: () => {
    return get().currentOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
  },

  getDiscount: () => {
    const raw = get().getRawSubtotal()
    const order = get().currentOrder
    if (order.staffBenefitOffer) {
      const pct = (order.discountPct || 50) / 100
      return Math.round(raw * pct)
    }
    if (order.customerDiscountPct > 0) return Math.round(raw * order.customerDiscountPct / 100)
    if (order.vip50) return Math.round(raw * 0.5)
    if (order.inaugurationOffer) return Math.round(raw * 0.5)
    if (order.specialOffer20) return Math.round(raw * 0.2)
    return 0
  },
  
  getSubtotal: () => {
    return get().getRawSubtotal() - get().getDiscount()
  },
  
  getTax: () => {
    return Math.round(get().getSubtotal() * 0.05)
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getTax()
  },
  
  placeOrder: async (paymentMethod, settleDirectly = false, splitPayments = undefined, cashTendered = undefined, changeReturned = undefined) => {
    try {
      const order = get().currentOrder
      const items = order.items || []
      
      if (items.length === 0) {
        throw new Error('No items in order')
      }
      
      const rawSubtotal = get().getRawSubtotal()
      const discount = get().getDiscount()
      const subtotal = get().getSubtotal()
      const tax = get().getTax()
      const total = get().getTotal()
      
      let newOrder = null
      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : window.location.origin
        
        const res = await fetch(`${apiUrl}/api/pos/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...order,
            items,
            rawSubtotal,
            discount,
            subtotal,
            tax,
            total,
            inaugurationOffer: order.inaugurationOffer || false,
            specialOffer20: order.specialOffer20 || false,
            staffBenefitOffer: order.staffBenefitOffer || false,
            employeeId: order.employeeId || null,
            employeeName: order.employeeName || null,
            employeeDept: order.employeeDept || null,
            familyMemberId: order.familyMemberId || null,
            familyMemberName: order.familyMemberName || null,
            offerName: order.offerName || null,
            offerType: order.offerType || null,
            discountPct: order.discountPct || 0,
            discountName: order.discountName || undefined,
            vip50: order.vip50 || false,
            customerDiscountPct: order.customerDiscountPct || 0,
            date: IST_DATE_STR(),
            paymentMethod: paymentMethod || 'cash',
            settleDirectly: Boolean(settleDirectly),
            splitPayments,
            cashTendered: cashTendered !== undefined ? Number(cashTendered) : undefined,
            changeReturned: changeReturned !== undefined ? Number(changeReturned) : undefined,
            customerPhone: order.customerPhone || ''
          })
        })
        
        if (res.ok) {
          newOrder = await res.json()
          console.log('Order saved to server:', newOrder)
        } else {
          throw new Error('Server error')
        }
      } catch (apiErr) {
        console.log('API not available, using local storage')
        newOrder = {
          id: `ORD-${Date.now()}`,
          orderNumber: Date.now() % 10000 + 1000,
          type: order.type || 'dine-in',
          tableNumber: order.tableNumber || '',
          customerName: order.customerName || '',
          customerPhone: order.customerPhone || '',
          notes: order.notes || '',
          items: items.map(item => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            status: 'pending'
          })),
          subtotal,
          tax,
          total,
          paymentMethod,
          cashTendered: cashTendered !== undefined ? Number(cashTendered) : undefined,
          changeReturned: changeReturned !== undefined ? Number(changeReturned) : undefined,
          status: 'pending',
          paymentStatus: 'pending',
          source: 'pos',
          complimentary: order.complimentary || false,
          complimentaryType: order.complimentaryType || '',
          specialRemarks: order.specialRemarks || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      set(state => ({ orders: [newOrder, ...state.orders] }))
      get().clearOrder()
      
      console.log('Order placed:', newOrder)
      return newOrder
    } catch (err) {
      console.error('Error placing order:', err)
      throw err
    }
  },
  
  fetchOrders: async () => {}
}),
    {
      name: 'tdg-orders-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentOrder: state.currentOrder,
        orders: state.orders,
        heldOrders: state.heldOrders
      })
    }
  )
)
