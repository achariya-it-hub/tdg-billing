import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  UtensilsCrossed, 
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useCartStore } from '../stores/cartStore'

const CAFE_WHATSAPP = '919150031333' // +91 91500 31333

const WhatsAppIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      fill={color}
    />
  </svg>
)

export default function Cart() {
  const navigate = useNavigate()
  const { 
    items, 
    details, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    setDetails, 
    getTotalAmount, 
    getTotalCount 
  } = useCartStore()

  const [errors, setErrors] = useState({})
  const [orderSent, setOrderSent] = useState(false)
  const [lastSentText, setLastSentText] = useState('')

  const totalAmount = getTotalAmount()
  const totalCount = getTotalCount()

  const handleInputChange = (field, value) => {
    setDetails({ [field]: value })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!details.name || !details.name.trim()) {
      errs.name = 'Please enter your name'
    }

    const cleanPhone = (details.phone || '').replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit WhatsApp number'
    }

    if (details.orderType === 'delivery') {
      if (!details.address || !details.address.trim()) {
        errs.address = 'Please enter your delivery address'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildWhatsAppMessage = () => {
    const typeLabel = 
      details.orderType === 'takeaway'
        ? '🥡 Takeaway / Self Pickup'
        : details.orderType === 'dine_in'
        ? `🍽️ Dine-in (Table: ${details.tableNo || 'Not specified'})`
        : '🛵 Home Delivery'

    let msg = `🥙 *TEN DENS GYROS - NEW ORDER* 🇬🇷\n`
    msg += `━━━━━━━━━━━━━━━━━━━━\n`
    msg += `👤 *Customer:* ${details.name.trim()}\n`
    msg += `📱 *Phone:* ${details.phone.trim()}\n`
    msg += `🏷️ *Order Type:* ${typeLabel}\n`

    if (details.orderType === 'delivery') {
      msg += `📍 *Delivery Address:* ${details.address.trim()}\n`
      if (details.landmark && details.landmark.trim()) {
        msg += `🚩 *Landmark:* ${details.landmark.trim()}\n`
      }
    }

    if (details.notes && details.notes.trim()) {
      msg += `📝 *Special Instructions:* ${details.notes.trim()}\n`
    }

    msg += `\n📦 *ORDER ITEMS (${totalCount}):*\n`
    items.forEach((item, index) => {
      const lineTotal = item.price * (item.quantity || 1)
      const variantText = item.variant ? ` (${item.variant})` : ''
      msg += `${index + 1}. *${item.quantity}x ${item.name}*${variantText} — ₹${lineTotal}\n`
    })

    msg += `━━━━━━━━━━━━━━━━━━━━\n`
    msg += `💰 *TOTAL AMOUNT:* *₹${totalAmount}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━\n`
    msg += `💬 Please confirm my order and share payment details (UPI QR / Cash). Thank you!`

    return msg
  }

  const handleSendWhatsAppOrder = () => {
    if (!items.length) return
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }

    const message = buildWhatsAppMessage()
    setLastSentText(message)
    const encoded = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${CAFE_WHATSAPP}?text=${encoded}`

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setOrderSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#121416',
      color: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: '#191b1e',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} /> Back to Menu
            </Link>

            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img 
                src="/tdg-logo.png" 
                alt="TDG" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/favicon.svg' }}
              />
              <span style={{ 
                color: '#ffd700', 
                fontSize: '18px', 
                fontWeight: 900, 
                letterSpacing: '1px',
                display: 'none'
              }}>
                TEN DENS GYROS
              </span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a 
              href={`https://wa.me/${CAFE_WHATSAPP}?text=Hi%20Ten%20Dens%20Gyros!%20I%20have%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#25D366',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <WhatsAppIcon size={16} color="#25D366" />
              <span>Cafe Support: +91 91500 31333</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 80px 20px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <ShoppingBag size={32} color="#ffd700" />
            Your Order Cart
            {totalCount > 0 && (
              <span style={{
                fontSize: '14px',
                fontWeight: 800,
                background: '#e63946',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                verticalAlign: 'middle'
              }}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            Review your items, enter delivery details, and place your order directly via WhatsApp in one click.
          </p>
        </div>

        {/* ORDER SUCCESS NOTIFICATION MODAL / BANNER */}
        <AnimatePresence>
          {orderSent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(16, 185, 129, 0.1))',
                border: '1.5px solid #25D366',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <CheckCircle2 size={32} color="#25D366" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#25D366', marginBottom: '6px' }}>
                    WhatsApp Chat Launched!
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    Your order details were pre-formatted and opened in WhatsApp. 
                    <strong> Please hit "Send" in WhatsApp</strong> to transmit the order to the Ten Dens Gyros cafe desk (+91 91500 31333). 
                    Our team will confirm your order and send the UPI QR code / payment confirmation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(lastSentText)
                    window.open(`https://wa.me/${CAFE_WHATSAPP}?text=${encoded}`, '_blank', 'noopener,noreferrer')
                  }}
                  style={{
                    background: '#25D366',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '13px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <WhatsAppIcon size={16} color="#000" /> Re-open WhatsApp
                </button>

                <button
                  onClick={() => {
                    clearCart()
                    setOrderSent(false)
                    navigate('/')
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  Clear Cart & Order Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <div style={{
            background: '#191b1e',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '40px auto'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 215, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <UtensilsCrossed size={36} color="#ffd700" />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>
              Your Gyro Cart is Empty
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px auto' }}>
              Looks like you haven't added any gyros or meals yet. Explore our handcrafted Greek gyros, meal deals, and artisanal shakes!
            </p>

            <Link
              to="/#gyros"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#e63946',
                color: '#fff',
                fontWeight: 800,
                fontSize: '15px',
                padding: '14px 28px',
                borderRadius: '10px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(230, 57, 70, 0.4)'
              }}
            >
              Browse The Gyro Lineup <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* CART CONTENT: 2-COLUMN LAYOUT */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
            alignItems: 'flex-start'
          }}>
            {/* LEFT COLUMN: ITEMS LIST */}
            <div>
              <div style={{
                background: '#191b1e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Selected Dishes
                  </h3>
                  <button
                    onClick={clearCart}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} /> Clear all
                  </button>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((item, idx) => {
                    const lineTotal = item.price * (item.quantity || 1)
                    return (
                      <div
                        key={`${item.id}_${item.variant}_${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          background: '#212427',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        {/* Item Image */}
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.2)',
                            flexShrink: 0
                          }}
                          onError={(e) => { e.target.src = '/hero_wide_gyro.png' }}
                        />

                        {/* Item Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{
                            fontSize: '15.5px',
                            fontWeight: 800,
                            color: '#fff',
                            margin: '0 0 4px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.name}
                          </h4>
                          {item.variant && (
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              background: 'rgba(255,255,255,0.06)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'inline-block',
                              marginBottom: '6px'
                            }}>
                              {item.variant}
                            </span>
                          )}
                          <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 700 }}>
                            ₹{item.price} each
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#191b1e',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '3px'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, -1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '14px',
                            minWidth: '24px',
                            textAlign: 'center',
                            color: '#fff'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ffd700',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div style={{
                          minWidth: '60px',
                          textAlign: 'right',
                          fontWeight: 900,
                          fontSize: '16px',
                          color: '#ffd700'
                        }}>
                          ₹{lineTotal}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id, item.variant)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Add More Items link */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Link
                    to="/#gyros"
                    style={{
                      color: '#ffd700',
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={15} /> Add more delicious items from menu
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CUSTOMER DETAILS & WHATSAPP CHECKOUT */}
            <div>
              <div style={{
                background: '#191b1e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'sticky',
                top: '90px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User size={18} color="#ffd700" />
                  Customer & Delivery Details
                </h3>

                {/* Order Type Toggle */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    ORDER TYPE
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    background: '#121416',
                    padding: '4px',
                    borderRadius: '10px'
                  }}>
                    {[
                      { id: 'delivery', label: '🛵 Delivery' },
                      { id: 'takeaway', label: '🥡 Takeaway' },
                      { id: 'dine_in', label: '🍽️ Dine-in' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleInputChange('orderType', t.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: details.orderType === t.id ? 800 : 600,
                          fontSize: '12.5px',
                          background: details.orderType === t.id ? '#e63946' : 'transparent',
                          color: details.orderType === t.id ? '#fff' : '#94a3b8',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Your Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={details.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#212427',
                        border: `1.5px solid ${errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.name && (
                      <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* WhatsApp Phone */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      WhatsApp Phone Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={details.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 48px',
                          background: '#212427',
                          border: `1.5px solid ${errors.phone ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {errors.phone && (
                      <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Delivery Specific Fields */}
                  {details.orderType === 'delivery' && (
                    <>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                          Delivery Address (Pondicherry) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Flat / Door No, Building, Street Name"
                          value={details.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: '#212427',
                            border: `1.5px solid ${errors.address ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                            resize: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {errors.address && (
                          <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                            {errors.address}
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near Church, White Town"
                          value={details.landmark}
                          onChange={(e) => handleInputChange('landmark', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: '#212427',
                            border: '1.5px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Dine-In Table No */}
                  {details.orderType === 'dine_in' && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Table Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Table 4"
                        value={details.tableNo}
                        onChange={(e) => handleInputChange('tableNo', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: '#212427',
                          border: '1.5px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}

                  {/* Special Cooking Instructions */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Cooking Instructions / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Extra spicy, no onions, keep sauce separate"
                      value={details.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#212427',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{
                  background: '#121416',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>
                    <span>Items Subtotal ({totalCount} items)</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>₹{totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#94a3b8' }}>
                    <span>Packaging & Taxes</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '18px',
                    fontWeight: 900
                  }}>
                    <span style={{ color: '#fff' }}>Grand Total</span>
                    <span style={{ color: '#ffd700' }}>₹{totalAmount}</span>
                  </div>
                </div>

                {/* WhatsApp Place Order Button */}
                <button
                  type="button"
                  onClick={handleSendWhatsAppOrder}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
                    transition: 'all 0.2s',
                    letterSpacing: '0.3px'
                  }}
                >
                  <WhatsAppIcon size={20} color="#fff" />
                  <span>Send Order to Cafe WhatsApp (₹{totalAmount}) →</span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    ⚡ Clicking creates a single formatted WhatsApp message to <strong>+91 91500 31333</strong>. Cafe staff will instantly confirm and share payment QR code!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

