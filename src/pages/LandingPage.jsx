import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Play, 
  Star,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Phone,
  Mail,
  Menu as MenuIcon,
  User,
  ArrowUp,
  X
} from 'lucide-react'
import { useMenuStore } from '../stores/menuStore'

export default function LandingPage() {
  const { menuItems, fetchMenuItems } = useMenuStore()
  const [customer, setCustomer] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const slides = [
    {
      image: '/slide1.jpg',
      subtitle: 'The Taste of Authentic Gyros',
      title: 'FLAME-GRILLED PERFECT GYROS',
      desc: 'Indulge in our signature chicken wraps stuffed with fresh crisp onions, tomatoes, and cool tzatziki spread.'
    },
    {
      image: '/slide2.jpg',
      subtitle: 'Fresh & Crisp Combos',
      title: 'LOADED FRIES & GYRO PLATES',
      desc: 'Get the complete meal experience with hand-battered crispy fries, gourmet yogurt dips, and tender flame-seared meat.'
    },
    {
      image: '/slide3.jpg',
      subtitle: 'Original Ten Den Brand',
      title: 'THE LEGENDARY TDG WRAPS',
      desc: 'Experience the authentic Mediterranean taste profile designed by our master chefs with secret spices.'
    }
  ]
  
  useEffect(() => {
    fetchMenuItems()
    const savedCustomer = localStorage.getItem('customer_user')
    if (savedCustomer) {
      setCustomer(JSON.parse(savedCustomer))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Filter out a few gyros for the "Signature Gyros" showcase section
  let signatureGyros = menuItems 
    ? menuItems.filter(item => item.name.toLowerCase().includes('gyro')).slice(0, 4)
    : []

  // If no items match the 'gyro' keyword, fallback to displaying the first 4 items from the live database
  if (signatureGyros.length === 0 && menuItems && menuItems.length > 0) {
    signatureGyros = menuItems.slice(0, 4)
  }

  // Fallback signature items if database is empty
  const defaultSignatures = [
    { id: 'sig1', name: 'Chicken Gyro', price: 99, description: 'Juicy marinated chicken, fresh veggies, tzatziki sauce.', image: '/hero_gyro_wrap.png' },
    { id: 'sig2', name: 'Beef Gyro', price: 120, description: 'Tender beef slices, onions, tomatoes & our special sauce.', image: '/hero_greek_gyro.png' },
    { id: 'sig3', name: 'Lamb Gyro', price: 140, description: 'Premium lamb, grilled to perfection with herbs.', image: '/hero_gyro_wrap.png' },
    { id: 'sig4', name: 'Falafel Gyro', price: 99, description: 'Crispy falafel, hummus, lettuce, tomatoes & tahini.', image: '/crispy_chicken.png' }
  ]

  const displaySignatures = signatureGyros.length > 0 ? signatureGyros : defaultSignatures

  // Testimonials
  const testimonials = [
    { name: 'James R.', rating: 5, comment: 'The best gyro I\'ve ever had! Fresh, flavorful and absolutely delicious.', avatar: '/timeline_2013.png' },
    { name: 'Sarah M.', rating: 5, comment: 'Amazing food and great service. Highly recommended!', avatar: '/timeline_2009.png' },
    { name: 'David L.', rating: 5, comment: 'Authentic flavors that take me back to Greece!', avatar: '/timeline_2018.png' }
  ]

  // Timeline items
  const timelineMilestones = [
    { year: '2009', title: 'THE BEGINNING', desc: 'Our first restaurant opened with a dream.', img: '/timeline_2009.png' },
    { year: '2013', title: 'GROWTH', desc: 'Expanded our menu and locations.', img: '/timeline_2013.png' },
    { year: '2018', title: 'RECOGNITION', desc: 'Awarded for best gyro in town.', img: '/timeline_2018.png' },
    { year: '2024', title: 'THE FUTURE', desc: 'Continuing to serve with passion.', img: '/crispy_chicken.png' }
  ]

  const denUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://den.tendengyros.com'

  // CSS Spacing Styles for Embossed Look
  const embossedCardStyle = {
    backgroundColor: '#34393e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.1), inset -1px -1px 0px rgba(0,0,0,0.5), 0 12px 24px rgba(0,0,0,0.4)',
    borderRadius: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  return (
    <div style={{ 
      backgroundColor: '#292c30', 
      color: '#ffffff', 
      minHeight: '100vh', 
      fontFamily: "'Lexend Deca', sans-serif",
      overflowX: 'hidden'
    }}>
      <style>{`
        /* Global responsive rules */
        .desktop-nav {
          display: flex;
        }
        .desktop-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }
        .responsive-grid-4 {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 24px !important;
        }
        .responsive-grid-3 {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 24px !important;
        }
        .responsive-story-grid {
          display: grid !important;
          grid-template-columns: 0.9fr 1.1fr !important;
          gap: 60px !important;
        }
        .responsive-timeline-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 20px !important;
        }
        .responsive-footer-grid {
          display: grid !important;
          grid-template-columns: 1.2fr 0.8fr 0.8fr 1.2fr !important;
          gap: 40px !important;
        }
        
        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .responsive-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .responsive-grid-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .responsive-story-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .responsive-timeline-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .responsive-footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .responsive-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .responsive-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .responsive-timeline-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .timeline-connector {
            display: none !important;
          }
          header {
            padding: 12px 20px !important;
          }
          section, footer {
            padding: 40px 20px !important;
          }
        }
        
        @media (max-width: 640px) {
          .hero-buttons {
            flex-direction: column;
            gap: 10px;
          }
          .hero-buttons a {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .responsive-timeline-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 1. Header (Sticky glassmorphic) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(41, 44, 48, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo and Brand Name (Rounded Rectangle Box) */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '8px 16px'
          }}>
            <img 
              src="/tdg-logo.png" 
              alt="TDG" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/favicon.svg' }}
            />
          </div>
        </Link>

        {/* Desktop Navigation (Highlighted Golden Text Shadow Animations) */}
        <nav className="desktop-nav" style={{ gap: '28px', alignItems: 'center' }}>
          <motion.a 
            href="#hero" 
            whileHover={{ y: -2, textShadow: '0 0 10px rgba(255, 215, 0, 0.85)', color: '#ffd700' }}
            style={{ color: '#ffd700', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', transition: 'color 0.2s' }}
          >
            HOME
          </motion.a>
          <motion.a 
            href="#menu" 
            whileHover={{ y: -2, textShadow: '0 0 10px rgba(255, 215, 0, 0.85)', color: '#ffd700' }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', transition: 'color 0.2s' }}
          >
            MENU
          </motion.a>
          <motion.a 
            href="#about" 
            whileHover={{ y: -2, textShadow: '0 0 10px rgba(255, 215, 0, 0.85)', color: '#ffd700' }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', transition: 'color 0.2s' }}
          >
            ABOUT
          </motion.a>
          <motion.a 
            href="#testimonials" 
            whileHover={{ y: -2, textShadow: '0 0 10px rgba(255, 215, 0, 0.85)', color: '#ffd700' }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', transition: 'color 0.2s' }}
          >
            REVIEWS
          </motion.a>
          <motion.a 
            href="#contact" 
            whileHover={{ y: -2, textShadow: '0 0 10px rgba(255, 215, 0, 0.85)', color: '#ffd700' }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1.5px', transition: 'color 0.2s' }}
          >
            CONTACT
          </motion.a>
        </nav>

        {/* Action Button & Account Portal */}
        <div className="desktop-actions">
          <a href={`${denUrl}/`} style={{
            backgroundColor: '#e63946',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ORDER NOW <ArrowRight size={14} />
          </a>
          
          {customer ? (
            <a href={`${denUrl}/`} style={{
              color: '#ffd700',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'rgba(255, 215, 0, 0.05)'
            }}>
              <User size={14} /> MY DEN (🪙{customer.points})
            </a>
          ) : (
            <a href={`${denUrl}/`} style={{
              color: '#ffd700',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '8px 16px',
              borderRadius: '20px'
            }}>
              <User size={14} /> SIGN IN
            </a>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>

        {/* Mobile Dropdown Drawer Menu */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#292c30',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 99
          }}>
            <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffd700', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>HOME</a>
            <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>MENU</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>ABOUT</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>REVIEWS</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>CONTACT</a>
            
            <a href={`${denUrl}/`} onClick={() => setIsMobileMenuOpen(false)} style={{
              backgroundColor: '#e63946',
              color: '#fff',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 800,
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              ORDER NOW <ArrowRight size={14} />
            </a>

            {customer ? (
              <a href={`${denUrl}/`} onClick={() => setIsMobileMenuOpen(false)} style={{
                color: '#ffd700',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 800,
                textAlign: 'center',
                padding: '10px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                background: 'rgba(255, 215, 0, 0.05)',
                display: 'block'
              }}>
                MY DEN (🪙{customer.points})
              </a>
            ) : (
              <a href={`${denUrl}/`} onClick={() => setIsMobileMenuOpen(false)} style={{
                color: '#ffd700',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 800,
                textAlign: 'center',
                padding: '10px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'block'
              }}>
                SIGN IN
              </a>
            )}
          </div>
        )}
      </header>

      {/* 2. Hero Section (Full Width / Full Bleed Background Image Slider) */}
      <section id="hero" style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 40px',
        backgroundImage: `url(${slides[currentSlide].image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
        transition: 'background-image 0.8s ease-in-out'
      }}>
        {/* Dark Radial/Linear Gradient Overlay to ensure full legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(41, 44, 48, 0.95) 0%, rgba(41, 44, 48, 0.8) 45%, rgba(41, 44, 48, 0.3) 100%)',
          zIndex: 1
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr',
          position: 'relative',
          zIndex: 2
        }}>
          
          {/* Left Text Column (Stretched clean profile) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
            
            <motion.span 
              key={`sub-${currentSlide}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '16px', color: '#ffd700', fontStyle: 'italic', fontWeight: 500, fontFamily: 'serif' }}
            >
              {slides[currentSlide].subtitle}
            </motion.span>
            
            <motion.h1 
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ fontSize: 'clamp(28px, 6vw, 64px)', fontWeight: 950, lineHeight: 0.9, letterSpacing: '-2px', textTransform: 'uppercase' }}
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: '16px', color: '#e5e7eb', lineHeight: 1.6 }}
            >
              {slides[currentSlide].desc}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hero-buttons"
            >
              <a href={`${denUrl}/`} style={{
                backgroundColor: '#ffd700',
                color: '#000',
                padding: '14px 32px',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '4px',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
              }}>
                ORDER NOW <ArrowRight size={16} />
              </a>

              <a href="#menu" style={{
                backgroundColor: 'rgba(41, 44, 48, 0.6)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                padding: '14px 32px',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '4px'
              }}>
                VIEW MENU <ArrowRight size={16} />
              </a>

              <a href="/app.apk" download style={{
                backgroundColor: 'rgba(255, 215, 0, 0.08)',
                color: '#ffd700',
                border: '1.5px dashed rgba(255, 215, 0, 0.4)',
                padding: '14px 32px',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '4px'
              }}>
                DOWNLOAD APP 📱
              </a>
            </motion.div>

            {/* Bottom scroll down indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af', fontSize: '11px', letterSpacing: '1px' }}>
                <div style={{
                  width: '20px',
                  height: '32px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  position: 'relative'
                }}>
                  <motion.div 
                    animate={{ y: [2, 12, 2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                      width: '4px',
                      height: '8px',
                      backgroundColor: '#ffd700',
                      borderRadius: '2px',
                      margin: '2px auto'
                    }}
                  />
                </div>
                <span>SCROLL DOWN</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Four Feature Cards (Embossed & Animated on entry) */}
      <section style={{ padding: '60px 40px', backgroundColor: '#1f2124' }}>
        <div className="responsive-grid-4" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {[
            { icon: <Flame size={22} color="#ffd700" />, title: 'FRESH INGREDIENTS', desc: 'We use only the freshest ingredients, daily.' },
            { icon: <Sparkles size={22} color="#ffd700" />, title: 'AUTHENTIC RECIPES', desc: 'Traditional recipes crafted to perfection.' },
            { icon: <Clock size={22} color="#e63946" />, title: 'FAST DELIVERY', desc: 'Hot, fresh & on time, every time.' },
            { icon: <Award size={22} color="#ffd700" />, title: 'PREMIUM QUALITY', desc: 'Quality you can taste in every bite.' }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ 
                y: -6, 
                boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.12), inset -1px -1px 0px rgba(0,0,0,0.8), 0 15px 30px rgba(255,215,0,0.15)',
                borderColor: 'rgba(255,215,0,0.2)' 
              }}
              style={{
                ...embossedCardStyle,
                padding: '32px 24px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                {card.icon}
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {card.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* Choose Your Own Gyro Custom Builder Section */}
      <ChooseYourOwnGyroSection denUrl={denUrl} />

      {/* 4. Signature Gyros Section (Embossed & Animated on entry) */}
      <section id="menu" style={{ padding: '80px 40px', backgroundColor: '#292c30' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 950, letterSpacing: '1px', textTransform: 'uppercase' }}>
                SIGNATURE GYROS
              </h2>
              <div style={{ width: '60px', height: '2px', backgroundColor: '#ffd700' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#fff'
              }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#fff'
              }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="responsive-grid-4">
            {displaySignatures.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.15), inset -1px -1px 0px rgba(0,0,0,0.8), 0 15px 30px rgba(230,57,70,0.25)',
                  borderColor: 'rgba(230,57,70,0.3)'
                }}
                style={{
                  ...embossedCardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
              >
                {/* Image */}
                <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={item.image || '/hero_greek_gyro.png'} 
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/hero_gyro_wrap.png' }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.4, minHeight: '34px' }}>
                    {item.description}
                  </p>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffd700' }}>
                    ₹{item.price}
                  </span>
                </div>

                {/* Button */}
                <a href={`${denUrl}/`} style={{
                  backgroundColor: '#e63946',
                  color: '#fff',
                  padding: '14px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  letterSpacing: '1.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  ORDER NOW <ShoppingBag size={14} />
                </a>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Stats Counter Strip */}
      <section style={{
        padding: '50px 40px',
        backgroundColor: '#1f2124',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div className="responsive-grid-4" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Star size={18} color="#ffd700" fill="#ffd700" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>10,000+</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px' }}>HAPPY CUSTOMERS</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#ffd700" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>50+</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px' }}>MENU ITEMS</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Award size={18} color="#ffd700" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>15</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px' }}>YEARS EXPERIENCE</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Star size={18} color="#ffd700" fill="#ffd700" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '2px' }}>
                4.9 <Star size={16} color="#ffd700" fill="#ffd700" />
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px' }}>CUSTOMER RATING</div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Our Story Section */}
      <section id="about" style={{ padding: '80px 40px', backgroundColor: '#292c30' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="responsive-story-grid" style={{ alignItems: 'center' }}>
            
            {/* Story text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 950, letterSpacing: '1px', textTransform: 'uppercase' }}>
                OUR STORY
              </h2>
              <div style={{ width: '60px', height: '2px', backgroundColor: '#ffd700', marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>
                TDG was born from a passion for authentic Mediterranean flavors. Our journey began with a simple goal – to serve the most delicious, high-quality gyros with a modern twist. 
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>
                We choose clean breast cuts, handcraft our yogurt wraps, and grill over open flames to capture the authentic charcoal profile that makes Greek street wraps legendary.
              </p>
              
              <a href="#menu" style={{
                border: '1.5px solid #ffd700',
                color: '#ffd700',
                padding: '12px 28px',
                fontSize: '12px',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '1px',
                width: 'fit-content',
                marginTop: '12px',
                borderRadius: '4px'
              }}>
                READ MORE →
              </a>
            </div>

            {/* Timeline (Animated & Embossed bubbles) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
              {/* Horizontal Line connector */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '20px',
                right: '20px',
                height: '2px',
                backgroundColor: 'rgba(255,215,0,0.15)',
                zIndex: 1
              }} className="timeline-connector" />

              <div className="responsive-timeline-grid" style={{
                position: 'relative',
                zIndex: 2
              }}>
                {timelineMilestones.map((node, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    whileHover={{ y: -4 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                  >
                    {/* Circle Image Wrapper - Embossed shadow boundary */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #ffd700',
                      backgroundColor: '#121216',
                      boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.6)',
                      marginBottom: '16px'
                    }}>
                      <img src={node.img} alt={node.year} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffd700' }}>{node.year}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px', marginTop: '6px', textTransform: 'uppercase' }}>
                      {node.title}
                    </span>
                    <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px', lineHeight: 1.4 }}>
                      {node.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. What Our Customers Say (Testimonials / Embossed cards) */}
      <section id="testimonials" style={{ padding: '80px 40px', backgroundColor: '#1f2124' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 950, letterSpacing: '1px', textTransform: 'uppercase' }}>
              WHAT OUR CUSTOMERS SAY
            </h2>
            <div style={{ width: '60px', height: '2px', backgroundColor: '#ffd700', margin: '12px auto 0 auto' }} />
          </div>

          <div className="responsive-grid-3">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ 
                  y: -6, 
                  boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.12), inset -1px -1px 0px rgba(0,0,0,0.8), 0 15px 30px rgba(230,57,70,0.15)',
                  borderColor: 'rgba(230,57,70,0.2)' 
                }}
                style={{
                  ...embossedCardStyle,
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative'
                }}
              >
                {/* Red Quote icon */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '30px',
                  fontSize: '48px',
                  fontWeight: 900,
                  color: '#e63946',
                  fontFamily: 'serif',
                  lineHeight: 1,
                  opacity: 0.8
                }}>
                  ”
                </div>

                {/* Rating stars */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={14} color="#ffd700" fill="#ffd700" />
                  ))}
                </div>

                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{t.comment}"
                </p>

                {/* Profile info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <div style={{ width: '12px', height: '4px', backgroundColor: '#e63946', borderRadius: '2px' }} />
            <div style={{ width: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
            <div style={{ width: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
            <div style={{ width: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
          </div>

        </div>
      </section>

      {/* 8. Call to Action Banner (HUNGRY? LET'S EAT!) */}
      <section style={{
        position: 'relative',
        padding: '100px 40px',
        backgroundImage: 'url(/cta_banner_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {/* Overlay Dark background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(41, 44, 48, 0.85)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '4px' }}>HUNGRY?</span>
          <h2 style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 950, color: '#ffd700', lineHeight: 1 }}>LET'S EAT!</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <a href={`${denUrl}/`} style={{
              backgroundColor: '#e63946',
              color: '#fff',
              padding: '16px 36px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(230,57,70,0.3)'
            }}>
              ORDER ONLINE NOW <ArrowRight size={16} />
            </a>
            <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              🚀 FAST DELIVERY TO YOUR DOOR
            </span>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer id="contact" style={{
        backgroundColor: '#15171a',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 40px 40px 40px',
        color: '#9ca3af'
      }}>
        <div className="responsive-footer-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          
          {/* Col 1: Logo & text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/tdg-logo.png" alt="TDG" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.src = '/favicon.svg' }} />
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '280px' }}>
              Serving authentic gyros made with love and the freshest ingredients.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>QUICK LINKS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href="#hero" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
              <a href="#menu" style={{ color: '#9ca3af', textDecoration: 'none' }}>Menu</a>
              <a href="#about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About Us</a>
              <a href="#testimonials" style={{ color: '#9ca3af', textDecoration: 'none' }}>Reviews</a>
              <a href="/app.apk" download style={{ color: '#ffd700', textDecoration: 'none', fontWeight: 600 }}>Download Android App 📱</a>
            </div>
          </div>

          {/* Col 3: Our Menu categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>OUR MENU</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href={`${denUrl}/`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Gyros</a>
              <a href={`${denUrl}/`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Wraps</a>
              <a href={`${denUrl}/`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Crispy Bites</a>
              <a href={`${denUrl}/`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Desserts</a>
            </div>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>CONTACT INFO</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={14} color="#ffd700" />
                <span>Shop 1 & 2, Kottakuppam, Viluppuram</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={14} color="#ffd700" />
                <span>(123) 456-7890</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={14} color="#ffd700" />
                <span>info@tendengyros.com</span>
              </div>
            </div>

            {/* Newsletter input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>NEWSLETTER</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '8px 14px',
                    fontSize: '12px',
                    flex: 1,
                    borderRadius: '4px'
                  }}
                />
                <button style={{
                  backgroundColor: '#ffd700',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '40px auto 0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px', 
          fontSize: '12px' 
        }}>
          <span>© {new Date().getFullYear()} Ten Den Gyros (TDG). All Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms & Conditions</span>
          </div>
        </div>
      </footer>

      {/* 10. Floating Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.1, boxShadow: '0 0 15px rgba(255,215,0,0.5)' }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 100,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#ffd700',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.3), 0 8px 20px rgba(0,0,0,0.5)'
          }}
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  )
}

function ChooseYourOwnGyroSection({ denUrl }) {
  const [step, setStep] = useState(0)
  const [selectedProtein, setSelectedProtein] = useState('Chicken')
  const [selectedBread, setSelectedBread] = useState('Baked')
  const [selectedSpread, setSelectedSpread] = useState('Tzatziki')
  const [selectedSauces, setSelectedSauces] = useState(['Garlic Mayo'])
  const [selectedVeggies, setSelectedVeggies] = useState(['Lettuce', 'Onion', 'Tomato'])

  const proteins = ['Chicken', 'Paneer']
  const breads = ['Baked', 'Fried']
  const spreads = ['Hummus', 'Cheese', 'Tzatziki', 'Ricota']
  const sauces = ['Turkish Chill', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard']
  const veggies = ['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans']

  const handleToggleSauce = (sauce) => {
    if (selectedSauces.includes(sauce)) {
      setSelectedSauces(selectedSauces.filter(s => s !== sauce))
    } else {
      setSelectedSauces([...selectedSauces, sauce])
    }
  }

  const handleToggleVeggie = (veg) => {
    if (selectedVeggies.includes(veg)) {
      setSelectedVeggies(selectedVeggies.filter(v => v !== veg))
    } else {
      setSelectedVeggies([...selectedVeggies, veg])
    }
  }

  const stepTitles = [
    'Start with your Protein',
    'Choose Your Bread',
    'Choose Your Spread',
    'Choose Your Sauces',
    'Choose Your Veggies'
  ]

  // Image helpers
  const getProteinImage = (p) => p === 'Chicken' ? '/crispy_chicken.png' : '/timeline_2009.png'
  const getBreadImage = (b) => b === 'Baked' ? '/hero_gyro_wrap.png' : '/hero_greek_gyro.png'
  const getSpreadImage = (s) => {
    if (s === 'Hummus') return '/hummus.png'
    if (s === 'Cheese') return '/cheese.png'
    if (s === 'Tzatziki') return '/tzatziki.png'
    return '/ricotta.png'
  }
  const getSauceImage = (s) => '/sauces_composite.jpg'
  const getVeggieImage = (v) => '/veggies_composite.jpg'

  return (
    <section style={{ padding: '80px 40px', backgroundColor: '#1a1c1e', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '13px', color: '#ffd700', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Build Your Ultimate Wrap</span>
          <h2 style={{ fontSize: '32px', fontWeight: 950, letterSpacing: '1px', textTransform: 'uppercase', color: '#fff', marginTop: '8px' }}>
            CREATE YOUR OWN GYRO
          </h2>
          <div style={{ width: '60px', height: '2.5px', backgroundColor: '#e63946', margin: '12px auto 0 auto' }} />
        </div>

        {/* Step Indicator Header bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          {stepTitles.map((title, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                onClick={() => setStep(idx)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: step === idx ? '#e63946' : idx < step ? '#10b981' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {idx + 1}
              </div>
              {idx < stepTitles.length - 1 && (
                <div style={{ width: '60px', height: '2px', backgroundColor: idx < step ? '#10b981' : 'rgba(255,255,255,0.05)' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Active step contents wrapper */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffd700', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              {stepTitles[step]}
            </h3>

            {/* Step 0: Protein selection (Images) */}
            {step === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {proteins.map(p => (
                  <div
                    key={p}
                    onClick={() => setSelectedProtein(p)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedProtein === p ? '#e63946' : 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      transform: selectedProtein === p ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.3s',
                      boxShadow: selectedProtein === p ? '0 10px 25px rgba(230,57,70,0.25)' : 'none'
                    }}
                  >
                    <div style={{ height: '180px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                      <img src={getProteinImage(p)} alt={p} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }} />
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', background: selectedProtein === p ? 'rgba(230,57,70,0.1)' : 'transparent' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{p === 'Chicken' ? '🍖 Chicken' : '🧀 Paneer (Veg)'}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Bread selection (Images) */}
            {step === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {breads.map(b => (
                  <div
                    key={b}
                    onClick={() => setSelectedBread(b)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedBread === b ? '#ffd700' : 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      transform: selectedBread === b ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.3s',
                      boxShadow: selectedBread === b ? '0 10px 25px rgba(255,215,0,0.15)' : 'none'
                    }}
                  >
                    <div style={{ height: '180px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                      <img src={getBreadImage(b)} alt={b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', background: selectedBread === b ? 'rgba(255,215,0,0.1)' : 'transparent' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{b} Bread</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Spread selection */}
            {step === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {spreads.map(s => (
                  <div
                    key={s}
                    onClick={() => setSelectedSpread(s)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedSpread === s ? '#ffd700' : 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      transform: selectedSpread === s ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.3s',
                      boxShadow: selectedSpread === s ? '0 10px 25px rgba(255,215,0,0.15)' : 'none'
                    }}
                  >
                    <div style={{ height: '160px', width: '100%', overflow: 'hidden', background: '#202225' }}>
                      <img src={getSpreadImage(s)} alt={s} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', background: selectedSpread === s ? 'rgba(255,215,0,0.1)' : 'transparent' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{s}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Sauces selection */}
            {step === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {sauces.map(s => {
                  const isSelected = selectedSauces.includes(s)
                  // Calculate crop position on 3x2 composite image
                  let position = 'center';
                  if (s.toLowerCase().includes('turkish')) position = '0% 0%';
                  if (s.toLowerCase().includes('jalapeno cheese')) position = '50% 0%';
                  if (s.toLowerCase().includes('garlic')) position = '100% 0%';
                  if (s.toLowerCase().includes('spicy')) position = '0% 100%';
                  if (s.toLowerCase().includes('peri')) position = '50% 100%';
                  if (s.toLowerCase().includes('honey')) position = '100% 100%';

                  return (
                    <div
                      key={s}
                      onClick={() => handleToggleSauce(s)}
                      style={{
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? '#e63946' : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.3s',
                        boxShadow: isSelected ? '0 10px 25px rgba(230,57,70,0.15)' : 'none'
                      }}
                    >
                      <div style={{ height: '140px', width: '100%', overflow: 'hidden', background: '#fff' }}>
                        <img 
                          src={getSauceImage(s)} 
                          alt={s} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            objectPosition: position
                          }} 
                        />
                      </div>
                      <div style={{ padding: '16px', textAlign: 'center', background: isSelected ? 'rgba(230,57,70,0.1)' : 'transparent' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{s}</h4>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Step 4: Veggies selection */}
            {step === 4 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                {veggies.map(v => {
                  const isSelected = selectedVeggies.includes(v)
                  // Calculate crop position on 4x2 composite image
                  let position = 'center';
                  if (v.toLowerCase().includes('lettuce')) position = '0% 0%';
                  if (v.toLowerCase().includes('onion')) position = '33.3% 0%';
                  if (v.toLowerCase().includes('jalapeno')) position = '66.6% 0%';
                  if (v.toLowerCase().includes('olive')) position = '100% 0%';
                  if (v.toLowerCase().includes('capsicum')) position = '0% 100%';
                  if (v.toLowerCase().includes('tomato')) position = '33.3% 100%';
                  if (v.toLowerCase().includes('cucumber')) position = '66.6% 100%';
                  if (v.toLowerCase().includes('bean')) position = '100% 100%';

                  return (
                    <div
                      key={v}
                      onClick={() => handleToggleVeggie(v)}
                      style={{
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.3s',
                        boxShadow: isSelected ? '0 10px 25px rgba(16,185,129,0.15)' : 'none'
                      }}
                    >
                      <div style={{ height: '130px', width: '100%', overflow: 'hidden', background: '#fff' }}>
                        <img 
                          src={getVeggieImage(v)} 
                          alt={v} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            objectPosition: position
                          }} 
                        />
                      </div>
                      <div style={{ padding: '16px', textAlign: 'center', background: isSelected ? 'rgba(16,185,129,0.1)' : 'transparent' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{v}</h4>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stepper Actions & Final Summary Panel */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
              <button 
                onClick={() => setStep(prev => Math.max(0, prev - 1))}
                disabled={step === 0}
                style={{
                  padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent', color: step === 0 ? '#6b7280' : '#fff', fontWeight: 700,
                  cursor: step === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Back
              </button>
              
              {step < stepTitles.length - 1 ? (
                <button 
                  onClick={() => setStep(prev => prev + 1)}
                  style={{
                    padding: '12px 28px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#e63946', color: '#fff', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Next Stage →
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Summary Box */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '20px 24px',
              borderRadius: '12px',
              border: '1.5px solid rgba(255,215,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '8px', textTransform: 'uppercase' }}>Custom Gyro Summary</h4>
                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.6 }}>
                  <strong>Protein:</strong> {selectedProtein} &nbsp;|&nbsp;&nbsp;
                  <strong>Bread:</strong> {selectedBread} Bread &nbsp;|&nbsp;&nbsp;
                  <strong>Spread:</strong> {selectedSpread} &nbsp;|&nbsp;&nbsp;
                  <strong>Sauces:</strong> {selectedSauces.length ? selectedSauces.join(', ') : 'None'} &nbsp;|&nbsp;&nbsp;
                  <strong>Veggies:</strong> {selectedVeggies.length ? selectedVeggies.join(', ') : 'None'}
                </p>
              </div>
              
              <button 
                onClick={() => {
                  alert('Custom Gyro Wrap added to order successfully!');
                  setStep(0);
                  setSelectedProtein('Chicken');
                  setSelectedBread('Baked');
                  setSelectedSpread('Tzatziki');
                  setSelectedSauces(['Garlic Mayo']);
                  setSelectedVeggies(['Lettuce', 'Onion', 'Tomato']);
                }} 
                style={{
                  backgroundColor: '#ffd700',
                  color: '#000',
                  padding: '14px 28px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 900,
                  border: 'none',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '8px'
                }}
              >
                ADD TO CART & DONE (₹199) <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
