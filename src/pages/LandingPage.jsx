import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  Clock, 
  MapPin, 
  ArrowRight, 
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
  X,
  FileText,
  Download,
  Eye,
  Check,
  ShieldCheck,
  Percent,
  Plus
} from 'lucide-react'
import { useMenuStore } from '../stores/menuStore'

export default function LandingPage() {
  const { menuItems, fetchMenuItems } = useMenuStore()
  const [customer, setCustomer] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [activeMenuPage, setActiveMenuPage] = useState(1)
  const [selectedSweetTab, setSelectedSweetTab] = useState('shakes')
  const [builderStep, setBuilderStep] = useState(1)

  useEffect(() => {
    fetchMenuItems()
    const savedCustomer = localStorage.getItem('customer_user')
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer))
      } catch (e) {}
    }
  }, [])

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

  const denUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://den.tendengyros.com'

  const orderLink = denUrl ? `${denUrl}/` : '/order'
  const customizerLink = '/customizer'

  // Card styles
  const cardStyle = {
    backgroundColor: '#34393e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.08), inset -1px -1px 0px rgba(0,0,0,0.5), 0 10px 24px rgba(0,0,0,0.35)',
    borderRadius: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  // Section 4: 8 Gyros Lineup
  const gyroLineup = [
    {
      id: 'sig-gyro',
      name: 'Signature Gyro',
      badge: 'Must Try',
      price: '₹199',
      cardCopy: 'The one with our name on it. Start here.',
      image: '/images/drive/GYROS.png',
      popular: true
    },
    {
      id: 'creamy-gyro',
      name: 'Creamy Gyro',
      badge: 'Must Try',
      price: '₹199',
      cardCopy: 'Smooth, rich and easy to love.',
      image: '/hero_greek_gyro.png',
      popular: true
    },
    {
      id: 'spicy-gyro',
      name: 'Spicy Gyro',
      badge: 'Hot Pick',
      price: '₹199',
      cardCopy: 'For people who ask for more heat.',
      image: '/hero_gyro_wrap.png'
    },
    {
      id: 'bbq-gyro',
      name: 'BBQ Gyro',
      badge: 'Smoky',
      price: '₹199',
      cardCopy: 'Smoky-sweet BBQ in baked or fried bread.',
      image: '/hero_gyro.png'
    },
    {
      id: 'greek-gyro',
      name: 'Greek Gyro',
      badge: 'Authentic',
      price: '₹299',
      cardCopy: 'The Greek-style gyro, built big.',
      image: '/hero_greek_gyro.png'
    },
    {
      id: 'gyro-italiano',
      name: 'Gyro Italiano',
      badge: 'Fusion',
      price: '₹299',
      cardCopy: 'A gyro with an Italian accent.',
      image: '/crispy_chicken.png'
    },
    {
      id: 'nuggets-gyro',
      name: 'Chicken Nuggets Gyro',
      badge: 'Crispy',
      price: '₹79',
      cardCopy: 'Crispy nuggets, wrapped up. A small order with a big appetite.',
      image: '/images/menu/sides_chicken_nuggets.png'
    },
    {
      id: 'falafel-gyro',
      name: 'Falafel Gyro',
      badge: 'Vegetarian',
      price: '₹69',
      cardCopy: 'Falafel in a gyro. Simple and satisfying.',
      image: '/images/menu/sides_falafel.png'
    }
  ]

  // Section 8: Meals Made to Share (9 deals)
  const mealDeals = [
    {
      name: 'Gyro & Fries',
      price: '₹249',
      desc: "1 Gyro + Fries",
      tag: 'Solo Deal',
      image: '/images/drive/Fries.png'
    },
    {
      name: 'Lebanese Rice Bowl Meal',
      price: '₹299',
      desc: "1 Lebanese Rice Bowl + 2 Wings + 1 Beverage",
      tag: 'Flavor Rich',
      image: '/images/drive/Rice Bowl.png'
    },
    {
      name: 'Gyro Meal',
      price: '₹329',
      desc: "1 Gyro + 2 Strips + Fries + 1 Pepsi",
      tag: 'Popular',
      image: '/images/drive/GYROS.png'
    },
    {
      name: '13 Pc Mixed Chicken',
      price: '₹379',
      desc: "8 Wings + 5 Strips + 4 Dips",
      tag: 'Crispy Party',
      image: '/images/drive/WINGS-01.jpg'
    },
    {
      name: '12 Pc Strips Bucket',
      price: '₹399',
      desc: "12 Strips + 3 Dips",
      tag: 'Tender Strips',
      image: '/images/drive/STRIPS-01.jpg'
    },
    {
      name: 'Peri Peri Leg Bucket',
      price: '₹549',
      desc: "8 Pc Peri Peri Leg + 3 Dips",
      tag: 'Fiery Feast',
      image: '/images/menu/Leg& Thigh.png'
    },
    {
      name: 'Ultimate Savings Bucket',
      price: '₹599',
      desc: "4 Leg + 6 Wings + 4 Strips + 4 Dips + 500 ml Coke/Sprite",
      tag: 'Best Value',
      image: '/images/menu/mega feast meal.png'
    },
    {
      name: 'Double Gyro Feast',
      price: '₹649',
      desc: "2 Gyros + 6 Wings + Fries + 2 Drinks + 2 Dips",
      tag: 'Duo Special',
      image: '/images/menu/duo gyro feast.png'
    },
    {
      name: 'Mixed Feast',
      price: '₹749',
      desc: "2 Gyros + 2 Leg + 2 Strips + 4 Wings + Fries + 500 ml Coke/Sprite + 3 Dips",
      tag: 'Grand Table Feast',
      image: '/images/menu/double crunch box.png'
    }
  ]

  // Section 9: Protein Max
  const proteinMaxItems = [
    {
      title: 'Gyro Format',
      price: '₹299',
      desc: 'Loaded high-protein gyro wrap with extra meat or cottage cheese.',
      protein: 'Chicken or Paneer',
      image: '/images/drive/GYROS.png'
    },
    {
      title: 'Rice Bowl Format',
      price: '₹299',
      desc: 'Herb-infused Mediterranean rice base piled with high protein cuts.',
      protein: 'Chicken or Paneer',
      image: '/images/drive/Rice Bowl.png'
    },
    {
      title: 'Salad Format',
      price: '₹299',
      desc: 'Crisp hand-torn greens, kalamata olives, cucumber & clean protein.',
      protein: 'Chicken or Paneer',
      image: '/images/drive/Signature Salad.png'
    }
  ]

  // Section 10: Sweet and Refreshing
  const shakesList = [
    { name: 'Vanilla Shake', sub: 'Ask for white chocolate', price: 'Reg ₹120 / Lrg ₹199', badge: '', image: '/images/drive/Vanilla.png' },
    { name: 'Strawberry Shake', sub: 'Real berries & cream', price: 'Reg ₹120 / Lrg ₹199', badge: 'Must Try', image: '/images/drive/Strawberry.png' },
    { name: 'Biscoff Shake', sub: 'Lotus crunch & caramel', price: 'Reg ₹120 / Lrg ₹199', badge: 'Bestseller', image: '/images/drive/Biscoff.png' },
    { name: 'Chocolate Shake', sub: 'Dark & Dutch cocoa blend', price: 'Reg ₹120 / Lrg ₹199', badge: '', image: '/images/drive/Chocolate.png' },
    { name: 'Kunafa Pistachio Shake', sub: 'Roasted kunafa & pistachio cream', price: 'Reg ₹120 / Lrg ₹199', badge: 'Signature', image: '/images/drive/Kunafa Pistachio.png' }
  ]

  const dessertsList = [
    { name: 'Chocolate Brownie', sub: 'Fudgy, warm & rich chocolate', price: '₹99', badge: 'Must Try', image: '/images/drive/Chocolate Brownie.png' },
    { name: 'Blondie Cake', sub: 'Brown butter golden vanilla cake', price: '₹99', badge: 'Signature', image: '/images/drive/Blondie Cake.png' },
    { name: 'Vanilla Softy', sub: 'Silky smooth whipped soft serve', price: '₹39', badge: 'Sweet Classic', image: '/images/drive/Vanilla Softy.png' }
  ]

  const beveragesList = [
    { name: 'Coca-Cola', sub: 'Chilled bottle / can', price: '₹49', badge: 'Chilled' },
    { name: 'Sprite', sub: 'Crisp refreshing lemon-lime', price: '₹49', badge: 'Chilled' },
    { name: 'Ice Tea (Peach)', sub: 'Brewed with peach extracts', price: 'Reg ₹59 / Lrg ₹99', badge: 'Refreshing', image: '/images/drive/Ice Tea.png' },
    { name: 'Ice Tea (Lime)', sub: 'Tangy citrus crush iced tea', price: 'Reg ₹59 / Lrg ₹99', badge: 'Refreshing', image: '/images/menu/ice tea - lime.png' }
  ]

  const kombuchaList = [
    { name: 'Mint Kombucha', sub: 'Probiotic crisp coolness', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Hibiscus Kombucha', sub: 'Ruby floral berry notes', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Elixir Kombucha', sub: 'The original fermented brew', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Ginger Kombucha', sub: 'Warm zingy digestive kick', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Turmeric Kombucha', sub: 'Golden healing botanicals', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Rose Kombucha', sub: 'Fragrant aromatic petals', price: '₹120', image: '/images/drive/KOMBUCHA.png' },
    { name: 'Butterfly Pea Kombucha', sub: 'Natural indigo super-brew', price: '₹120', image: '/images/drive/KOMBUCHA.png' }
  ]

  return (
    <div style={{ 
      backgroundColor: '#292c30', 
      color: '#ffffff', 
      minHeight: '100vh', 
      fontFamily: "'Lexend Deca', sans-serif",
      overflowX: 'hidden'
    }}>
      <style>{`
        /* Responsive Grid Utilities */
        .desktop-nav { display: flex; }
        .desktop-actions { display: flex; align-items: center; gap: 16px; }
        .mobile-menu-btn { display: none; background: transparent; border: none; color: white; cursor: pointer; align-items: center; justify-content: center; }
        
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }

        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-5 { grid-template-columns: repeat(3, 1fr) !important; }
          .grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .grid-4 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-5 { grid-template-columns: repeat(2, 1fr) !important; }
          header { padding: 12px 18px !important; }
          section { padding: 48px 18px !important; }
          .hero-layout { flex-direction: column !important; text-align: center !important; }
          .hero-badges-col { justify-content: center !important; }
          .hero-actions { justify-content: center !important; }
        }

        /* Hover animations */
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.5) !important;
          border-color: rgba(255, 215, 0, 0.4) !important;
        }

        .gold-glow:hover {
          text-shadow: 0 0 12px rgba(255, 215, 0, 0.85);
          color: #ffd700 !important;
        }
      `}</style>

      {/* =========================================================
          SECTION 1 – ANNOUNCEMENT BAR
          ========================================================= */}
      <div style={{
        background: 'linear-gradient(90deg, #b91c1c, #e63946, #b91c1c)',
        color: '#ffffff',
        padding: '9px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 110,
        position: 'relative'
      }}>
        <Flame size={15} color="#ffd700" />
        <span>Baked or fried bread. Your sauce. Your gyro. Order now.</span>
        <a 
          href={orderLink} 
          style={{
            marginLeft: '8px',
            color: '#ffd700',
            textDecoration: 'underline',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          ORDER NOW <ArrowRight size={13} />
        </a>
      </div>

      {/* =========================================================
          SECTION 2 – NAVIGATION
          Home · Menu · Gyros · Meal Deals · Our Story · Find Us · [Order Now]
          ========================================================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(41, 44, 48, 0.96)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '6px 14px'
          }}>
            <img 
              src="/tdg-logo.png" 
              alt="TDG - Ten Dens Gyros" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/favicon.svg' }}
            />
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="desktop-nav" style={{ gap: '26px', alignItems: 'center' }}>
          <a href="#hero" className="gold-glow" style={{ color: '#ffd700', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px' }}>
            HOME
          </a>
          <button 
            onClick={() => setShowMenuModal(true)} 
            className="gold-glow" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px', padding: 0 }}
          >
            MENU
          </button>
          <a href="#gyros" className="gold-glow" style={{ color: '#fff', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px' }}>
            GYROS
          </a>
          <a href="#meal-deals" className="gold-glow" style={{ color: '#fff', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px' }}>
            MEAL DEALS
          </a>
          <a href="#our-story" className="gold-glow" style={{ color: '#fff', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px' }}>
            OUR STORY
          </a>
          <a href="#find-us" className="gold-glow" style={{ color: '#fff', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, letterSpacing: '1px' }}>
            FIND US
          </a>
        </nav>

        {/* Action Button */}
        <div className="desktop-actions">
          <a href={orderLink} style={{
            backgroundColor: '#e63946',
            color: '#fff',
            padding: '10px 22px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(230, 57, 70, 0.4)',
            transition: 'all 0.2s'
          }}>
            ORDER NOW <ArrowRight size={14} />
          </a>
          
          {customer && (
            <a href={orderLink} style={{
              color: '#ffd700',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              padding: '7px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 215, 0, 0.08)'
            }}>
              <User size={13} /> MY DEN (🪙{customer.points || 0})
            </a>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: '#1e2124',
              borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 99
            }}
          >
            <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffd700', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>HOME</a>
            <button onClick={() => { setIsMobileMenuOpen(false); setShowMenuModal(true); }} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: '15px', padding: 0 }}>MENU</button>
            <a href="#gyros" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>GYROS</a>
            <a href="#meal-deals" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>MEAL DEALS</a>
            <a href="#our-story" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>OUR STORY</a>
            <a href="#find-us" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>FIND US</a>
            <a href={orderLink} onClick={() => setIsMobileMenuOpen(false)} style={{ background: '#e63946', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', marginTop: '8px' }}>
              ORDER NOW →
            </a>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =========================================================
          SECTION 3 – HERO
          Headline (H1): Baked Greek Gyros. Built Your Way.
          Subheadline: Choose your bread, your spread, your sauce and your veggies. Chicken or paneer. Signature gyros from ₹199.
          Primary CTA: Order Your Gyro 
          Secondary CTA: Explore the Menu
          Trust line: 8 gyros · 5 sauces · baked or fried bread
          ========================================================= */}
      <section id="hero" style={{
        position: 'relative',
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div className="hero-layout" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px'
        }}>
          {/* Left Column: Headlines & CTAs */}
          <div style={{ flex: '1.1', maxWidth: '640px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '30px',
              background: 'rgba(230, 57, 70, 0.15)',
              border: '1px solid rgba(230, 57, 70, 0.3)',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: '18px'
            }}>
              <Flame size={14} /> AUTHENTIC GREEK STREET FOOD
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: '#ffffff',
              marginBottom: '18px'
            }}>
              Baked Greek Gyros.<br />
              <span style={{
                background: 'linear-gradient(90deg, #ffd700, #ff9f1c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Built Your Way.
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '28px',
              fontWeight: 400
            }}>
              Choose your bread, your spread, your sauce and your veggies. Chicken or paneer. Signature gyros from ₹199.
            </p>

            {/* CTAs */}
            <div className="hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={orderLink} style={{
                backgroundColor: '#e63946',
                color: '#ffffff',
                padding: '15px 32px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(230, 57, 70, 0.45)',
                transition: 'all 0.2s'
              }}>
                Order Your Gyro <ArrowRight size={17} />
              </a>

              <button 
                onClick={() => setShowMenuModal(true)} 
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  padding: '15px 28px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                Explore the Menu
              </button>
            </div>

            {/* Trust Line */}
            <div style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <Check size={16} color="#10b981" />
              <span>8 gyros · 5 sauces · baked or fried bread</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div style={{ flex: '0.9', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px'
            }}>
              {/* Glow backdrop */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(230, 57, 70, 0.28) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 0
              }} />

              {/* Main Wrap Image */}
              <motion.img 
                src="/images/drive/GYROS.png" 
                alt="TDG Signature Gyro" 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  width: '100%',
                  height: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.65))'
                }}
                onError={(e) => { e.target.src = '/hero_gyro_wrap.png' }}
              />

              {/* Floating Badge 1: Baked or Fried */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  position: 'absolute',
                  top: '10%',
                  right: '-10px',
                  background: 'rgba(30, 33, 36, 0.95)',
                  border: '1.5px solid #ffd700',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Flame size={18} color="#ffd700" />
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>CHOICE OF BREAD</div>
                  <div style={{ fontSize: '12.5px', color: '#ffffff', fontWeight: 800 }}>Baked or Fried</div>
                </div>
              </motion.div>

              {/* Floating Badge 2: Starting at ₹199 */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '-10px',
                  background: 'rgba(30, 33, 36, 0.95)',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Award size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>SIGNATURE RANGE</div>
                  <div style={{ fontSize: '12.5px', color: '#ffffff', fontWeight: 800 }}>From ₹199</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 4 – SIGNATURE GYROS (The Gyro Lineup)
          Heading: The Gyro Lineup 
          Intro: Eight gyros, one idea: you choose the build. Start with a TDG favourite or make your own.
          Cards: 8 gyros with Price, Card Copy, Card CTA
          Section CTA: See All Gyros
          ========================================================= */}
      <section id="gyros" style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            MEET THE HEROES
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            The Gyro Lineup
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Eight gyros, one idea: you choose the build. Start with a TDG favourite or make your own.
          </p>
        </div>

        <div className="grid-4">
          {gyroLineup.map((gyro) => (
            <div 
              key={gyro.id} 
              className="hover-lift"
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Image with Badge */}
              <div style={{
                position: 'relative',
                height: '190px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}>
                <img 
                  src={gyro.image} 
                  alt={gyro.name} 
                  style={{
                    maxHeight: '160px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                  }}
                  onError={(e) => { e.target.src = '/hero_gyro.png' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: gyro.popular ? '#e63946' : 'rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.5px'
                }}>
                  {gyro.badge}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>{gyro.name}</h3>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>{gyro.price}</span>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1, marginBottom: '18px' }}>
                  {gyro.cardCopy}
                </p>

                <a 
                  href={orderLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(230, 57, 70, 0.15)',
                    border: '1px solid rgba(230, 57, 70, 0.4)',
                    color: '#f87171',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Order This Gyro <ArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Section CTA */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => setShowMenuModal(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255, 215, 0, 0.4)',
              background: 'rgba(255, 215, 0, 0.06)',
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            See All Gyros <ArrowRight size={15} />
          </button>
        </div>
      </section>


      {/* =========================================================
          SECTION 5 – WHY TDG?
          Heading: Why People Build Their Gyro at TDG ?
          Two breads. Baked or fried. Same gyro, different bite.
          Two spreads. Cheese or Tzatziki.
          Five sauces. Turkish Chilli, Jalapeno Cheese, Garlic Mayo, Spicy Mayo, Honey Mustard.
          Seven veggies. Lettuce, onions, jalapenos, olives, bell peppers, tomatoes and cucumbers.
          Chicken or paneer. Pick your protein.
          A menu that goes all the way. Gyros from ₹69, meal deals, buckets and a feast for the whole table.
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            THE TDG DIFFERENCE
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            Why People Build Their Gyro at TDG ?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Every ingredient is selected for maximum freshness, crunch, and Mediterranean punch.
          </p>
        </div>

        <div className="grid-3">
          {/* Pillar 1: Two Breads */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <img src="/images/drive/Baked.png" alt="Bread" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 1</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Two Breads</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Baked or fried.</strong> Same gyro, different bite. Soft oven-baked warmth or golden, crunchy indulgence.
            </p>
          </div>

          {/* Pillar 2: Two Spreads */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <img src="/images/drive/Tzatziki.png" alt="Spread" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 2</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Two Spreads</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Cheese or Tzatziki.</strong> Creamy rich melted cheese spread or authentic Greek chilled cucumber garlic yogurt.
            </p>
          </div>

          {/* Pillar 3: Five Sauces */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <img src="/images/drive/Turkish Chilli.png" alt="Sauces" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 3</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Five Sauces</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Turkish Chilli, Jalapeno Cheese, Garlic Mayo, Spicy Mayo, Honey Mustard.</strong> From mild & sweet to fiery hot.
            </p>
          </div>

          {/* Pillar 4: Seven Veggies */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <img src="/lettuce.png" alt="Veggies" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 4</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Seven Veggies</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Lettuce, onions, jalapenos, olives, bell peppers, tomatoes and cucumbers.</strong> Crisp and fresh every morning.
            </p>
          </div>

          {/* Pillar 5: Chicken or Paneer */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <img src="/crispy_chicken.png" alt="Protein" style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 5</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Chicken or Paneer</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Pick your protein.</strong> Tender flame-seared chicken or fresh spiced grilled paneer for vegetarians.
            </p>
          </div>

          {/* Pillar 6: Complete Menu */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <ShoppingBag size={34} color="#ffd700" />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>VALUE</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>All The Way</h3>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <strong>Gyros from ₹69,</strong> meal deals, chicken buckets and a feast for the whole table. Quality without compromise.
            </p>
          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 6 – BUILD YOUR OWN GYRO
          Heading: Build It Your Way 
          Intro: Five choices stand between you and your perfect gyro.
          Steps: 1. Bread, 2. Spread, 3. Sauce, 4. Veggies, 5. Protein
          CTA: Start Building
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            INTERACTIVE BUILDER
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            Build It Your Way
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Five choices stand between you and your perfect gyro.
          </p>
        </div>

        {/* 5-Step Visual Progression */}
        <div style={{
          ...cardStyle,
          padding: '32px',
          background: 'linear-gradient(135deg, #2f3439, #24272b)',
          marginBottom: '32px'
        }}>
          <div className="grid-5" style={{ textAlign: 'center' }}>
            {/* Step 1 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '20px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffd700', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>1</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>BREAD</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Baked or Fried</p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '20px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffd700', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>2</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>SPREAD</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Cheese or Tzatziki</p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '20px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffd700', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>3</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>SAUCE</h4>
              <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>Turkish Chilli · Jalapeno Cheese · Garlic Mayo · Spicy Mayo · Honey Mustard</p>
            </div>

            {/* Step 4 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '20px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffd700', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>4</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>VEGGIES</h4>
              <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>Lettuce · Onions · Jalapenos · Olives · Bell Peppers · Tomatoes · Cucumbers</p>
            </div>

            {/* Step 5 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '20px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffd700', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>5</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>PROTEIN</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Chicken or Paneer</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            to={customizerLink}
            style={{
              padding: '16px 36px',
              borderRadius: '10px',
              backgroundColor: '#e63946',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(230, 57, 70, 0.45)'
            }}
          >
            <Sparkles size={18} /> Start Building <ArrowRight size={16} />
          </Link>
        </div>
      </section>


      {/* =========================================================
          SECTION 7 – BEYOND GYROS
          Heading: More From the TDG Menu
          Intro: Once the gyro is sorted, there is plenty more.
          Items: Signature Rice Bowl, Signature Salad, Loaded Fries, Fried Chicken, Sides
          CTA: See the Full Menu
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            VARIETY FOR EVERY TASTE
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            More From the TDG Menu
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Once the gyro is sorted, there is plenty more.
          </p>
        </div>

        <div className="grid-3">
          {/* Signature Rice Bowl */}
          <div className="hover-lift" style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px' }}>
              <img src="/images/drive/Rice Bowl.png" alt="Signature Rice Bowl" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Signature Rice Bowl</h3>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>₹199</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                Our Signature rice bowl, with a Chicken or Paneer choice.
              </p>
            </div>
          </div>

          {/* Signature Salad */}
          <div className="hover-lift" style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px' }}>
              <img src="/images/drive/Signature Salad.png" alt="Signature Salad" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Signature Salad</h3>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>₹149</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                A bowl of greens with your choice of Chicken or Paneer.
              </p>
            </div>
          </div>

          {/* Loaded Fries */}
          <div className="hover-lift" style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px' }}>
              <img src="/images/drive/Loaded.png" alt="Loaded Fries" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Loaded Fries</h3>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>₹199</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                Fries piled with Chicken or Paneer.
              </p>
            </div>
          </div>
        </div>

        {/* Second Row: Fried Chicken & Sides */}
        <div className="grid-2" style={{ marginTop: '24px' }}>
          {/* Fried Chicken Range */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img src="/images/drive/WINGS-01.jpg" alt="Fried Chicken" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Fried Chicken</h3>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffd700' }}>From ₹70</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.5 }}>
                Leg or thigh from ₹70, wings from ₹90, strips from ₹120. Golden crisp on the outside, tender & juicy inside.
              </p>
            </div>
          </div>

          {/* Sides Range */}
          <div className="hover-lift" style={{ ...cardStyle, padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img src="/images/drive/Fries.png" alt="Sides" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Sides</h3>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffd700' }}>From ₹49</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.5 }}>
                Nuggets, halloumi nuggets, mozzarella sticks, falafel and hash browns, from ₹49.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => setShowMenuModal(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255, 215, 0, 0.4)',
              background: 'rgba(255, 215, 0, 0.06)',
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            See the Full Menu <ArrowRight size={15} />
          </button>
        </div>
      </section>


      {/* =========================================================
          SECTION 8 – MEALS MADE TO SHARE
          Heading: Meals Made to Share 
          Intro: One gyro, a full meal, or a table-sized feast. Pick your size.
          Deals: 9 meals/combos/buckets
          CTA: Order This Meal · See All Meal Deals
          ========================================================= */}
      <section id="meal-deals" style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            COMBOS, BOXES & BUCKETS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            Meals Made to Share
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            One gyro, a full meal, or a table-sized feast. Pick your size.
          </p>
        </div>

        <div className="grid-3">
          {mealDeals.map((deal, idx) => (
            <div 
              key={idx}
              className="hover-lift"
              style={{
                ...cardStyle,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                position: 'relative',
                height: '170px',
                background: 'rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px'
              }}>
                <img 
                  src={deal.image} 
                  alt={deal.name} 
                  style={{ maxHeight: '145px', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = '/hero_wide_gyro.png' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(230, 57, 70, 0.85)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '12px'
                }}>
                  {deal.tag}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#fff' }}>{deal.name}</h3>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>{deal.price}</span>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1, marginBottom: '18px' }}>
                  {deal.desc}
                </p>

                <a 
                  href={orderLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    color: '#ffd700',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}
                >
                  Order This Meal <ArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => setShowMenuModal(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255, 215, 0, 0.4)',
              background: 'rgba(255, 215, 0, 0.06)',
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            See All Meal Deals <ArrowRight size={15} />
          </button>
        </div>
      </section>


      {/* =========================================================
          SECTION 9 – PROTEIN MAX
          Heading: Protein Max 
          Intro: Gyro, Rice Bowl or Salad. Pick your format, then pick your protein.
          Cards: Gyro (₹299), Rice Bowl (₹299), Salad (₹299)
          CTA: Order Protein Max
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            HIGH PROTEIN FUEL
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            Protein Max
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Gyro, Rice Bowl or Salad. Pick your format, then pick your protein.
          </p>
        </div>

        <div className="grid-3">
          {proteinMaxItems.map((item, idx) => (
            <div 
              key={idx}
              className="hover-lift"
              style={{
                ...cardStyle,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', padding: '16px' }}>
                <img src={item.image} alt={item.title} style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>

              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{item.title}</h3>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>{item.price}</span>
                </div>

                <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', width: 'fit-content', marginBottom: '10px' }}>
                  {item.protein}
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, flex: 1, marginBottom: '18px' }}>
                  {item.desc}
                </p>

                <a 
                  href={orderLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px',
                    background: '#e63946',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}
                >
                  Order Protein Max <ArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* =========================================================
          SECTION 10 – SOMETHING SWEET AND REFRESHING
          Heading: Cool Down. Sweeten Up.
          Tabs: Shakes · Desserts · Beverages · Kombucha
          CTA: Add a Shake
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
            BEVERAGES & TREATS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '12px' }}>
            Cool Down. Sweeten Up.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '620px', margin: '0 auto' }}>
            Handcrafted thick shakes, artisanal desserts, sparkling sodas, and probiotic kombucha.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'inline-flex', gap: '8px', marginTop: '24px', background: '#1e2124', padding: '6px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'shakes', label: 'Shakes' },
              { id: 'desserts', label: 'Desserts' },
              { id: 'beverages', label: 'Beverages' },
              { id: 'kombucha', label: 'Kombucha' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSweetTab(tab.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '24px',
                  border: 'none',
                  background: selectedSweetTab === tab.id ? '#e63946' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shakes Display */}
        {selectedSweetTab === 'shakes' && (
          <div className="grid-5">
            {shakesList.map((shake, idx) => (
              <div key={idx} className="hover-lift" style={{ ...cardStyle, padding: '18px', textAlign: 'center' }}>
                <img src={shake.image} alt={shake.name} style={{ height: '120px', width: 'auto', margin: '0 auto 12px auto', objectFit: 'contain' }} onError={(e) => { e.target.src = '/hero_wide_gyro.png' }} />
                {shake.badge && (
                  <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ffd700', color: '#000', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px' }}>
                    {shake.badge}
                  </span>
                )}
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{shake.name}</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{shake.sub}</p>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#ffd700' }}>{shake.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* Desserts Display */}
        {selectedSweetTab === 'desserts' && (
          <div className="grid-3">
            {dessertsList.map((d, idx) => (
              <div key={idx} className="hover-lift" style={{ ...cardStyle, padding: '24px', textAlign: 'center' }}>
                <img src={d.image} alt={d.name} style={{ height: '130px', width: 'auto', margin: '0 auto 14px auto', objectFit: 'contain' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#e63946', color: '#fff', padding: '2px 10px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px' }}>
                  {d.badge}
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{d.name}</h4>
                <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px' }}>{d.sub}</p>
                <div style={{ fontSize: '19px', fontWeight: 900, color: '#ffd700' }}>{d.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* Beverages Display */}
        {selectedSweetTab === 'beverages' && (
          <div className="grid-4">
            {beveragesList.map((bev, idx) => (
              <div key={idx} className="hover-lift" style={{ ...cardStyle, padding: '22px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(255,255,255,0.1)', color: '#ffd700', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px' }}>
                  {bev.badge}
                </span>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{bev.name}</h4>
                <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px' }}>{bev.sub}</p>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700' }}>{bev.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* Kombucha Display */}
        {selectedSweetTab === 'kombucha' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px', color: '#34d399', fontWeight: 700, fontSize: '14px' }}>
              Organic Raw Fermented Kombucha · ₹120 per bottle
            </div>
            <div className="grid-4">
              {kombuchaList.map((k, idx) => (
                <div key={idx} className="hover-lift" style={{ ...cardStyle, padding: '18px', textAlign: 'center' }}>
                  <img src={k.image} alt={k.name} style={{ height: '110px', width: 'auto', margin: '0 auto 10px auto', objectFit: 'contain' }} onError={(e) => { e.target.src = '/hero_wide_gyro.png' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{k.name}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{k.sub}</p>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffd700' }}>{k.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <a
            href={orderLink}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              backgroundColor: '#e63946',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Add a Shake <ArrowRight size={15} />
          </a>
        </div>
      </section>


      {/* =========================================================
          SECTION 11 – OUR STORY (Short Version)
          Heading: Gyros, Rebuilt Around You
          Body: TDG, short for Ten Dens Gyros, is a modern Greek-inspired food brand with one hero: the gyro.
          We start with the bread, baked or fried. Then it's your turn. A spread, a sauce, your vegetables, your protein. The same menu can make a dozen different gyros, and the right one is whichever you build.
          CTA: Read Our Story
          ========================================================= */}
      <section id="our-story" style={{
        padding: '80px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          ...cardStyle,
          padding: '44px 36px',
          background: 'linear-gradient(135deg, #2d3136, #212427)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }} />

          <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '10px' }}>
            THE TDG STORY
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, marginBottom: '20px', maxWidth: '700px' }}>
            Gyros, Rebuilt Around You
          </h2>

          <p style={{ color: '#cbd5e1', fontSize: '17px', lineHeight: 1.8, maxWidth: '780px', marginBottom: '18px' }}>
            TDG, short for <strong>Ten Dens Gyros</strong>, is a modern Greek-inspired food brand with one hero: the gyro.
          </p>

          <p style={{ color: '#94a3b8', fontSize: '15.5px', lineHeight: 1.8, maxWidth: '780px', marginBottom: '32px' }}>
            We start with the bread, baked or fried. Then it's your turn. A spread, a sauce, your vegetables, your protein. The same menu can make a dozen different gyros, and the right one is whichever you build.
          </p>

          <button
            onClick={() => setShowMenuModal(true)}
            style={{
              padding: '13px 30px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255, 215, 0, 0.5)',
              background: 'rgba(255, 215, 0, 0.08)',
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Read Our Story <ArrowRight size={15} />
          </button>
        </div>
      </section>


      {/* =========================================================
          SECTION 12 – FINAL CONVERSION BANNER
          Headline: Your Gyro Is One Order Away. 
          Subline: Pick your bread. Pick your sauce. We'll handle the rest. 
          Buttons: Order Your Gyro · Explore the Menu
          ========================================================= */}
      <section style={{
        padding: '70px 40px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #b91c1c, #e63946, #7f1d1d)',
          padding: '60px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/hero_wide_gyro.png) center/cover no-repeat',
            opacity: 0.12,
            mixBlendMode: 'overlay'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 'clamp(30px, 4.5vw, 48px)',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '14px',
              letterSpacing: '-0.5px'
            }}>
              Your Gyro Is One Order Away.
            </h2>

            <p style={{
              fontSize: '17px',
              color: '#fee2e2',
              marginBottom: '32px',
              fontWeight: 500,
              maxWidth: '560px',
              margin: '0 auto 32px auto'
            }}>
              Pick your bread. Pick your sauce. We'll handle the rest.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href={orderLink}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#b91c1c',
                  padding: '15px 32px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                }}
              >
                Order Your Gyro <ArrowRight size={16} />
              </a>

              <button 
                onClick={() => setShowMenuModal(true)}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  padding: '15px 28px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Explore the Menu
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 13 – FOOTER
          Columns: Brand, Menu, Company, Order, Contact, Location & Hours, Social, Legal
          Footer line: © 2026 TDG – Ten Dens Gyros. All rights reserved.
          ========================================================= */}
      <footer id="find-us" style={{
        background: '#191b1e',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '60px 40px 30px 40px',
        color: '#94a3b8'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '36px',
            marginBottom: '48px'
          }}>
            {/* Column 1: Brand */}
            <div>
              <img 
                src="/tdg-logo.png" 
                alt="TDG" 
                style={{ height: '44px', width: 'auto', marginBottom: '14px', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/favicon.svg' }}
              />
              <p style={{ color: '#ffd700', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                “Baked Greek gyros. Built your way.”
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                Freshly baked breads, authentic Tzatziki, flame-grilled protein, and 5 signature craft sauces.
              </p>
            </div>

            {/* Column 2: Menu */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', marginBottom: '14px' }}>
                MENU
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><a href="#gyros" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Gyros</a></li>
                <li><a href="#meal-deals" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Meal Deals</a></li>
                <li><button onClick={() => setShowMenuModal(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>Fried Chicken</button></li>
                <li><button onClick={() => setShowMenuModal(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>Sides</button></li>
                <li><button onClick={() => setShowMenuModal(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>Shakes & Desserts</button></li>
                <li><a href="#gyros" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Protein Max</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', marginBottom: '14px' }}>
                COMPANY
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><a href="#our-story" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Our Story</a></li>
                <li><a href="#find-us" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Find Us</a></li>
                <li><a href="#contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</a></li>
                <li><a href={orderLink} style={{ color: '#ffd700', textDecoration: 'none', fontWeight: 700 }}>Order Now</a></li>
              </ul>
            </div>

            {/* Column 4: Contact & Social */}
            <div id="contact">
              <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', marginBottom: '14px' }}>
                CONTACT
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#ffd700" />
                  <span>+91 94882 12424</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={14} color="#ffd700" />
                  <span>WhatsApp Available</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="#ffd700" />
                  <span>info@tendensgyros.com</span>
                </li>
                <li style={{ marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                  Social: Instagram · Facebook · YouTube
                </li>
              </ul>
            </div>

            {/* Column 5: Location & Hours */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', marginBottom: '14px' }}>
                LOCATION & HOURS
              </h4>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>
                <MapPin size={14} color="#ffd700" style={{ display: 'inline', marginRight: '4px' }} />
                Pondicherry Outlet
              </p>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                <Clock size={14} color="#10b981" style={{ display: 'inline', marginRight: '4px' }} />
                Open Daily: 11:00 AM – 11:00 PM
              </p>
            </div>
          </div>

          {/* Legal and Disclaimer Row */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div>
              © 2026 TDG – Ten Dens Gyros. All rights reserved.
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowPrivacyPolicy(true)} 
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >
                Privacy Policy
              </button>
              <span>·</span>
              <span>Terms of Use</span>
              <span>·</span>
              <span>Allergen & Dietary Information</span>
              <span>·</span>
              <span>FSSAI Lic. Registered</span>
            </div>
          </div>
        </div>
      </footer>


      {/* =========================================================
          MODAL: PHYSICAL MENU CARD PREVIEW
          ========================================================= */}
      <AnimatePresence>
        {showMenuModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: '#1e2124',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#25292e'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#ffd700" />
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>Official TDG Menu Card</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setActiveMenuPage(activeMenuPage === 1 ? 2 : 1)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                      background: 'rgba(255, 215, 0, 0.1)',
                      color: '#ffd700',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Page {activeMenuPage === 1 ? '2' : '1'}
                  </button>
                  <button
                    onClick={() => setShowMenuModal(false)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body: Menu Image Preview */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', justifyContent: 'center', background: '#121416' }}>
                <img 
                  src={activeMenuPage === 1 ? '/menu_card_page1.jpg' : '/menu_card_page2.jpg'} 
                  alt={`Menu Page ${activeMenuPage}`}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                />
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#25292e'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Showing Page {activeMenuPage} of 2
                </span>
                <a 
                  href={orderLink}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    background: '#e63946',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  Order Online Now →
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* =========================================================
          MODAL: PRIVACY POLICY
          ========================================================= */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: '#1e2124',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Privacy Policy</h3>
                <button onClick={() => setShowPrivacyPolicy(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', fontSize: '13.5px', lineHeight: 1.7, color: '#cbd5e1' }}>
                <h4 style={{ color: '#ffd700', marginBottom: '8px' }}>1. Information We Collect</h4>
                <p style={{ marginBottom: '16px' }}>We collect customer names and phone numbers strictly for billing, KOT generation, loyalty points in My Den, and order fulfillment.</p>

                <h4 style={{ color: '#ffd700', marginBottom: '8px' }}>2. How We Use Information</h4>
                <p style={{ marginBottom: '16px' }}>Your information is never sold to third parties. We use your details only to send digital bills, order status notifications via WhatsApp, and calculate loyalty points.</p>

                <h4 style={{ color: '#ffd700', marginBottom: '8px' }}>3. Food Safety & Standards</h4>
                <p>All meat, produce, and spreads are prepared in compliance with Food Safety and Standards Authority of India (FSSAI) hygiene regulations.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#e63946',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: 90
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

    </div>
  )
}
